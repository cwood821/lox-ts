import test from "ava";
import Scanner from "./scanner"
import { TOKEN_TYPE } from "./types";

test('Handles single char', t => {
	let source = ".";
	let scanner = new Scanner(source);

	let tokens = scanner.scanTokens();

	t.assert(tokens[0].isType(TOKEN_TYPE.DOT));
});

test('Handles multiple chars', t => {
	let source = "()";
	let scanner = new Scanner(source);

	let tokens = scanner.scanTokens();

	t.assert(tokens[0].isType(TOKEN_TYPE.LEFT_PAREN));
	t.assert(tokens[1].isType(TOKEN_TYPE.RIGHT_PAREN));
});

test('Handles two-char lexeme', t => {
	let source = "!=";
	let scanner = new Scanner(source);

	let tokens = scanner.scanTokens();

	// Only one token should be produced from the two characters
	// and then we always have an EOF token at the end
	t.is(tokens.length, 2);
	t.assert(tokens[0].isType(TOKEN_TYPE.BANG_EQUAL));
});

test('Throws away comments', t => {
	let source = "// a comment";
	let scanner = new Scanner(source);

	let tokens = scanner.scanTokens();

	// There should only be the EOF
	t.is(tokens.length, 1);
	t.assert(tokens[0].isType(TOKEN_TYPE.EOF));
});

// test('Reports errors on unhandled character', t => {
// 	let source = "^";
// 	let scanner = new Scanner(source);

// });