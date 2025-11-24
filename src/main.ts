import Server from './server.js';
const port = Number(process.env.PORT);
if (!port) throw new Error('PORT environment variable is required');
Server.mk(port).start();
