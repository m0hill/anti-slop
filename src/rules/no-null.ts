import { defineRule } from "@oxlint/plugins";

import { isIoFile } from "../shared/io-file.ts";

const EQUALITY_OPERATORS = new Set(["===", "!==", "==", "!="]);

/** Keep a single absence value so absence is always modeled the same way. */
export const noNullRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description: "Disallow null values and types outside `.io.ts` files; comparisons that narrow foreign null results remain valid.",
		},
		messages: {
			null:
				"Do not write `null` values or types. Model absence as `undefined` in an explicit union, or as a Result error when absence is a failure. Convert a foreign `null` where it arrives (`headers.get(name) ?? undefined`) or narrow it with `value === null`; both are valid without an `.io.ts` file.",
		},
	},
	create(context) {
		if (isIoFile(context.filename)) return {};

		return {
			Literal(node) {
				if (node.raw !== "null") return;
				const parent = node.parent;
				if (parent.type === "BinaryExpression" && EQUALITY_OPERATORS.has(parent.operator)) return;
				context.report({ node, messageId: "null" });
			},
			TSNullKeyword(node) {
				context.report({ node, messageId: "null" });
			},
		};
	},
});
