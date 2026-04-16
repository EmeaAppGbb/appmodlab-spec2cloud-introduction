import Fastify from 'fastify';
import envPlugin from './plugins/env.js';
import dbPlugin from './plugins/db.js';
import swaggerPlugin from './plugins/swagger.js';
import booksRoutes from './routes/books.js';
import membersRoutes from './routes/members.js';
import loansRoutes from './routes/loans.js';
import homeRoutes from './routes/home.js';

async function buildApp(opts = {}) {
  const app = Fastify({
    logger: {
      level: opts.logLevel || 'info',
      ...(process.stdout.isTTY ? { transport: { target: 'pino-pretty' } } : {}),
    },
    ajv: { customOptions: { coerceTypes: true } },
    ...opts,
  });

  // Plugins
  await app.register(envPlugin);
  await app.register(dbPlugin);
  await app.register(swaggerPlugin);

  // Routes
  await app.register(homeRoutes);
  await app.register(booksRoutes, { prefix: '/api/v1/books' });
  await app.register(membersRoutes, { prefix: '/api/v1/members' });
  await app.register(loansRoutes, { prefix: '/api/v1/loans' });

  // Health check
  app.get('/health', async () => ({ status: 'ok' }));

  return app;
}

async function start() {
  const app = await buildApp();
  try {
    const port = app.config?.PORT ?? 3000;
    const host = app.config?.HOST ?? '0.0.0.0';
    await app.listen({ port, host });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();

export { buildApp };
