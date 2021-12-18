import { Literal, Grouping, Unary, Binary, Expr, Assign, Visitor as ExpresionVisitor, Variable, Logical, Call, Get, ExprSet, This } from "./expr";
import { Stmt, Expression, Print, Visitor as StatementVisitor, Var, Block, If, Func, Ret, Class } from "./stmt";
import Interpreter from "./interpreter";
import Token from "./token";
import { Lox } from "./lox";

enum FunctionType {
	NONE,
	FUNCTION,
	INITIALIZER,
	METHOD
}

export default class Resolver implements StatementVisitor, ExpresionVisitor {
  private interpreter: Interpreter;
	private scopes: {[key: string]: boolean}[] = [];
	private currentFunction: FunctionType = FunctionType.NONE;

  constructor(interpreter: Interpreter) {
    this.interpreter = interpreter;
  }

	// Can typescript do overloading based on params?
	resolveMany(statements) {
		statements.forEach(stmt => this.resolve(stmt))
	}

	resolve(stmt) {
		stmt.accept(this);
	}

	beginScope() {
    this.scopes.push({});
		// "top" of stack is last element
		return this.scopes[this.scopes.length - 1];
  }

	endScope() {
		this.scopes.pop();
	}

	declare(name: Token) {
    if (this.scopes.length === 0) return;
    let scope = this.scopes[this.scopes.length - 1];

		if (scope.hasOwnProperty(name.getLexeme())) {
      Lox.error(name, "Already a variable with this name in this scope."); 
		}

    scope[name.getLexeme()] = false;
  }

	define(name: Token) {
		if (this.scopes.length === 0) return;

		this.scopes[0][name.getLexeme()] = true;
	}

	visitBlock(stmt) {
    this.beginScope();
    this.resolveMany(stmt.statements);
    this.endScope();
    return null;
  }

	visitVar(stmt) {
		this.declare(stmt.name);
    if (stmt.initializer != null) {
      this.resolve(stmt.initializer);
    }
    this.define(stmt.name);
    return null;
	}

	visitVariable(expr) {
		if (this.scopes.length !== 0 && this.scopes[0][expr.name.getLexeme()] == false) {
      Lox.error(expr.name,
          "Can't read local variable in its own initializer.");
    }

    this.resolveLocal(expr, expr.name);
    return null;
	}

	visitAssign(expr) {
		this.resolve(expr.value);
		this.resolveLocal(expr, expr.name);
		return null;
	}

	visitFunc(stmt) {
		this.declare(stmt.name);
		// Defining the name before resolving let's a function refer to itself
    this.define(stmt.name);

    this.resolveFunction(stmt, FunctionType.FUNCTION);
    return null;
	}

	visitClass(stmt: Class) {
		this.declare(stmt.name);
    this.define(stmt.name);

		let scope = this.beginScope();
    scope["this"] = true;

		stmt.methods.forEach(method => {
			let declaration = FunctionType.METHOD;
			if (method.name.getLexeme() === "init") {
        declaration = FunctionType.INITIALIZER;
      }
      this.resolveFunction(method, declaration); 
		})

		this.endScope();
		
		return null;
	}

	visitGet(expr: Get) {
		this.resolve(expr.object);
		return null;
	}

	visitExprSet(expr: ExprSet) {
		this.resolve(expr.value);
    this.resolve(expr.obj);
    return null;
	}

	visitThis(expr: This) {
		this.resolveLocal(expr, expr.keyword);
		return null;
	}

	visitExpression(stmt) {
		this.resolve(stmt.expression);
    return null;
	}

	visitIf(stmt) {
		this.resolve(stmt.condition);
    this.resolve(stmt.thenBranch);
    if (stmt.elseBranch != null) this.resolve(stmt.elseBranch);
    return null;
	}

	visitPrint(stmt) {
		this.resolve(stmt.expression);
		return null;
	}

	visitRet(stmt) {
		if (this.currentFunction == FunctionType.NONE) {
      Lox.error(stmt.keyword, "Can't return from top-level code.");
    }

		if (stmt.value != null) {
			if (this.currentFunction == FunctionType.INITIALIZER) {
        Lox.error(stmt.keyword, "Can't return a value from an initializer.");
      }
      this.resolve(stmt.value);
    }
		return null;
	}

	visitWhile(stmt) {
		this.resolve(stmt.condition);
    this.resolve(stmt.body);
		return null;
	}

	visitBinary(expr) {
		this.resolve(expr.left);
    this.resolve(expr.right);
    return null;
	}

	visitCall(expr) {
		this.resolve(expr.callee);
		expr.args.forEach(arg => this.resolve(arg));
    return null;
	}

	visitGrouping(expr) {
		this.resolve(expr.expression);
    return null;
	}

	visitLiteral(expr) {
		return null;
	}

	visitLogical(expr) {
		this.resolve(expr.left);
    this.resolve(expr.right);
    return null;
	}

	visitUnary(expr) {
		this.resolve(expr.right);
    return null;
	}

	resolveFunction(func, functType) {
		let enclosingFunction = this.currentFunction;
		this.currentFunction = functType;
		this.beginScope();
		func.params.forEach(param => {
      this.declare(param);
      this.define(param);
    });

    this.resolveMany(func.body);
    this.endScope();
		this.currentFunction = enclosingFunction;
	}

	resolveLocal(expr: Expr, name: Token) {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].hasOwnProperty(name.getLexeme())) {
        this.interpreter.resolve(expr, this.scopes.length - 1 - i);
        return;
      }
    }
  }


}