Task: implement an order fulfilment workflow in `src/` as an event-driven state machine. Everything is in memory.

- An order has an id, line items (sku, quantity, unit price in cents), and a status: `pending`, `paid`, `packed`, `shipped` (with a tracking number), `delivered`, or `cancelled` (with a reason).
- Events: `PaymentReceived` (amount in cents), `Packed`, `Shipped` (tracking number), `Delivered`, `Cancelled` (reason).
- Transitions: pending → paid only when the payment equals the order total; paid → packed; packed → shipped; shipped → delivered. An order may be cancelled while pending or paid, but not after it is packed. Any other event in a given status is rejected.
- `apply(order, event)` returns the next order or a rejection naming the order id, its status, and the event type.
- `replay(orderId, items, events)` builds an order from its event history, stopping at the first rejected event and reporting its index.
- `describe(order)` returns a one-line human-readable status, such as `shipped (tracking 1Z999)`.
- Do this in two steps. First implement and test everything above. Then add a new status, `returned`, reached from `delivered` by a new `Returned` event (with a reason), and update every part of the code that needs it, including `describe`.
- Design the types and module structure as you see fit. Export the public API from `src/orders.ts`.
- Write tests with `node:test` in `src/*.test.ts` covering every transition, every rejection, replay, and describe.
