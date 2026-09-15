// Read-only diagnostic. Never print credentials or user records.
require('@next/env').loadEnvConfig(process.cwd());
const { initializeApp, cert } = require('firebase-admin/app');

async function main() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT is missing');
  const account = JSON.parse(raw);
  console.log('project-matches:', account.project_id === process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  const app = initializeApp({ credential: cert({ ...account, private_key: account.private_key.replace(/\\n/g, '\n') }) });
  const checks = [
    ['auth-read', () => require('firebase-admin/auth').getAuth(app).listUsers(1)],
    ['firestore-read', () => require('firebase-admin/firestore').getFirestore(app).collection('users').limit(1).get()],
  ];
  const results = await Promise.all(checks.map(async ([label, run]) => {
    try {
      await run();
      console.log(label, 'OK');
      return true;
    } catch (error) {
      console.log(label, 'FAILED', error.code || error.name);
      return false;
    }
  }));
  process.exit(results.every(Boolean) ? 0 : 1);
}
setTimeout(() => { console.error('Connection check timed out after 30 seconds'); process.exit(1); }, 30000);
main().catch(error => { console.error('Configuration error:', error.code || error.name); process.exit(1); });
