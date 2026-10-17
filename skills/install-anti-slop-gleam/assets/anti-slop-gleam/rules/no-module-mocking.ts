import { defineRule } from "@oxlint/plugins";

import { resolveVariable } from "../shared/scope.ts";

import type { ESTree, SourceCode } from "@oxlint/plugins";

const MOCK_METHODS = new Set(["doMock", "mock", "unstable_mockModule"]);
const FRAMEWORK_IMPORTS = new Map([
	["vitest", "vi"],
	["@jest/globals", "jest"],
]);

function importedName(node: ESTree.Node): string | undefined {
	if (node.type !== "ImportSpecifier") return undefined;
	return node.imported.type === "Identifier" ? node.imported.name : node.imported.value;
}

/** Reports whether an expression is Vitest's `vi` or Jest's `jest`, as a global or an import. */
function isTestFramework(sourceCode: SourceCode, expression: ESTree.Expression): boolean {
	if (expression.type !== "Identifier") return false;
	const variable = resolveVariable(sourceCode, expression);
	if (variable === undefined || variable.defs.length === 0) {
		return expression.name === "vi" || expression.name === "jest";
	}
	return variable.defs.some(
		(definition) =>
			definition.type === "ImportBinding" &&
			definition.parent?.type === "ImportDeclaration" &&
			FRAMEWORK_IMPORTS.get(definition.parent.source.value) === importedName(definition.node),
	);
}

function methodName(callee: ESTree.MemberExpression): string | undefined {
	const property = callee.property;
	if (!callee.computed) return property.type === "Identifier" ? property.name : undefined;
	return property.type === "Literal" && typeof property.value === "string" ? property.value : undefined;
}

/** Keep test doubles flowing through parameters, the same seam production code uses. */
export const noModuleMockingRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description: "Disallow Vitest and Jest module mocking; tests pass fakes as parameters instead.",
		},
		messages: {
			moduleMock:
				"Do not mock modules. Take the dependency as a parameter and pass a fake from the test, the same way the entry point passes the real one.",
		},
	},
	create(context) {
		return {
			CallExpression(node) {
				const callee = node.callee;
				if (callee.type !== "MemberExpression") return;
				const method = methodName(callee);
				if (method === undefined || !MOCK_METHODS.has(method)) return;
				if (!isTestFramework(context.sourceCode, callee.object)) return;
				context.report({ node, messageId: "moduleMock" });
			},
		};
	},
});
