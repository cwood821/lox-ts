import { type } from "os";
import { checkServerIdentity } from "tls";
import { Expr, Binary, Unary, Literal, Grouping, Variable, Assign, Logical, Call, Get, ExprSet, This, ExprSuper } from "./expr";
import { Stmt, Var, Print, Expression, Block, If, While, Func, Ret, Class } from "./stmt";
import Token from "./token";
import { TokenType } from "./types";
import { Lox, parserError } from "./lox"

class ParserError extends Error { };

export default class Parser {
	private tokens: Token[];
	private current: number = 0;

	constructor(tokens: Token[]) {
		this.tokens = tokens;
	}

	parse(): Stmt[] {
		let statements = [];
		while (!this.isAtEnd()) {
			// @ts-ignore - 
			// statements.push(this.statement())
			statements.push(this.declaration())
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
		for (let type of types) {
			if (this.check(type)) {
				this.advance();
				return true;
			}
		}

		return false;
	}

	varDeclaration() {
		let name = this.consume(TokenType.IDENTIFIER, "Expect variable name.");

		let initializer = null;
		if (this.match(TokenType.EQUAL)) {
			initializer = this.expression();
		}

		this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.");
		// @ts-ignore -- check name is undefined 
		return new Var(name, initializer);
	}

	classDeclaration() {
		let name = this.consume(TokenType.IDENTIFIER, "Expect class name.");

		let superclass: Variable | null = null;
    if (this.match(TokenType.LESS)) {
      this.consume(TokenType.IDENTIFIER, "Expect superclass name.");
      superclass = new Variable(this.previous());
    }

    this.consume(TokenType.LEFT_BRACE, "Expect '{' before class body.");

		let methods: Func[] = [];
    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      methods.push(this.funDeclaration("method"));
    }

    this.consume(TokenType.RIGHT_BRACE, "Expect '}' after class body.");

		// @ts-ignore - error will throw if name is undefined
    return new Class(name, superclass, methods);
	}

 funDeclaration(kind: string): Func {
	 let name = this.consume(TokenType.IDENTIFIER, `Expect ${kind} name`)

	 this.consume(TokenType.LEFT_PAREN, "Expect '(' after " + kind + " name.");
	 let parameters: Token[] = [];
	 if (!this.check(TokenType.RIGHT_PAREN)) {
		 do {
			 if (parameters.length > 255) {
				 this.error(this.peek(), "Can't have more than 255 parameters.");
			 }

			 // @ts-ignore - error throws on consume failure
			 parameters.push(this.consume(TokenType.IDENTIFIER, "Expect parameter name."));
		 } while (this.match(TokenType.COMMA));
	 }

	 this.consume(TokenType.RIGHT_PAREN, "Expect ')' after parameters.");

	 this.consume(TokenType.LEFT_BRACE, "Expect '{' before " + kind + " body.");
	 let body: Stmt[] = this.block();
	 // @ts-ignore - would have failed before if name was undefined
	 return new Func(name, parameters, body);
 }

	declaration() {
		try {
			if (this.match(TokenType.CLASS)) { return this.classDeclaration() }
			if (this.match(TokenType.FUN)) { return this.funDeclaration("function") }
			if (this.match(TokenType.VAR)) {
				return this.varDeclaration();
			}

			return this.statement();
		} catch (error) {
			// TODO: Check for parser error
			this.synchronize();
			return null;
		}
	}

	statement() {
		if (this.match(TokenType.FOR)) return this.forStatement();
		if (this.match(TokenType.IF)) return this.ifStatement();
		if (this.match(TokenType.PRINT)) return this.printStatement();
		if (this.match(TokenType.RETURN)) return this.returnStatement();
		if (this.match(TokenType.WHILE)) return this.whileStatement();
		if (this.match(TokenType.LEFT_BRACE)) return new Block(this.block());

		return this.expressionStatement();
	}

	block() {
		let statements: Stmt[] = [];

		while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
			// @ts-ignore - TODO: Fix this typing issue
			statements.push(this.declaration());
		}

		this.consume(TokenType.RIGHT_BRACE, "Expect '}' after block.");
		return statements;
	}

	forStatement() {
		this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'for'.");
		let initializer;

		if (this.match(TokenType.SEMICOLON)) {
			initializer = null;
		} else if (this.match(TokenType.VAR)) {
			initializer = this.varDeclaration();
		} else {
			initializer = this.expressionStatement();
		}

		let condition: null | Expr = null;
		if (!this.check(TokenType.SEMICOLON)) {
			condition = this.expression();
		}

		this.consume(TokenType.SEMICOLON, "Expect ';' after loop condition.");

		let increment = null;
		if (!this.check(TokenType.RIGHT_PAREN)) {
			increment = this.expression();
		}
		this.consume(TokenType.RIGHT_PAREN, "Expect ')' after for clauses.");

		let body = this.statement();
		if (increment != null) {
			body = new Block([body, new Expression(increment)]);
		}

		if (condition == null) condition = new Literal(true);
		body = new While(condition, body);

		if (initializer != null) {
			body = new Block([initializer, body]);
		}

		return body;
	}

	whileStatement() {
		this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'while'.");
		let condition = this.expression();
		this.consume(TokenType.RIGHT_PAREN, "Expect ')' after condition.");
		let body = this.statement();

		return new While(condition, body);
	}

	ifStatement() {
		this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'if'");
		let condition = this.expression();
		this.consume(TokenType.RIGHT_PAREN, "Expect ')' after if condition");

		let thenBranch = this.statement();
		let elseBranch = null;
		if (this.match(TokenType.ELSE)) {
			elseBranch = this.statement();
		}

		return new If(condition, thenBranch, elseBranch);
	}


	printStatement() {
		let value = this.expression();
		this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
		return new Print(value);
	}

	returnStatement() {
    let keyword = this.previous();
    let value = null;

		// Rather than checking for presence of value, we check for absence
    if (!this.check(TokenType.SEMICOLON)) {
      value = this.expression();
    }

    this.consume(TokenType.SEMICOLON, "Expect ';' after return value.");
		// @ts-ignore - handle null value 
    return new Ret(keyword, value);
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

		return this.call();
	}

	call() {
		let expr = this.primary();

		while (true) {
			if (this.match(TokenType.LEFT_PAREN)) {
				expr = this.finishCall(expr);
			}
			else if (this.match(TokenType.DOT)) {
				let name = this.consume(TokenType.IDENTIFIER, "Expect property name after '.'.");
				// @ts-ignore will throw error on undefined
				expr = new Get(expr, name);
			} else {
				break;
			}
		}

		return expr;
	}

	finishCall(callee: Expr) {
		let args = [];
		if (!this.check(TokenType.RIGHT_PAREN)) {
			do {
				// @ts-ignore - 
				args.push(this.expression());
				if (args.length >= 255) {
					this.error(this.peek(), "Can't have more than 255 arguments.");
				}
			} while (this.match(TokenType.COMMA));
		}

		let paren = this.consume(TokenType.RIGHT_PAREN, "Expect ')' after arguments.");

		// @ts-ignore, will throw error when paren is undefined
		return new Call(callee, paren, args);
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


    if (this.match(TokenType.SUPER)) {
      let keyword = this.previous();
      this.consume(TokenType.DOT, "Expect '.' after 'super'.");
      let method = this.consume(TokenType.IDENTIFIER, "Expect superclass method name.");
			// @ts-ignore - Method will fail
      return new ExprSuper(keyword, method);
    }

		if (this.match(TokenType.LEFT_PAREN)) {
			let expr = this.expression();
			this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
			return new Grouping(expr);
		}

		if (this.match(TokenType.THIS)) return new This(this.previous());

		if (this.match(TokenType.IDENTIFIER)) {
			return new Variable(this.previous());
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
		return this.assignment();
	}

	assignment() {
		let expr = this.or();

		if (this.match(TokenType.EQUAL)) {
			let equals = this.previous();
			let value = this.assignment();

			if (expr instanceof Variable) {
				let name = expr.name;
				return new Assign(name, value);
			} else if (expr instanceof Get) {
				return new ExprSet(expr.object, expr.name, value);
			}

			this.error(equals, "Invalid assignment target.");
		}

		return expr;
	}

	or() {
		let expr = this.and();

		while (this.match(TokenType.OR)) {
			let operator = this.previous();
			let right = this.and();
			expr = new Logical(expr, operator, right);
		}

		return expr;
	}

	and() {
		let expr = this.equality();

		while (this.match(TokenType.AND)) {
			let operator = this.previous();
			let right = this.equality();
			expr = new Logical(expr, operator, right);
		}

		return expr;
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