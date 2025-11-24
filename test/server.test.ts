import request from 'supertest';
import { describe, expect, test } from 'vitest';

import Server from '../src/server.js';

const port: number = Number(process.env.PORT);
if (!port) {
    throw new Error('PORT environment variable is required');
}

describe('/api/v1/hello', () => {
    test('given: a GET request, should: return a 200 with world message.', async () => {
        const app = Server.mk(port).app;
        const actual = await request(app).get('/api/v1/hello').expect(200);
        const expected = { message: 'world' };
        expect(actual.body).toEqual(expected);
    });
});

describe('/api/v1/user', () => {
    test('given: a POST request, should: return a 200 with user data.', async () => {
        const app = Server.mk(port).app;
        const user = { name: 'Alice' };
        const actual = await request(app).post('/api/v1/user').send(user).expect(200);
        const expected = { id: 1, name: user.name };
        expect(actual.body).toEqual(expected);
    });
});
