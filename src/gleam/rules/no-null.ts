import { defineRule } from "@oxlint/plugins";

import { isBoundaryFile } from "../shared/boundary.ts";

/** Keep a single absence value so absence is always modeled the same way. */
export const noNullRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description: "Disallow null values and types outside `.ffi.ts` boundary modules.",
		},
		messages: {
			null:
				"Do not use `null`. Model absence as `undefined` in an explicit union, or as a Result error when absence is a failure. Convert foreign `null` to `undefined` in a `.ffi.ts` boundary module.",
		},
	},
	create(context) {
		if (isBoundaryFile(context.filename)) return {};

		return {
			Literal(node) {
				if (node.raw === "null") context.report({ node, messageId: "null" });
			},
			TSNullKeyword(node) {
				context.report({ node, messageId: "null" });
			},
		};
	},
});
