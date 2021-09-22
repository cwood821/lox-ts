import test from "ava";
import Token from "./token";
import { Binary, Literal } from "./expression";
import { TokenType } from "./types";
import Interpreter from "./interpreter";

test('Addition', t => {
	let interpreter = new Interpreter();

	let expr = new Binary(
		new Literal(3),
		new Token(TokenType.PLUS, '+', undefined, 1),
		new Literal(1)
	);

	let result = interpreter.interpret(expr);
	console.log(result)

	// @ts-ignore - Null will fail test
	t.assert(result === 4);
});