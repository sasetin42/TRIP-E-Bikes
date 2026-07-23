const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Sasetin4242%23@ieijkjjyfgnnypfmieij.backend.onspace.ai:6543/postgres';

const client = new Client({
  connectionString: connectionString,
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to database successfully!");

    const sql = `
      -- Drop the old restrictive SELECT policy
      DROP POLICY IF EXISTS "anon select published products" ON public.products_cms;

      -- Create the new wide SELECT policy for anon users to allow inserting unpublished products (which needs POST-select to succeed)
      CREATE POLICY "anon select published products" ON public.products_cms FOR SELECT TO anon USING (true);
    `;

    await client.query(sql);
    console.log("Row-level security policy updated successfully!");
  } catch (err) {
    console.error("Database operation failed:", err.message, err);
  } finally {
    await client.end();
  }
}

run();
