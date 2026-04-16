export const LoanResponse = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    book_id: { type: 'integer' },
    member_id: { type: 'integer' },
    loan_date: { type: 'string', format: 'date' },
    due_date: { type: 'string', format: 'date' },
    return_date: { type: ['string', 'null'], format: 'date' },
    status: { type: 'string', enum: ['active', 'returned', 'overdue'] },
    title: { type: 'string' },
    author: { type: 'string' },
    member_name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
};

export const LoanStatisticsResponse = {
  type: 'object',
  properties: {
    active: { type: 'integer' },
    overdue: { type: 'integer' },
    returned: { type: 'integer' },
  },
};

export const CheckoutBody = {
  type: 'object',
  required: ['book_id', 'member_id'],
  properties: {
    book_id: { type: 'integer' },
    member_id: { type: 'integer' },
    due_date: { type: 'string', format: 'date' },
  },
};

export const IdParam = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
  },
  required: ['id'],
};
