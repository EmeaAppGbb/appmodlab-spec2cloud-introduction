import Loan from '../models/loan.js';

export default async function homeRoutes(fastify) {
  fastify.get('/', {
    schema: {
      tags: ['Home'],
      summary: 'Dashboard statistics',
      description: 'Returns aggregate library statistics: total books, active members, active loans, overdue loans.',
      response: {
        200: {
          type: 'object',
          properties: {
            total_books: { type: 'integer' },
            active_members: { type: 'integer' },
            active_loans: { type: 'integer' },
            overdue_loans: { type: 'integer' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { rows: [bookStats] } = await fastify.db.query('SELECT COUNT(*) AS total FROM books');
      const { rows: [memberStats] } = await fastify.db.query(
        `SELECT COUNT(*) AS total FROM members WHERE status = 'active'`,
      );
      const loan = new Loan(fastify.db);
      const stats = await loan.getStatistics();

      return {
        total_books: parseInt(bookStats.total, 10),
        active_members: parseInt(memberStats.total, 10),
        active_loans: stats.active,
        overdue_loans: stats.overdue,
      };
    },
  });
}
