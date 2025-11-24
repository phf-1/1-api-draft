import Endpoint from './endpoint.js';
import Method from './method.js';

type Procedure = (input: unknown) => Promise<unknown> | unknown;

class Resolver {
    readonly #endpoint: Endpoint;
    readonly #procedure: Procedure;

    private constructor(endpoint: Endpoint, procedure: Procedure) {
        if (!(endpoint instanceof Endpoint)) throw new Error('endpoint must be an Endpoint');
        if (typeof procedure !== 'function') throw new Error('procedure must be a function');

        this.#endpoint = endpoint;
        this.#procedure = procedure;
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
    get procedure(): Procedure {
        return this.#procedure;
    }

    static mk(endpoint: Endpoint, procedure: Procedure): Resolver {
        return new Resolver(endpoint, procedure);
    }

    static equals(r1: Resolver | unknown, r2: Resolver | unknown): boolean {
        return r1 instanceof Resolver && r2 instanceof Resolver && r1.endpoint.equals(r2.endpoint);
    }

    hash(): string {
        return this.#endpoint.hash();
    }

    equals(other: unknown): boolean {
        return Resolver.equals(this, other);
    }

    toString(): string {
        return `Resolver(${this.#endpoint})`;
    }
}

export default Resolver;
