import test from "ava";
import Parser from "./parser";
import Token from "./token";
import { Binary } from "./expression";
import { TokenType } from "./types";

test('Handles comparison', t => {

	let tokens = [
		new Token(TokenType.NUMBER, '3', 3, 1),
		new Token(TokenType.GREATER, '>', undefined, 1),
		new Token(TokenType.NUMBER, '1', 1, 1),
		new Token(TokenType.EOF, '', undefined, 1)
	];

	let parser = new Parser(tokens);
	let parsed = parser.parse();

	// @ts-ignore - Null will fail test
	t.assert(parsed.constructor === Binary);
	// @ts-ignore Binary
	t.assert(parsed.left.value === 3);
	// @ts-ignore Binary
	t.assert(parsed.operator.lexeme === '>');
	// @ts-ignore Binary
	t.assert(parsed.right.value === 1);
});