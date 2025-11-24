import type { Express } from 'express';
import { z } from 'zod';
import Contract from './contract.js';
import Endpoint from './endpoint.js';
import Method from './method.js';
import Resolver from './resolver.js';
import Rule from './rule.js';

const dataChecker = (schema: z.ZodTypeAny) => (data: unknown) => schema.parse(data);

const installRule = (app: Express, rule: Rule): Express => {
    const method = rule.method.value as 'get' | 'post';
    const version = rule.version;
    const path = rule.path;
    const apiPath = `/api/v${version}${path}`;

    const inputCheck = dataChecker(rule.inputSchema);
    const outputCheck = dataChecker(rule.outputSchema);
    const procedure = rule.procedure;

    app[method](apiPath, async (request, response) => {
        const body = request.body as unknown;

        // 1. Input validation
        try {
            inputCheck(body);
        } catch {
            response.status(400).json({ error: 'Client error' });
            return;
        }

        // 2. Procedure execution
        let reply: unknown;
        try {
            reply = await procedure(body);
        } catch (error) {
            console.error('procedure failed', error);
            response.status(500).json({ error: 'Server error' });
            return;
        }

        // 3. Output validation
        try {
            outputCheck(reply);
        } catch {
            console.error('unexpected reply', reply);
            response.status(500).json({ error: 'Server error' });
            return;
        }

        response.status(200).json(reply);
    });

    return app;
};

export type ApiTableRow = readonly [
    version: number,
    method: 'get' | 'post',
    path: string,
    inputSchema: z.ZodTypeAny,
    outputSchema: z.ZodTypeAny,
    procedure: (input: unknown) => unknown,
];

class Api {
    readonly #rules: ReadonlyMap<string, Rule>;

    private constructor(contracts: Set<Contract>, resolvers: Set<Resolver>) {
        const resolverIndex = new Map<string, Resolver>();
        for (const resolver of resolvers) {
            resolverIndex.set(resolver.endpoint.hash(), resolver);
        }

        const rules = new Map<string, Rule>();
        for (const contract of contracts) {
            const hash = contract.endpoint.hash();
            const resolver = resolverIndex.get(hash);
            if (!resolver) {
                throw new Error(`No resolver found for contract with hash: ${hash}`);
            }
            resolverIndex.delete(hash);
            const rule = Rule.mk(contract, resolver);
            rules.set(hash, rule);
        }

        if (resolverIndex.size > 0) {
            const remaining = [...resolverIndex.keys()].join(', ');
            throw new Error(`Extra resolvers without matching contracts: [${remaining}]`);
        }

        this.#rules = rules;
    }

    static mk(contracts: Set<Contract>, resolvers: Set<Resolver>): Api {
        return new Api(contracts, resolvers);
    }

    static parseContractsTable(
        table: [number, string, string, z.ZodTypeAny, z.ZodTypeAny][],
    ): Set<Contract> {
        return new Set(
            table.map(([version, methodString, path, input, output]) => {
                const endpoint = Endpoint.mk(version, Method.parse(methodString), path);
                return Contract.mk(endpoint, input, output);
            }),
        );
    }

    static parseResolversTable(
        table: [number, Method, string, (input: unknown) => unknown][],
    ): Set<Resolver> {
        return new Set(
            table.map(([version, method, path, procedure]) => {
                const endpoint = Endpoint.mk(version, method, path);
                return Resolver.mk(endpoint, procedure);
            }),
        );
    }

    static fromTable(table: readonly ApiTableRow[]): Api {
        const contracts = new Set<Contract>();
        const resolvers = new Set<Resolver>();

        for (const [version, methodString, path, input, output, procedure] of table) {
            const endpoint = Endpoint.mk(version, Method.parse(methodString), path);
            contracts.add(Contract.mk(endpoint, input, output));
            resolvers.add(Resolver.mk(endpoint, procedure));
        }

        return Api.mk(contracts, resolvers);
    }

    install(app: Express): Express {
        for (const rule of this.#rules.values()) {
            installRule(app, rule);
        }
        return app;
    }

    toString(): string {
        const entries = [...this.#rules.entries()].map(([k, v]) => `${k} => ${v}`).join(', ');
        return `Api { ${entries} }`;
    }
}

export default Api;
