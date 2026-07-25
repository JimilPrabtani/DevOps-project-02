/**
 * Request body validation.
 *
 * WHY: the old handlers destructured `req.body` and passed the values straight
 * into bcrypt and SQL. Parameterised queries meant no SQL injection, but a
 * non-string password crashed bcrypt (500), and there were no length limits —
 * a multi-megabyte password string would burn CPU in the hashing round.
 */

export class ValidationError extends Error {
  public readonly fields: Record<string, string>;
  constructor(fields: Record<string, string>) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

// Deliberately simple and strict. Full RFC 5322 parsing is not the goal;
// rejecting obvious junk and bounding length is.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_EMAIL = 254;
const MIN_PASSWORD = 12;
// bcrypt silently truncates at 72 bytes; reject longer rather than pretend.
const MAX_PASSWORD = 72;
const MAX_NAME = 100;

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export function validateRegister(body: unknown): RegisterInput {
  const fields: Record<string, string> = {};
  const b = (body ?? {}) as Record<string, unknown>;

  const email = asString(b.email)?.trim().toLowerCase() ?? '';
  const password = asString(b.password) ?? '';
  const firstName = asString(b.firstName)?.trim() ?? '';
  const lastName = asString(b.lastName)?.trim() ?? '';

  if (!email) fields.email = 'Email is required';
  else if (email.length > MAX_EMAIL) fields.email = 'Email is too long';
  else if (!EMAIL_RE.test(email)) fields.email = 'Email format is invalid';

  if (!password) fields.password = 'Password is required';
  else if (password.length < MIN_PASSWORD)
    fields.password = `Password must be at least ${MIN_PASSWORD} characters`;
  else if (password.length > MAX_PASSWORD)
    fields.password = `Password must be at most ${MAX_PASSWORD} characters`;

  if (!firstName) fields.firstName = 'First name is required';
  else if (firstName.length > MAX_NAME) fields.firstName = 'First name is too long';

  if (!lastName) fields.lastName = 'Last name is required';
  else if (lastName.length > MAX_NAME) fields.lastName = 'Last name is too long';

  if (Object.keys(fields).length > 0) throw new ValidationError(fields);

  return { email, password, firstName, lastName };
}

export interface LoginInput {
  email: string;
  password: string;
}

export function validateLogin(body: unknown): LoginInput {
  const fields: Record<string, string> = {};
  const b = (body ?? {}) as Record<string, unknown>;

  const email = asString(b.email)?.trim().toLowerCase() ?? '';
  const password = asString(b.password) ?? '';

  if (!email) fields.email = 'Email is required';
  else if (email.length > MAX_EMAIL) fields.email = 'Email is too long';

  if (!password) fields.password = 'Password is required';
  else if (password.length > MAX_PASSWORD) fields.password = 'Password is too long';

  if (Object.keys(fields).length > 0) throw new ValidationError(fields);

  return { email, password };
}
