import RuntimeError from "./errors/runtime";
import { Literal, Grouping, Unary, Binary, Expr, Assign, Visitor as ExpresionVisitor, Variable, Logical } from "./expr";
import { Stmt, Expression, Print, Visitor as StatementVisitor, Var, Block, If } from "./stmt";
import { TokenType } from "./types";
import { Lox } from "./lox";
import Environment from "./environment";



export default class Interpreter implements StatementVisitor, ExpresionVisitor {

	environment: Environment = new Environment();

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

	executeBlock(statements: Stmt[], environment: Environment) {
			let previous = this.environment;
			try {
				this.environment = environment;
	
				statements.forEach(statement => {
					this.execute(statement);
				})
			} finally {
				this.environment = previous;
			}
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
		if (typeof obj === "string" && obj.length > 0) return true;
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

	visitExpression(stmt: Expression) {
		this.evaluate(stmt.expression);
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

	visitVariable(expr: Variable) {
		return this.environment.get(expr.name);
	}

	visitVar(stmt: Var) {
		let value = null;
    if (stmt.initializer != null) {
      value = this.evaluate(stmt.initializer);
    }

    this.environment.define(stmt.name.getLexeme(), value);
    return null;
	}

	visitAssign(expr: Assign) {
		let value = this.evaluate(expr.value);
		this.environment.assign(expr.name, value);
		return value;
	}

	visitBlock(stmt: Block) {
		this.executeBlock(stmt.statements, new Environment(this.environment));
	}

	 visitIf(stmt: If) {
    if (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.thenBranch);
    } else if (stmt.elseBranch != null) {
      this.execute(stmt.elseBranch);
    }
    return null;
  }

	visitLogical(expr: Logical) {
		let left = this.evaluate(expr.left);

		// Short circuiting
    if (expr.operator.getType() == TokenType.OR) {
      if (this.isTruthy(left)) return left;
    } else {
      if (!this.isTruthy(left)) return left;
    }

    return this.evaluate(expr.right);
	}

	visitWhile(stmt) {
		while (this.isTruthy(this.evaluate(stmt.condition))) {
			this.execute(stmt.body);
		}
		return null;
	}
}