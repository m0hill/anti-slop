Task: implement the core of a library lending system in `src/`. Everything is in memory; there is no database.

- Members have an id, a name, and a tier: `standard` (may hold 3 books at once) or `premium` (may hold 6).
- Books have an id, a title, and are either available, on loan to a member with a due date, or lost.
- Operations:
  - Register a member and add a book.
  - Check out a book to a member on a given date; the loan is due 14 days later. It fails if the member or book does not exist, the book is not available, the member is at their limit, or the member owes more than 1000 cents in unpaid fines.
  - Return a book on a given date. It fails if the book is not on loan. A late return adds a fine of 25 cents per day late to the member.
  - Mark a book lost. The member who had it is fined 2000 cents, and the book is no longer on loan.
  - Pay part or all of a member's fines. It fails for non-positive amounts or amounts above what is owed.
  - List a member's overdue loans as of a given date.
- Each failure must be distinguishable by callers and carry the relevant ids.
- Dates are `YYYY-MM-DD` strings in the API.
- Design the types, state handling, and module structure as you see fit. Export the public API from `src/library.ts`.
- Write tests with `node:test` in `src/*.test.ts` covering each operation and each failure.
