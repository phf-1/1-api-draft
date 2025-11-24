import Method from './method.js';

class Endpoint {
    readonly #version: number;
    readonly #method: Method;
    readonly #path: string;

    private constructor(version: number, method: Method, path: string) {
        if (!Number.isInteger(version) || version <= 0) {
            throw new Error('version must be a positive integer');
        }
        if (!(method instanceof Method)) throw new Error('method must be a Method instance');
        if (typeof path !== 'string') throw new Error('path must be a string');

        this.#version = version;
        this.#method = method;
        this.#path = path;
    }

    get version(): number {
        return this.#version;
    }
    get method(): Method {
        return this.#method;
    }
    get path(): string {
        return this.#path;
    }

    static mk(version: number, method: Method, path: string): Endpoint {
        return new Endpoint(version, method, path);
    }

    static equals(endpoint1: Endpoint | unknown, endpoint2: Endpoint | unknown): boolean {
        return (
            endpoint1 instanceof Endpoint &&
            endpoint2 instanceof Endpoint &&
            endpoint1.version === endpoint2.version &&
            endpoint1.method.equals(endpoint2.method) &&
            endpoint1.path === endpoint2.path
        );
    }

    hash(): string {
        return `${this.#version}:${this.#method.value}:${this.#path}`;
    }

    equals(other: unknown): boolean {
        return Endpoint.equals(this, other);
    }

    toString(): string {
        return `Endpoint(${this.#version} ${this.#method.value.toUpperCase()} ${this.#path})`;
    }
}

export default Endpoint;
