import { z } from 'zod';

import Endpoint from './endpoint.js';
import Method from './method.js';

class Contract {
    readonly #endpoint: Endpoint;
    readonly #inputSchema: z.ZodTypeAny;
    readonly #outputSchema: z.ZodTypeAny;

    private constructor(endpoint: Endpoint, inputSchema: z.ZodTypeAny, outputSchema: z.ZodTypeAny) {
        if (!(endpoint instanceof Endpoint)) throw new Error('endpoint is not an Endpoint');
        if (!(inputSchema instanceof z.ZodType)) throw new Error('inputSchema is not a Zod schema');
        if (!(outputSchema instanceof z.ZodType))
            throw new Error('outputSchema is not a Zod schema');

        this.#endpoint = endpoint;
        this.#inputSchema = inputSchema;
        this.#outputSchema = outputSchema;
    }

    get endpoint(): Endpoint {
        return this.#endpoint;
    }
    get version(): number {
        return this.#endpoint.version;
    }
    get path(): string {
        return this.#endpoint.path;
    }
    get method(): Method {
        return this.#endpoint.method;
    }
    get inputSchema(): z.ZodTypeAny {
        return this.#inputSchema;
    }
    get outputSchema(): z.ZodTypeAny {
        return this.#outputSchema;
    }

    static mk(endpoint: Endpoint, inputSchema: z.ZodTypeAny, outputSchema: z.ZodTypeAny): Contract {
        return new Contract(endpoint, inputSchema, outputSchema);
    }

    static equals(c1: Contract | unknown, c2: Contract | unknown): boolean {
        return c1 instanceof Contract && c2 instanceof Contract && c1.endpoint.equals(c2.endpoint);
    }

    hash(): string {
        return this.#endpoint.hash();
    }

    equals(other: unknown): boolean {
        return Contract.equals(this, other);
    }

    toString(): string {
        return `Contract(${this.#endpoint} → ${this.#inputSchema} → ${this.#outputSchema})`;
    }
}

export default Contract;
