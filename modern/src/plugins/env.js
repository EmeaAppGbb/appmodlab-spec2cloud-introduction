import fastifyEnv from '@fastify/env';

const schema = {
  type: 'object',
  properties: {
    PORT: { type: 'integer', default: 3000 },
    HOST: { type: 'string', default: '0.0.0.0' },
    DATABASE_URL: {
      type: 'string',
      default: 'postgresql://localhost:5432/openshelf',
    },
  },
};

export default async function envPlugin(fastify) {
  await fastify.register(fastifyEnv, { schema, dotenv: true });
}
