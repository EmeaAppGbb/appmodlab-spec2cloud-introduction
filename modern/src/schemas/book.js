export const BookResponse = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    title: { type: 'string' },
    author: { type: 'string' },
    isbn: { type: ['string', 'null'] },
    genre: { type: ['string', 'null'] },
    published_year: { type: ['integer', 'null'] },
    available_copies: { type: 'integer' },
    total_copies: { type: 'integer' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
};

export const BookCreateBody = {
  type: 'object',
  required: ['title', 'author'],
  properties: {
    title: { type: 'string', minLength: 1 },
    author: { type: 'string', minLength: 1 },
    isbn: { type: 'string' },
    genre: { type: 'string' },
    published_year: { type: 'integer' },
    total_copies: { type: 'integer', minimum: 0, default: 1 },
  },
};

export const BookUpdateBody = {
  type: 'object',
  required: ['title', 'author'],
  properties: {
    title: { type: 'string', minLength: 1 },
    author: { type: 'string', minLength: 1 },
    isbn: { type: 'string' },
    genre: { type: 'string' },
    published_year: { type: 'integer' },
    total_copies: { type: 'integer', minimum: 0 },
  },
};

export const IdParam = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
  },
  required: ['id'],
};
