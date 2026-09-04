import { migrateChakyruData } from "../lib/server/migrate";

async function main() {
  const result = await migrateChakyruData();
  for (const line of result.log) {
    console.log(line);
  }
  console.log(JSON.stringify({ accessWrites: result.accessWrites, purchaseWrites: result.purchaseWrites }));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
