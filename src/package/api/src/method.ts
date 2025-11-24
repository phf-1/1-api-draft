class Method {
    readonly #value: string;

    private constructor(value: string) {
        if (typeof value !== 'string') throw new Error('Method value must be a string');
        this.#value = value.toLowerCase();
    }

    static mk(value: string): Method {
        return new Method(value);
    }

    static parse(name: string): Method {
        const lower = name.toLowerCase();
        if (lower === 'get') return Method.GET;
        if (lower === 'post') return Method.POST;
        throw new Error(`Unsupported HTTP method: ${name}`);
    }

    get value(): string {
        return this.#value;
    }

    static equals(m1: Method | unknown, m2: Method | unknown): boolean {
        return m1 instanceof Method && m2 instanceof Method && m1.#value === m2.#value;
    }

    equals(other: unknown): boolean {
        return Method.equals(this, other);
    }

    toString(): string {
        return `Method(${this.#value.toUpperCase()})`;
    }

    // Static singletons
    static readonly GET = Method.mk('get');
    static readonly POST = Method.mk('post');
}

export default Method;
