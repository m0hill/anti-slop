import { RuleTester } from "oxlint/plugins-dev";

import { noLoopsRule } from "./no-loops.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const boundary = "src/clock.ffi.ts";

const error = { messageId: "loop" };

tester.run("gleam/no-loops", noLoopsRule, {
	valid: [
		"for (const item of items) use(item);",
		"const emails = users.map(user => user.email);",
		{ filename: boundary, code: "while (stream.hasNext()) read(stream.next());" },
	],
	invalid: [
		{ code: "while (ready()) step();", errors: [error] },
		{ code: "do { step(); } while (ready());", errors: [error] },
		{ code: "for (let index = 0; index < items.length; index++) use(items[index]);", errors: [error] },
		{ code: "for (;;) step();", errors: [error] },
		{ code: "for (const key in record) use(key);", errors: [error] },
	],
});
