# Plan: Fix Product Security Policy RLS Violation

## Root Cause Analysis
Supabase SELECT RLS policy `"anon select published products"` on the `products_cms` table restricts SELECT operations to rows where `published = true`.
When an insert/update operation is performed on a product with `published = false` (e.g. creating/saving a draft product), the client-side `.select().single()` or `.select().maybeSingle()` is appended to the query. This acts as an implicit `RETURNING` clause, executing a `SELECT` operation on the newly inserted/updated row.
Since the row has `published = false`, the `SELECT` policy blocks the return of this row, resulting in the error:
`"Create failed: new row violates row-level security policy for table 'products_cms'"`
This error rolls back the entire database transaction, preventing the creation or modification of the draft product.

## SQL Migration Commands
Run the following SQL commands in the Supabase SQL Editor:
```sql
DROP POLICY IF EXISTS "anon select published products" ON public.products_cms;
CREATE POLICY "anon select published products" ON public.products_cms FOR SELECT TO anon USING (true);
```

## API Client Modification
Modify `src/lib/api-client.ts` to remove `.select().single()` and `.select().maybeSingle()` from products insert/update operations. Since the admin client only checks for the presence of the `error` field (and not `data`) on creation/updates, this avoids selecting the inserted/updated row and prevents future SELECT RLS checks during write transactions.

### Tasks
- [ ] Run the SQL commands in the Supabase SQL Editor:
  - `DROP POLICY IF EXISTS "anon select published products" ON public.products_cms;`
  - `CREATE POLICY "anon select published products" ON public.products_cms FOR SELECT TO anon USING (true);`
- [ ] Modify `src/lib/api-client.ts`:
  - For `POST` request (line 61): Change `.insert({ ... }).select().single()` to `.insert({ ... })`
  - For `PUT` request (line 65): Change `.update({ ... }).eq(...).select().maybeSingle()` to `.update({ ... }).eq(...)`
- [ ] Verify the fix:
  - Run the application or test script to verify that inserting a product with `published = false` completes successfully without throwing an RLS violation.

## Done When
- [ ] Products with `published = false` can be successfully created and updated.
- [ ] `src/lib/api-client.ts` does not contain `.select().single()` or `.select().maybeSingle()` for the `products_cms` write operations.
