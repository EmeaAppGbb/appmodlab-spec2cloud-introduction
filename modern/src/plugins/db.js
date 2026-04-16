import pg from 'pg';

const { Pool } = pg;

export default async function dbPlugin(fastify) {
  const pool = new Pool({
    connectionString: fastify.config.DATABASE_URL,
  });

  // Verify connectivity on startup
  await pool.query('SELECT 1');
  fastify.log.info('PostgreSQL connected');

  fastify.decorate('db', pool);

  fastify.addHook('onClose', async () => {
    await pool.end();
    fastify.log.info('PostgreSQL pool closed');
  });
}
