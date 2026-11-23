// LIVE: creates (or resets the password of) an admin user in the REMOTE Cloudflare D1 database.
//   npm run create-admin:remote
// You type the email and the password (hidden) in this terminal. The password is hashed here (PBKDF2, same as the site),
// and only the hash is sent to the database. Nothing is stored in the project, and the password is never an argument.
// Needs `npx wrangler login` first. For the local database use `npm run create-admin` instead.
import readline from 'node:readline';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { hashPassword } from '../src/lib/auth-crypto.ts';
import { buildAdminSql, validateEmail, validatePassword } from './lib/admin-sql.mjs';

const DATABASE = 'altara-db';

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (text) => {
        if (text.includes(question)) process.stdout.write(question);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      resolve(answer);
    });
  });
}

if (!process.stdin.isTTY) {
  console.error('Run this in an interactive terminal: it asks you to type the email and a hidden password.');
  process.exit(1);
}

console.log(`\nThis changes the LIVE database "${DATABASE}" on Cloudflare.\n`);

const email = (await ask('Admin email: ')).trim().toLowerCase();
if (!validateEmail(email)) {
  console.error('That does not look like a valid email address (name@domain.com).');
  process.exit(1);
}

const password = await ask('Password (12+ characters, hidden): ', { hidden: true });
const problem = validatePassword(password);
if (problem) {
  console.error(problem);
  process.exit(1);
}
if (password !== (await ask('Repeat password: ', { hidden: true }))) {
  console.error('Passwords do not match.');
  process.exit(1);
}

const confirm = (await ask(`Create or update the admin ${email} on the LIVE database? Type YES to continue: `)).trim();
if (confirm !== 'YES') {
  console.log('Cancelled. Nothing was changed.');
  process.exit(0);
}

const sql = buildAdminSql(email, await hashPassword(password));

// wrangler reads the SQL from a short-lived temp file that holds only the hash; it is deleted straight after.
const dir = mkdtempSync(join(tmpdir(), 'altara-admin-'));
const file = join(dir, 'admin.sql');
try {
  writeFileSync(file, sql, { mode: 0o600 });
  const result = spawnSync('npx', ['wrangler', 'd1', 'execute', DATABASE, '--remote', `--file="${file}"`], {
    stdio: 'inherit',
    shell: true,
  });
  if (result.status !== 0) {
    console.error('\nwrangler failed, so the live database was not changed. Check `npx wrangler whoami` and try again.');
    process.exit(result.status ?? 1);
  }
  console.log(`\nDone. ${email} can now sign in at /admin/login on the live site.`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
