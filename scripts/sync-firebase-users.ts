import { listAdminUsers } from "../lib/adminUsers";

async function main() {
  const users = await listAdminUsers();
  const roles = users.reduce<Record<string, number>>((counts, user) => {
    counts[user.accountRole] = (counts[user.accountRole] || 0) + 1;
    return counts;
  }, {});
  console.log(JSON.stringify({ synced: users.length, roles }, null, 2));
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : "User sync failed");
  process.exitCode = 1;
});
