import RuntimeError from "./errors/runtime";
import { Literal, Grouping, Unary, Binary, Expr, Visitor as ExpresionVisitor } from "./expr";
import { Stmt, Expression, Print, Visitor as StatementVisitor } from "./stmt";
import { TokenType } from "./types";
import { Lox } from "./lox";



export default class Interpreter implements StatementVisitor, ExpresionVisitor {

	constructor() {}

	interpret(statements: Stmt[]) { 

		try {
			statements.forEach(statement => {
        this.execute(statement);
			})
    } catch (error) {
      Lox.runtimeError(error);
    }

  }

	execute(statement: Stmt) {
		statement.accept(this);
	}

	stringify(object) {
			if (object == null) return "nil";
	
			if (typeof object === "number") {
				let text = String(object);
				if (text.endsWith(".0")) {
					text = text.substring(0, text.length - 2);
				}

				return text;
			}
	
			return String(object);
	}

	evaluate(expr) {
		return expr.accept(this);
	}

	isTruthy(obj) {
		if (obj === null) return false;
		if (typeof obj === "boolean") return obj; 
		return false;
	}

	isEqual(a, b) {
		if (a == null && b == null) return true;
    if (a == null) return false;

		// TODO: This might need extra work 
		return a === b;
	}

	checkNumberOperand(operator, operand) {
		if (typeof operand === "number") {
			return;
		}

		throw new RuntimeError(operator, "Operand must be a number");
	}
	
	checkNumberOperands(operator, left, right) {
		if (typeof right === "number" && typeof left === "number") {
			return;
		}

		throw new RuntimeError(operator, "Operands must be a number");
	}

	visitExpression(expr: Expression) {
		this.evaluate(expr);
		return null;
	}

	visitPrint(stmt: Print) {
		let value = this.evaluate(stmt.expression);
		console.log(this.stringify(value));
		return null;
	}

	visitLiteral(expr: Literal) {
		return expr.value;
	}

	visitGrouping(expr: Grouping) {
		return this.evaluate(expr.expression);
	}

	visitUnary(expr: Unary) {
		let right = this.evaluate(expr.right);
		switch(expr.operator.getType()) {
			case TokenType.BANG:
        return !this.isTruthy(right);
			case TokenType.MINUS:
				this.checkNumberOperand(expr.operator, right);
				// dynamic typing at work
				return -Number(right);
		}

		return null;
	}

	visitBinary(expr: Binary) {
		let left = this.evaluate(expr.left);
		let right = this.evaluate(expr.right);

		switch(expr.operator.getType()) {
			case TokenType.MINUS:
				this.checkNumberOperands(expr.operator, left, right);
				return Number(left) - Number(right);
			case TokenType.SLASH:
				this.checkNumberOperands(expr.operator, left, right);
				return Number(left) / Number(right);
			case TokenType.STAR:
				this.checkNumberOperands(expr.operator, left, right);
				return Number(left) * Number(right);
			case TokenType.PLUS:
				if (typeof left === "number" && typeof right === "number") {
					return left + right;
				}
				if (typeof left === "string" && typeof right === "string") {
					return left + right
				}

				throw new RuntimeError(expr.operator, "Operands must be a number");
				break;
			case TokenType.GREATER:
				this.checkNumberOperands(expr.operator, left, right);
				return Number(left) > Number(right);
			case TokenType.GREATER_EQUAL:
				this.checkNumberOperands(expr.operator, left, right);
				return Number(left) >= Number(right);
			case TokenType.LESS:
				this.checkNumberOperands(expr.operator, left, right);
				return Number(left) < Number(right);
			case TokenType.LESS_EQUAL:
				this.checkNumberOperands(expr.operator, left, right);
				return Number(left) <= Number(right);
			case TokenType.BANG_EQUAL: return !this.isEqual(left, right);
			case TokenType.EQUAL_EQUAL: return this.isEqual(left, right);
	
		}

		return null;
	}
}