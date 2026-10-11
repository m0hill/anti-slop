import { defineRule } from "@oxlint/plugins";
import type { ESTree } from "@oxlint/plugins";

import {
  containsUnknownType,
  functionParameterBindingName,
  functionParameterTypeAnnotation,
} from "../shared/function-parameters.ts";

const TRANSPARENT_WRAPPERS = new Set(["Readonly", "Partial", "Required"]);

function propertyName(key: ESTree.PropertyKey): string | undefined {
  if (key.type === "Identifier") return key.name;
  return key.type === "Literal" && typeof key.value === "string" ? key.value : undefined;
}

/** Return whether an object parameter hides an unknown member, other than `cause`, from the top-level check. */
function wrapsUnknownType(type: ESTree.TSType): boolean {
  if (type.type === "TSParenthesizedType") return wrapsUnknownType(type.typeAnnotation);
  if (type.type === "TSUnionType" || type.type === "TSIntersectionType") return type.types.some(wrapsUnknownType);
  if (type.type === "TSTypeReference") {
    return (
      type.typeName.type === "Identifier" &&
      TRANSPARENT_WRAPPERS.has(type.typeName.name) &&
      (type.typeArguments?.params.some(wrapsUnknownType) ?? false)
    );
  }
  if (type.type !== "TSTypeLiteral") return false;
  return type.members.some((member) => {
    if (member.type !== "TSPropertySignature" || member.typeAnnotation == null) return false;
    if (propertyName(member.key) === "cause") return false;
    const memberType = member.typeAnnotation.typeAnnotation;
    return containsUnknownType(memberType) || wrapsUnknownType(memberType);
  });
}

type ParameterOwner =
  | ESTree.ArrowFunctionExpression
  | ESTree.Function
  | ESTree.TSCallSignatureDeclaration
  | ESTree.TSConstructSignatureDeclaration
  | ESTree.TSConstructorType
  | ESTree.TSFunctionType
  | ESTree.TSMethodSignature;

function isTypePredicateSubject(owner: ParameterOwner, parameterName: string): boolean {
  const predicate = owner.returnType?.typeAnnotation;
  return (
    predicate?.type === "TSTypePredicate" &&
    predicate.parameterName.type === "Identifier" &&
    predicate.parameterName.name === parameterName
  );
}

/** Disallow unknown inputs except explicitly named error-cause enrichment. */
export const noUnknownParametersRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow explicitly unknown function parameters, including unknown members of object parameters, except `cause` and type-predicate subjects; decode unknown input at its I/O boundary instead.",
    },
    messages: {
      unknownParameter:
        "Parameter `{{parameter}}` leaves input unparsed. Accept a named domain type; run the expected schema or parser at the I/O boundary before calling this function.",
    },
  },
  createOnce(context) {
    const checkParameters = (node: ParameterOwner) => {
      for (const parameter of node.params) {
        const annotation = functionParameterTypeAnnotation(parameter);
        if (annotation === null || annotation === undefined) continue;
        const type = annotation.typeAnnotation;
        if (!containsUnknownType(type) && !wrapsUnknownType(type)) continue;
        const name = functionParameterBindingName(parameter, context.sourceCode);
        if (name === "cause" || isTypePredicateSubject(node, name)) continue;
        context.report({
          node: annotation.typeAnnotation,
          messageId: "unknownParameter",
          data: { parameter: name },
        });
      }
    };

    return {
      ArrowFunctionExpression: checkParameters,
      FunctionDeclaration: checkParameters,
      FunctionExpression: checkParameters,
      TSCallSignatureDeclaration: checkParameters,
      TSConstructSignatureDeclaration: checkParameters,
      TSConstructorType: checkParameters,
      TSDeclareFunction: checkParameters,
      TSEmptyBodyFunctionExpression: checkParameters,
      TSFunctionType: checkParameters,
      TSMethodSignature: checkParameters,
    };
  },
});
