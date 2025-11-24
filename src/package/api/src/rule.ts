import type { z } from 'zod';

import Contract from './contract.js';
import Endpoint from './endpoint.js';
import Method from './method.js';
import Resolver from './resolver.js';

class Rule {
    readonly #contract: Contract;
    readonly #resolver: Resolver;

    private constructor(contract: Contract, resolver: Resolver) {
        if (!(contract instanceof Contract)) throw new Error('contract must be a Contract');
        if (!(resolver instanceof Resolver)) throw new Error('resolver must be a Resolver');
        if (!contract.endpoint.equals(resolver.endpoint)) {
            throw new Error(
                `Contract and Resolver endpoints do not match.\nContract: ${contract.endpoint}\nResolver: ${resolver.endpoint}`,
            );
        }

        this.#contract = contract;
        this.#resolver = resolver;
    }

    get contract(): Contract {
        return this.#contract;
    }
    get resolver(): Resolver {
        return this.#resolver;
    }
    get endpoint(): Endpoint {
        return this.#contract.endpoint;
    }
    get version(): number {
        return this.#contract.version;
    }
    get path(): string {
        return this.#contract.path;
    }
    get method(): Method {
        return this.#contract.method;
    }
    get inputSchema(): z.ZodTypeAny {
        return this.#contract.inputSchema;
    }
    get outputSchema(): z.ZodTypeAny {
        return this.#contract.outputSchema;
    }
    get procedure(): (input: unknown) => unknown | Promise<unknown> {
        return this.#resolver.procedure;
    }

    static mk(contract: Contract, resolver: Resolver): Rule {
        return new Rule(contract, resolver);
    }

    static equals(r1: Rule | unknown, r2: Rule | unknown): boolean {
        return (
            r1 instanceof Rule &&
            r2 instanceof Rule &&
            r1.#contract === r2.#contract &&
            r1.#resolver === r2.#resolver
        );
    }

    hash(): string {
        return this.endpoint.hash();
    }

    equals(other: unknown): boolean {
        return Rule.equals(this, other);
    }
}

export default Rule;
