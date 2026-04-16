import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

export default async function swaggerPlugin(fastify) {
  await fastify.register(fastifySwagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'OpenShelf Library API',
        description: 'REST API for the OpenShelf Library management system',
        version: '2.0.0',
      },
      tags: [
        { name: 'Home', description: 'Dashboard and statistics' },
        { name: 'Books', description: 'Book catalog management' },
        { name: 'Members', description: 'Library member management' },
        { name: 'Loans', description: 'Book loan and checkout management' },
      ],
    },
  });

  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/docs',
  });
}
