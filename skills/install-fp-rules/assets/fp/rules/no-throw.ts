import { defineRule } from "@oxlint/plugins";

import { isIoFile } from "../shared/io-file.ts";

/** Keep failure in function contracts by returning Result values instead of throwing. */
export const noThrowRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description: "Disallow throw outside `.io.ts` files; return a Result instead.",
		},
		messages: {
			throw:
				"Return a Result instead of throwing: `return { ok: false, error: { kind: \"NotFound\", id } }`. For an unrecoverable invariant, call a `panic` helper defined in an `.io.ts` file.",
		},
	},
	create(context) {
		if (isIoFile(context.filename)) return {};

		return {
			ThrowStatement(node) {
				context.report({ node, messageId: "throw" });
			},
		};
	},
});
