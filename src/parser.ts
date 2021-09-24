import { type } from "os";
import { checkServerIdentity } from "tls";
import { Expr, Binary, Unary, Literal, Grouping } from "./expr";
import { Stmt, Print, Expression } from "./stmt";
import Token from "./token";
import { TokenType } from "./types";
import { Lox, parserError } from "./lox"

class ParserError extends Error {};

export default class Parser {
	private tokens: Token[];
	private current: number = 0;

	constructor(tokens: Token[]) {
		this.tokens = tokens;
	}

	parse(): Stmt[] {
		let statements = [];
		while(!this.isAtEnd()) {
			// @ts-ignore - 
			statements.push(this.statement())
		}
		return statements;
	}

	previous() {
		return this.tokens[this.current - 1];
	}

	advance() {
		if (!this.isAtEnd()) this.current++;
		return this.previous();
	}

	isAtEnd() {
		return this.tokens[this.current].isType(TokenType.EOF);
	}

	peek() {
		return this.tokens[this.current];
	}

	check(type: TokenType): boolean {
		if (this.isAtEnd()) return false;

		return this.peek().isType(type);
	}

	match(...types): boolean {
		for(let type of types) {
			if (this.check(type)) {
				this.advance();
				return true;
			}
		}

		return false;
	}

	statement() {
    if (this.match(TokenType.PRINT)) return this.printStatement();

    return this.expressionStatement();
  }

	printStatement() {
		let value = this.expression();
		this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
		return new Print(value);
	}

	expressionStatement() {
		let expr = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after expression.");
    return new Expression(expr);
	}

	comparison() {
		let expr = this.term();

		while (this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
			let operator = this.previous();
			let right = this.term();
			expr = new Binary(expr, operator, right);
		}

    return expr;
	}

	term() {
		let expr = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      let operator = this.previous();
      let right = this.factor();
      expr = new Binary(expr, operator, right);
    }

    return expr;
	}

	factor() {
		let expr = this.unary();

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      let operator = this.previous();
      let right = this.unary();
      expr = new Binary(expr, operator, right);
    }

    return expr;
	}

	unary() {
		if (this.match(TokenType.BANG, TokenType.MINUS)) {
			let operator = this.previous();
			let right = this.unary();
			return new Unary(operator, right);
		}

		return this.primary();
	}

	primary() {
		if (this.match(TokenType.FALSE)) return new Literal(false);
    if (this.match(TokenType.TRUE)) return new Literal(true);
		// @ts-ignore - null
    if (this.match(TokenType.NIL)) return new Literal(null);

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
			// @ts-ignore - literal is possibly undefined; consider how to handle
      return new Literal(this.previous().literal);
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      let expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
      return new Grouping(expr);
    }

		this.error(this.peek(), "Expect expression.");
	}

	consume(type: TokenType, message: string) {
		if (this.check(type)) return this.advance();

		this.error(this.peek(), message);
	}

	error(token: Token, message: string) {
		// parserError(token, message);
		Lox.error(token, message);
		
		// TODO: Clean this up
		throw new ParserError(`${message}`);
	}

	expression() {
		return this.equality();
	}

	equality() {
		let expr = this.comparison();

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      let operator = this.previous();
      let right = this.comparison();
      expr = new Binary(expr, operator, right);
    }

    return expr;
	}

	// Advance until the next statement;
	// used when encountering an error to reset state and continue parsing
	synchronize() {
		this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().isType(TokenType.SEMICOLON)) return;

      switch (this.peek().getType()) {
        case TokenType.CLASS:
        case TokenType.FUN:
        case TokenType.VAR:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return;
      }

      this.advance();
    }
	}

}