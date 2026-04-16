import Loan from '../models/loan.js';
import { LoanResponse, LoanStatisticsResponse, CheckoutBody, IdParam } from '../schemas/loan.js';

export default async function loansRoutes(fastify) {
  const loan = new Loan(fastify.db);

  // GET /api/v1/loans
  fastify.get('/', {
    schema: {
      tags: ['Loans'],
      summary: 'List loans',
      description: 'Lists loans with optional status filter. Auto-updates overdue statuses before listing.',
      querystring: {
        type: 'object',
        properties: {
          filter: { type: 'string', enum: ['active', 'overdue', 'returned', 'all'], default: 'active' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            loans: { type: 'array', items: LoanResponse },
            statistics: LoanStatisticsResponse,
          },
        },
      },
    },
    handler: async (request) => {
      await loan.updateOverdueStatus();
      const [loans, statistics] = await Promise.all([
        loan.findAll(request.query.filter),
        loan.getStatistics(),
      ]);
      return { loans, statistics };
    },
  });

  // GET /api/v1/loans/statistics — must be before /:id to avoid param collision
  fastify.get('/statistics', {
    schema: {
      tags: ['Loans'],
      summary: 'Loan statistics',
      response: { 200: LoanStatisticsResponse },
    },
    handler: async () => {
      return loan.getStatistics();
    },
  });

  // GET /api/v1/loans/:id
  fastify.get('/:id', {
    schema: {
      tags: ['Loans'],
      summary: 'Get a loan by ID',
      params: IdParam,
      response: { 200: LoanResponse },
    },
    handler: async (request, reply) => {
      const result = await loan.findById(request.params.id);
      if (!result) return reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Loan not found' });
      return result;
    },
  });

  // POST /api/v1/loans/checkout
  fastify.post('/checkout', {
    schema: {
      tags: ['Loans'],
      summary: 'Checkout a book',
      description: 'Creates a new loan. Decrements available copies. Defaults to 14-day loan period.',
      body: CheckoutBody,
      response: { 201: LoanResponse },
    },
    handler: async (request, reply) => {
      try {
        const created = await loan.create(request.body);
        return reply.code(201).send(created);
      } catch (err) {
        return reply.code(400).send({ statusCode: 400, error: 'Bad Request', message: err.message });
      }
    },
  });

  // POST /api/v1/loans/:id/return
  fastify.post('/:id/return', {
    schema: {
      tags: ['Loans'],
      summary: 'Return a book',
      description: 'Marks a loan as returned and increments available copies.',
      params: IdParam,
    },
    handler: async (request, reply) => {
      try {
        const result = await loan.returnBook(request.params.id);
        return result;
      } catch (err) {
        return reply.code(400).send({ statusCode: 400, error: 'Bad Request', message: err.message });
      }
    },
  });
}
