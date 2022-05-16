import Arweave from 'arweave';
import Transaction from 'arweave/node/lib/transaction';
import { readFileSync } from 'fs';

const client = new Arweave({
  host: 'arweave.net',
});
const jwk = JSON.parse(readFileSync('./arweave.json', 'utf-8'));

async function createVanityTx(): Promise<Transaction> {
  const path = `./logos/${process.argv[2]}.svg`;

  const tx = await client.createTransaction(
    {
      data: readFileSync(path),
    },
    jwk
  );

  tx.addTag('Content-Type', 'image/svg+xml');
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
