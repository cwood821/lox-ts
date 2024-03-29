import test from "ava";
import Scanner from "./scanner"
import { TokenType } from "./types";

test('Handles single char', t => {
	let source = ".";
	let scanner = new Scanner(source);

	let tokens = scanner.scanTokens();

	t.assert(tokens[0].isType(TokenType.DOT));
});

test('Handles multiple chars', t => {
	let source = "()";
	let scanner = new Scanner(source);

	let tokens = scanner.scanTokens();

	t.assert(tokens[0].isType(TokenType.LEFT_PAREN));
	t.assert(tokens[1].isType(TokenType.RIGHT_PAREN));
});

test('Handles two-char lexeme', t => {
	let source = "!=";
	let scanner = new Scanner(source);

	let tokens = scanner.scanTokens();

	// Only one token should be produced from the two characters
	// and then we always have an EOF token at the end
	t.is(tokens.length, 2);
	t.assert(tokens[0].isType(TokenType.BANG_EQUAL));
});

test('Throws away comments', t => {
	let source = "// a comment";
	let scanner = new Scanner(source);

	let tokens = scanner.scanTokens();

	// There should only be the EOF
	t.is(tokens.length, 1);
	t.assert(tokens[0].isType(TokenType.EOF));
});

test('Handles string literals', t => {
	let source = `"first" "second"`;
	let scanner = new Scanner(source);

	let tokens = scanner.scanTokens();

	t.assert(tokens[0].isType(TokenType.STRING));
	t.is(tokens[0].getLiteral(), "first");

	t.assert(tokens[1].isType(TokenType.STRING));
	t.is(tokens[1].getLiteral(), "second");
});

test('Handles number literals', t => {
	let source = `1 2.5`;
	let scanner = new Scanner(source);

	let tokens = scanner.scanTokens();

	t.assert(tokens[0].isType(TokenType.NUMBER));
	t.is(tokens[0].getLiteral(), 1);

	t.assert(tokens[1].isType(TokenType.NUMBER));
	t.is(tokens[1].getLiteral(), 2.5);
});

test('Handles reserved words', t => {
	let source = `and`;
	let scanner = new Scanner(source);

	let tokens = scanner.scanTokens();

	t.assert(tokens[0].isType(TokenType.AND));
});

test('Follows maximal munch prinicple', t => {
	let source = `andover`;
	let scanner = new Scanner(source);

	let tokens = scanner.scanTokens();

	// Should not be AND token type
	t.assert(tokens[0].isType(TokenType.IDENTIFIER));
});


// test('Reports errors on unhandled character', t => {
// 	let source = "^";
// 	let scanner = new Scanner(source);

// });