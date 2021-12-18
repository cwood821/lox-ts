import RuntimeError from "./errors/runtime";
import { Literal, Grouping, Unary, Binary, Expr, Assign, Visitor as ExpresionVisitor, Variable, Logical, Call, This } from "./expr";
import { Stmt, Expression, Print, Visitor as StatementVisitor, Var, Block, If, Func, Ret } from "./stmt";
import { LoxCallable, Clock, isCallable } from "./callable";
import { LoxFunction } from "./function";
import LoxClass from "./class";
import ReturnException from "./return";
import { TokenType } from "./types";
import { Lox } from "./lox";
import LoxInstance from "./instance";
import Environment from "./environment";



export default class Interpreter implements StatementVisitor, ExpresionVisitor {
	globals: Environment = new Environment();
	locals = new Map();
	environment: Environment = this.globals;

	constructor() {
		this.globals.define("clock", new Clock());

	}

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

	resolve(expr, depth: number) {
		this.locals.set(expr, depth);
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

	lookupVariable(name, expr: Expr) {
		let distance = this.locals.get(expr);
    if (distance !== undefined && distance !== null) {
      let val = this.environment.getAt(distance, name.lexeme);
			return val;
    } else {
      return this.globals.get(name);
    }
	}

	visitVariable(expr: Variable) {
		return this.lookupVariable(expr.name, expr);
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

		let distance = this.locals.get(expr);
    if (distance != null) {
      this.environment.assignAt(distance, expr.name, value);
    } else {
      this.globals.assign(expr.name, value);
    }

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

	visitCall(expr: Call) {
    let callee = this.evaluate(expr.callee);

    let args = [];
		expr.args.forEach((arg) => { 
			// @ts-ignore
			args.push(this.evaluate(arg));
		});

		if (!isCallable(callee)) {
      throw new RuntimeError(expr.paren,
          "Can only call functions and classes.");
    }

    let fun: LoxCallable = callee;

		if (args.length != fun.arity()) {
      throw new RuntimeError(expr.paren, "Expected " +
          fun.arity() + " arguments but got " +
          args.length + ".");
    }

    return fun.call(this, args);
  }

	visitClass(stmt) {
		this.environment.define(stmt.name.lexeme, null);

		let methods: {[key: string]: LoxFunction} = {};
		stmt.methods.forEach(method => {
      let func = new LoxFunction(method, this.environment, method.name.getLexeme() === "init");
      methods[method.name.getLexeme()] = func;
		})

    let klass = new LoxClass(stmt.name.lexeme, methods);
    this.environment.assign(stmt.name, klass);
    return null;
	}

	visitGet(expr) {
		let obj = this.evaluate(expr.object);

    if (obj instanceof LoxInstance) {
      let res = obj.get(expr.name);
			return res;
    }

    throw new RuntimeError(expr.name,
        "Only instances have properties.");
	}

	visitExprSet(expr) {
		let object = this.evaluate(expr.obj);

    if (!(object instanceof LoxInstance)) { 
      throw new RuntimeError(expr.name, "Only instances have fields.");
    }

    let value = this.evaluate(expr.value);
    object.set(expr.name, value);
    return value;
	}

	visitThis(expr: This) {
		return this.lookupVariable(expr.keyword, expr);
	}

	visitFunc(stmt: Func) {
		// We pass the current environment at time of definition, which is a closure 
    let func = new LoxFunction(stmt, this.environment, false);
    this.environment.define(stmt.name.getLexeme(), func);
    return null;
  }

	visitRet(stmt) {
		let value = null;
		if (stmt.value != null) value = this.evaluate(stmt.value);

		throw new ReturnException(value);
	}

}
