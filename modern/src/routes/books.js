import Book from '../models/book.js';
import { BookResponse, BookCreateBody, BookUpdateBody, IdParam } from '../schemas/book.js';

export default async function booksRoutes(fastify) {
  const book = new Book(fastify.db);

  // GET /api/v1/books
  fastify.get('/', {
    schema: {
      tags: ['Books'],
      summary: 'List all books',
      querystring: {
        type: 'object',
        properties: {
          search: { type: 'string', default: '' },
        },
      },
      response: { 200: { type: 'array', items: BookResponse } },
    },
    handler: async (request) => {
      return book.findAll(request.query.search);
    },
  });

  // GET /api/v1/books/:id
  fastify.get('/:id', {
    schema: {
      tags: ['Books'],
      summary: 'Get a book by ID',
      params: IdParam,
      response: { 200: BookResponse },
    },
    handler: async (request, reply) => {
      const result = await book.findById(request.params.id);
      if (!result) return reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Book not found' });
      return result;
    },
  });

  // POST /api/v1/books
  fastify.post('/', {
    schema: {
      tags: ['Books'],
      summary: 'Create a new book',
      body: BookCreateBody,
      response: { 201: BookResponse },
    },
    handler: async (request, reply) => {
      try {
        const created = await book.create(request.body);
        return reply.code(201).send(created);
      } catch (err) {
        return reply.code(400).send({ statusCode: 400, error: 'Bad Request', message: err.message });
      }
    },
  });

  // PUT /api/v1/books/:id
  fastify.put('/:id', {
    schema: {
      tags: ['Books'],
      summary: 'Update a book',
      params: IdParam,
      body: BookUpdateBody,
      response: { 200: BookResponse },
    },
    handler: async (request, reply) => {
      try {
        const updated = await book.update(request.params.id, request.body);
        if (!updated) return reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Book not found' });
        return updated;
      } catch (err) {
        return reply.code(400).send({ statusCode: 400, error: 'Bad Request', message: err.message });
      }
    },
  });

  // DELETE /api/v1/books/:id
  fastify.delete('/:id', {
    schema: {
      tags: ['Books'],
      summary: 'Delete a book',
      params: IdParam,
    },
    handler: async (request, reply) => {
      try {
        const deleted = await book.delete(request.params.id);
        if (!deleted) return reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Book not found' });
        return reply.code(204).send();
      } catch (err) {
        return reply.code(400).send({ statusCode: 400, error: 'Bad Request', message: err.message });
      }
    },
  });
}
