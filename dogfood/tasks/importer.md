Task: implement a bank-transaction importer in `src/`.

- Export `importTransactions(csv: string, rulesJson: string)` from `src/importer.ts`.
- CSV has a header row `date,amount,currency,description,kind`. `date` is `YYYY-MM-DD`, `amount` is a decimal number string, `currency` is one of `USD`, `EUR`, `GBP`, `kind` is one of `debit`, `credit`, `transfer`. Blank lines are ignored. No quoted fields.
- `rulesJson` is a JSON string: an array of `{ "category": string, "match": string }`. A transaction's category is the first rule whose `match` appears case-insensitively in its description, else `"uncategorized"`. Transfers are never categorized and are excluded from totals.
- Result must give: (1) per month (`YYYY-MM`), per currency, per category, the net total (credits positive, debits negative) in integer cents; (2) a list of invalid rows with their 1-based line number and a specific reason (bad date, bad amount, unknown currency, unknown kind, wrong column count); (3) a clear failure if `rulesJson` is not valid JSON or does not match the expected structure — callers must be able to distinguish that failure from row errors.
- Design the types and module structure as you see fit.
- Write tests with `node:test` in `src/*.test.ts` covering the happy path and the failure cases.
