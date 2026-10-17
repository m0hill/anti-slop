import { defineRule } from "@oxlint/plugins";

import { isIoFile } from "../shared/io-file.ts";
import { resolveVariable } from "../shared/scope.ts";

import type { ESTree, SourceCode } from "@oxlint/plugins";

type FunctionNode = ESTree.Function | ESTree.ArrowFunctionExpression;

// A return type that names `Result` or ends in it, such as `Promise<Result<User, NotFound>>` or `SaveResult`.
const RESULT_TYPE = /Result\b/u;

function isFunction(node: ESTree.Node): node is FunctionNode {
	return (
		node.type === "FunctionDeclaration" ||
		node.type === "FunctionExpression" ||
		node.type === "ArrowFunctionExpression"
	);
}

/** The nearest function around a node, which is the one a `return` belongs to. */
function enclosingFunction(node: ESTree.Node): FunctionNode | undefined {
	const parent = node.parent;
	if (parent === null) return undefined;
	return isFunction(parent) ? parent : enclosingFunction(parent);
}

/** Reports whether an expression builds a Result: `ok(...)`, `err(...)`, or `{ ok: ..., ... }`. */
function isResultValue(expression: ESTree.Expression): boolean {
	if (expression.type === "ConditionalExpression") {
		return isResultValue(expression.consequent) || isResultValue(expression.alternate);
	}
	if (expression.type === "CallExpression") {
		return expression.callee.type === "Identifier" && (expression.callee.name === "ok" || expression.callee.name === "err");
	}
	if (expression.type === "ObjectExpression") {
		return expression.properties.some(
			(property) => property.type === "Property" && property.key.type === "Identifier" && property.key.name === "ok",
		);
	}
	return false;
}

/** The function a call's callee names, when it is declared in this file with `function` or `const`. */
function calledFunction(sourceCode: SourceCode, call: ESTree.CallExpression): FunctionNode | undefined {
	if (call.callee.type !== "Identifier") return undefined;
	const definition = resolveVariable(sourceCode, call.callee)?.defs[0];
	if (definition === undefined) return undefined;
	if (definition.type === "FunctionName" && isFunction(definition.node)) return definition.node;
	if (definition.type !== "Variable" || definition.node.type !== "VariableDeclarator") return undefined;
	if (definition.parent?.type !== "VariableDeclaration" || definition.parent.kind !== "const") return undefined;
	const init = definition.node.init;
	return init !== null && isFunction(init) ? init : undefined;
}

/** A call whose value is thrown away: `save(user);` or `await save(user);`. */
function discardedCall(statement: ESTree.ExpressionStatement): ESTree.CallExpression | undefined {
	const expression = statement.expression;
	if (expression.type === "CallExpression") return expression;
	if (expression.type === "AwaitExpression" && expression.argument.type === "CallExpression") return expression.argument;
	return undefined;
}

/** Keep failures visible: a returned Result must be checked, returned, or explicitly discarded with `void`. */
export const noIgnoredResultRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow calling a function that returns a Result without using the Result. Covers functions declared in the same file.",
		},
		messages: {
			ignored:
				"`{{name}}` returns a Result, and ignoring it drops the failure silently. Check it (`const saved = {{name}}(...); if (!saved.ok) return saved;`) or return it. If dropping the failure is intended, write `void {{name}}(...)`.",
		},
	},
	create(context) {
		if (isIoFile(context.filename)) return {};
		const { sourceCode } = context;
		// Functions are often called before they are declared, so decide once the whole file is read.
		const resultFunctions = new Set<FunctionNode>();
		const discarded: ESTree.CallExpression[] = [];

		const returnsResult = (fn: FunctionNode) =>
			resultFunctions.has(fn) || (fn.returnType != null && RESULT_TYPE.test(sourceCode.getText(fn.returnType)));

		return {
			ReturnStatement(node) {
				const fn = enclosingFunction(node);
				if (fn !== undefined && node.argument !== null && isResultValue(node.argument)) resultFunctions.add(fn);
			},
			ArrowFunctionExpression(node) {
				if (node.expression && node.body.type !== "BlockStatement" && isResultValue(node.body)) resultFunctions.add(node);
			},
			ExpressionStatement(node) {
				const call = discardedCall(node);
				if (call !== undefined) discarded.push(call);
			},
			"Program:exit"() {
				for (const call of discarded) {
					const fn = calledFunction(sourceCode, call);
					if (fn === undefined || !returnsResult(fn) || call.callee.type !== "Identifier") continue;
					context.report({ node: call, messageId: "ignored", data: { name: call.callee.name } });
				}
			},
		};
	},
});
