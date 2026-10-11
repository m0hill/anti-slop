import { defineRule } from "@oxlint/plugins";

import { isBoundaryFile } from "../shared/boundary.ts";

import type { ESTree } from "@oxlint/plugins";

function isNeverCheck(statement: ESTree.Statement): boolean {
	return (
		statement.type === "ExpressionStatement" &&
		statement.expression.type === "TSSatisfiesExpression" &&
		statement.expression.typeAnnotation.type === "TSNeverKeyword"
	);
}

/** Keep switches exhaustive so adding a variant breaks every switch that must handle it. */
export const noSwitchCatchAllRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description: "Disallow `default` cases unless they assert exhaustiveness with `satisfies never`.",
		},
		messages: {
			catchAll:
				"List every variant as its own `case` instead of using `default`. If a default is needed for exhaustiveness, its first statement must be `value satisfies never;`.",
		},
	},
	create(context) {
		if (isBoundaryFile(context.filename)) return {};

		return {
			SwitchCase(node) {
				if (node.test !== null) return;
				const first = node.consequent[0];
				const statements = first?.type === "BlockStatement" ? first.body : node.consequent;
				if (statements[0] !== undefined && isNeverCheck(statements[0])) return;
				context.report({ node, messageId: "catchAll" });
			},
		};
	},
});
