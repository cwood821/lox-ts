import test from "ava";
import Parser from "./parser";
import Token from "./token";
import { Binary } from "./expr";
import { TokenType } from "./types";

test('Handles comparison', t => {

	let tokens = [
		new Token(TokenType.NUMBER, '3', 3, 1),
		new Token(TokenType.GREATER, '>', undefined, 1),
		new Token(TokenType.NUMBER, '1', 1, 1),
		new Token(TokenType.SEMICOLON, ';', undefined, 1),
		new Token(TokenType.EOF, '', undefined, 1)
	];

	let parser = new Parser(tokens);
	let parsed = parser.parse();

	let [first] = parsed;
	// @ts-ignore - expression exists on expression statement
	let expr = first.expression;

	// @ts-ignore - Null will fail test
	t.assert(expr.constructor === Binary);
	// @ts-ignore Binary
	t.assert(expr.left.value === 3);
	// @ts-ignore Binary
	t.assert(expr.operator.lexeme === '>');
	// @ts-ignore Binary
	t.assert(expr.right.value === 1);
});