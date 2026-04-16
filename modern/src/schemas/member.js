export const MemberResponse = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    phone: { type: ['string', 'null'] },
    membership_date: { type: 'string', format: 'date' },
    status: { type: 'string', enum: ['active', 'inactive'] },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' },
  },
};

export const MemberCreateBody = {
  type: 'object',
  required: ['name', 'email'],
  properties: {
    name: { type: 'string', minLength: 1 },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string' },
    membership_date: { type: 'string', format: 'date' },
  },
};

export const MemberUpdateBody = {
  type: 'object',
  required: ['name', 'email', 'status'],
  properties: {
    name: { type: 'string', minLength: 1 },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string' },
    status: { type: 'string', enum: ['active', 'inactive'] },
  },
};

export const IdParam = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
  },
  required: ['id'],
};
