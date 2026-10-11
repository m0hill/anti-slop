import { defineRule } from "@oxlint/plugins";

import { isBoundaryFile } from "../shared/boundary.ts";

import type { ESTree } from "@oxlint/plugins";

function isBindingTarget(node: ESTree.Node): boolean {
	return node.type === "Identifier" || node.type === "ArrayPattern" || node.type === "ObjectPattern";
}

/** Keep every binding immutable so each name has exactly one value. */
export const noMutableBindingsRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description: "Disallow let, var, and reassignment of bindings outside `.ffi.ts` boundary modules.",
		},
		messages: {
			mutableDeclaration:
				"Declare `{{kind}}` bindings with `const`. Compute the value in one expression, a helper function, or a `switch` that returns.",
			reassignment:
				"Do not reassign bindings. Bind the new value to a new `const` with a descriptive name.",
		},
	},
	create(context) {
		if (isBoundaryFile(context.filename)) return {};

		return {
			VariableDeclaration(node) {
				if (node.kind !== "let" && node.kind !== "var") return;
				context.report({ node, messageId: "mutableDeclaration", data: { kind: node.kind } });
			},
			AssignmentExpression(node) {
				if (isBindingTarget(node.left)) context.report({ node, messageId: "reassignment" });
			},
			UpdateExpression(node) {
				if (node.argument.type === "Identifier") context.report({ node, messageId: "reassignment" });
			},
		};
	},
});
