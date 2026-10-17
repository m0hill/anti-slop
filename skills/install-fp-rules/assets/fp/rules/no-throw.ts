import { defineRule } from "@oxlint/plugins";

import { isIoFile } from "../shared/io-file.ts";
import { isGlobalIdentifier } from "../shared/scope.ts";

/** Keep failure in function contracts by returning Result values instead of throwing or rejecting. */
export const noThrowRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description: "Disallow throw and Promise.reject outside `.io.ts` files; return a Result instead.",
		},
		messages: {
			throw:
				"Return a Result instead of throwing: `return { ok: false, error: { kind: \"NotFound\", id } }`. For an unrecoverable invariant, call a `panic` helper defined in an `.io.ts` file.",
			reject:
				"Resolve with a Result instead of rejecting: in an async function, `return { ok: false, error: { kind: \"NotFound\", id } }`. A rejected promise is a thrown error that the type does not show.",
		},
	},
	create(context) {
		if (isIoFile(context.filename)) return {};

		return {
			ThrowStatement(node) {
				context.report({ node, messageId: "throw" });
			},
			CallExpression(node) {
				const callee = node.callee;
				if (callee.type !== "MemberExpression" || callee.computed) return;
				if (callee.property.type !== "Identifier" || callee.property.name !== "reject") return;
				if (!isGlobalIdentifier(context.sourceCode, callee.object, "Promise")) return;
				context.report({ node, messageId: "reject" });
			},
		};
	},
});
