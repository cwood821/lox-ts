import test from "ava";
import Token from "./token";
import { Binary, Literal, Unary } from "./expr";
import { TokenType } from "./types";
import Interpreter from "./interpreter";

test('Addition', t => {
	let interpreter = new Interpreter();

	let expr = new Binary(
		new Literal(3),
		new Token(TokenType.PLUS, '+', undefined, 1),
		new Literal(1)
	);

	let result = interpreter.evaluate(expr);

	// @ts-ignore - Null will fail test
	t.assert(result === 4);
});

test('Subtraction', t => {
	let interpreter = new Interpreter();

	let expr = new Binary(
		new Literal(4),
		new Token(TokenType.MINUS, '-', undefined, 1),
		new Literal(2)
	);

	let result = interpreter.evaluate(expr);

	// @ts-ignore - Null will fail test
	t.assert(result === 2);
});

test('Boolean - 1 is false', t => {
	let interpreter = new Interpreter();
	let expr = new Unary(new Token(TokenType.BANG, "!", undefined, 1), new Literal(1));
	let result = interpreter.evaluate(expr);
	// @ts-ignore - Null will fail test
	t.assert(result === true);
});

test('Boolean - null is false', t => {
	let interpreter = new Interpreter();
	// @ts-ignore
	let expr = new Unary(new Token(TokenType.BANG, "!", undefined, 1), new Literal(null));
	let result = interpreter.evaluate(expr);
	// @ts-ignore - Null will fail test
	t.assert(result === true);
});

test('Boolean - true is true', t => {
	let interpreter = new Interpreter();
	let expr = new Unary(new Token(TokenType.BANG, "!", undefined, 1), new Literal(true));
	let result = interpreter.evaluate(expr);
	// @ts-ignore - Null will fail test
	t.assert(result === false);
});

test('String - empty string is false', t => {
	let interpreter = new Interpreter();
	// @ts-ignore
	let result = interpreter.isTruthy("");
	// @ts-ignore - Null will fail test
	t.assert(result === false);
});

test('String - non-empty string is true', t => {
	let interpreter = new Interpreter();
	// @ts-ignore
	let result = interpreter.isTruthy("hello");
	// @ts-ignore - Null will fail test
	t.assert(result === true);
});