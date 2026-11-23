// Shared by the admin scripts: validation and the SQL that creates / updates an admin user.
// Only the password HASH ever reaches SQL. The password itself is never written anywhere.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const MIN_PASSWORD = 12;
export const MAX_PASSWORD = 200;

export function validateEmail(email) {
  return EMAIL_RE.test(email) && email.length <= 200;
}

export function validatePassword(password) {
  if (password.length < MIN_PASSWORD || password.length > MAX_PASSWORD) {
    return `The password must be ${MIN_PASSWORD} to ${MAX_PASSWORD} characters long.`;
  }
  return '';
}

const q = (value) => `'${String(value).replace(/'/g, "''")}'`;

/** Create the admin, or replace the password of an existing one (and sign out any open sessions). */
export function buildAdminSql(email, passwordHash) {
  if (!validateEmail(email)) throw new Error('Invalid email address.');
  if (!/^pbkdf2\$\d+\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+$/.test(passwordHash)) throw new Error('Unexpected password hash format.');
  return [
    `INSERT INTO admin_users (email, password_hash) VALUES (${q(email)}, ${q(passwordHash)})`,
    `  ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash;`,
    `DELETE FROM admin_sessions WHERE user_id = (SELECT id FROM admin_users WHERE email = ${q(email)});`,
    `DELETE FROM login_attempts WHERE email = ${q(email)};`,
    '',
  ].join('\n');
}
