import { Expr } from "./expr"; import Token from "./token";

export abstract class Stmt {
	abstract accept(visitor: Visitor)
}

	export interface Visitor {
visitExpression(expression: Expression) 
visitBlock(block: Block) 
visitClass(klass: Class) 
visitFunc(func: Func) 
visitIf(ifStmt: If) 
visitPrint(print: Print) 
visitRet(ret: Ret) 
visitVar(varStmt: Var) 
visitWhile(whileStmt: While) 

}
	
export class Expression extends Stmt {
  expression: Expr;
  constructor(expression: Expr) {
		super();
    this.expression = expression;
  } 

accept(visitor: Visitor) {

			return visitor.visitExpression(this);
		}
}

export class Block extends Stmt {
  statements: Stmt[];
  constructor(statements: Stmt[]) {
		super();
    this.statements = statements;
  } 

accept(visitor: Visitor) {

			return visitor.visitBlock(this);
		}
}

export class Class extends Stmt {
  name: Token;
  methods: Func[];
  constructor(name: Token, methods: Func[]) {
		super();
    this.name = name;
    this.methods = methods;
  } 

accept(visitor: Visitor) {

			return visitor.visitClass(this);
		}
}

export class Func extends Stmt {
  name: Token;
  params: Token[];
  body: Stmt[];
  constructor(name: Token, params: Token[], body: Stmt[]) {
		super();
    this.name = name;
    this.params = params;
    this.body = body;
  } 

accept(visitor: Visitor) {

			return visitor.visitFunc(this);
		}
}

export class If extends Stmt {
  condition: Expr;
  thenBranch: Stmt;
  elseBranch: Stmt | null;
  constructor(condition: Expr, thenBranch: Stmt, elseBranch: Stmt | null) {
		super();
    this.condition = condition;
    this.thenBranch = thenBranch;
    this.elseBranch = elseBranch;
  } 

accept(visitor: Visitor) {

			return visitor.visitIf(this);
		}
}

export class Print extends Stmt {
  expression: Expr;
  constructor(expression: Expr) {
		super();
    this.expression = expression;
  } 

accept(visitor: Visitor) {

			return visitor.visitPrint(this);
		}
}

export class Ret extends Stmt {
  keyword: Token;
  value: Expr;
  constructor(keyword: Token, value: Expr) {
		super();
    this.keyword = keyword;
    this.value = value;
  } 

accept(visitor: Visitor) {

			return visitor.visitRet(this);
		}
}

export class Var extends Stmt {
  name: Token;
  initializer: Expr;
  constructor(name: Token, initializer: Expr) {
		super();
    this.name = name;
    this.initializer = initializer;
  } 

accept(visitor: Visitor) {

			return visitor.visitVar(this);
		}
}

export class While extends Stmt {
  condition: Expr;
  body: Stmt;
  constructor(condition: Expr, body: Stmt) {
		super();
    this.condition = condition;
    this.body = body;
  } 

accept(visitor: Visitor) {

			return visitor.visitWhile(this);
		}
}

