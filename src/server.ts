import type { Express } from 'express';
import express from 'express';
import morgan from 'morgan';
import { z } from 'zod';
import Api from '@1-api-draft/api';

class Server {
    readonly #port: number;
    readonly #app: Express;

    private constructor(port: number) {
        if (!Number.isInteger(port) || port <= 0) {
            throw new Error('port must be a positive integer');
        }
        this.#port = port;

        const apiTable = [
            [1, 'get', '/hello', z.any(), z.any(), () => ({ message: 'world' })],
            [
                1,
                'post',
                '/user',
                z.object({ name: z.string() }),
                z.object({ id: z.number().int().positive(), name: z.string() }),
                (input: unknown) => {
                    const { name } = input as { name: string };
                    return { id: 1, name };
                },
            ],
        ] as const;

        const api = Api.fromTable(apiTable);
        const app = express();
        app.use(express.json());

        const environment = process.env.NODE_ENV || 'development';
        app.use(environment === 'development' ? morgan('dev') : morgan('tiny'));

        api.install(app);

        this.#app = app;
    }

    static mk(port: number): Server {
        return new Server(port);
    }

    get app(): Express {
        return this.#app;
    }

    start(): void {
        const server = this.#app.listen(this.#port, () => {
            console.log(`Server listening on http://localhost:${this.#port}`);
        });

        process.on('SIGTERM', () => {
            console.log('SIGTERM received — shutting down gracefully');
            server.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
        });
    }

    toString(): string {
        return `Server(port=${this.#port})`;
    }
}

export default Server;
