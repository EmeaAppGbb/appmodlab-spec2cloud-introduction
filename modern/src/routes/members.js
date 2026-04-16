import Member from '../models/member.js';
import { MemberResponse, MemberCreateBody, MemberUpdateBody, IdParam } from '../schemas/member.js';

export default async function membersRoutes(fastify) {
  const member = new Member(fastify.db);

  // GET /api/v1/members
  fastify.get('/', {
    schema: {
      tags: ['Members'],
      summary: 'List members',
      querystring: {
        type: 'object',
        properties: {
          include_inactive: { type: 'boolean', default: false },
        },
      },
      response: { 200: { type: 'array', items: MemberResponse } },
    },
    handler: async (request) => {
      return member.findAll(request.query.include_inactive);
    },
  });

  // GET /api/v1/members/:id
  fastify.get('/:id', {
    schema: {
      tags: ['Members'],
      summary: 'Get a member by ID',
      params: IdParam,
      response: { 200: MemberResponse },
    },
    handler: async (request, reply) => {
      const result = await member.findById(request.params.id);
      if (!result) return reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Member not found' });
      return result;
    },
  });

  // POST /api/v1/members
  fastify.post('/', {
    schema: {
      tags: ['Members'],
      summary: 'Create a new member',
      body: MemberCreateBody,
      response: { 201: MemberResponse },
    },
    handler: async (request, reply) => {
      try {
        const created = await member.create(request.body);
        return reply.code(201).send(created);
      } catch (err) {
        return reply.code(400).send({ statusCode: 400, error: 'Bad Request', message: err.message });
      }
    },
  });

  // PUT /api/v1/members/:id
  fastify.put('/:id', {
    schema: {
      tags: ['Members'],
      summary: 'Update a member',
      params: IdParam,
      body: MemberUpdateBody,
      response: { 200: MemberResponse },
    },
    handler: async (request, reply) => {
      try {
        const updated = await member.update(request.params.id, request.body);
        if (!updated) return reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Member not found' });
        return updated;
      } catch (err) {
        return reply.code(400).send({ statusCode: 400, error: 'Bad Request', message: err.message });
      }
    },
  });

  // POST /api/v1/members/:id/deactivate
  fastify.post('/:id/deactivate', {
    schema: {
      tags: ['Members'],
      summary: 'Deactivate a member',
      params: IdParam,
      response: { 200: MemberResponse },
    },
    handler: async (request, reply) => {
      try {
        const result = await member.deactivate(request.params.id);
        if (!result) return reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Member not found' });
        return result;
      } catch (err) {
        return reply.code(400).send({ statusCode: 400, error: 'Bad Request', message: err.message });
      }
    },
  });

  // DELETE /api/v1/members/:id
  fastify.delete('/:id', {
    schema: {
      tags: ['Members'],
      summary: 'Delete a member',
      params: IdParam,
    },
    handler: async (request, reply) => {
      try {
        const deleted = await member.delete(request.params.id);
        if (!deleted) return reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Member not found' });
        return reply.code(204).send();
      } catch (err) {
        return reply.code(400).send({ statusCode: 400, error: 'Bad Request', message: err.message });
      }
    },
  });
}
