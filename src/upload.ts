import Arweave from 'arweave';
import Transaction from 'arweave/node/lib/transaction';
import { readFileSync } from 'fs';

const client = new Arweave({
  host: 'arweave.net',
});
const jwk = JSON.parse(readFileSync('./arweave.json', 'utf-8'));

async function createVanityTx(): Promise<Transaction> {
  const path = process.argv[2];

  let type: string | undefined;
  if (path.endsWith('.json')) type = 'application/json';
  if (path.endsWith('.svg')) type = 'image/svg+xml';

  const tx = await client.createTransaction(
    {
      data: readFileSync(path),
    },
    jwk
  );

  if (type) tx.addTag('Content-Type', type);
  await client.transactions.sign(tx, jwk);

  if (tx.id.includes('-') || tx.id.includes('_')) {
    return await createVanityTx();
  }

  return tx;
}

(async () => {
  const tx = await createVanityTx();
  await client.transactions.post(tx);

  console.log(tx.id);
})();
