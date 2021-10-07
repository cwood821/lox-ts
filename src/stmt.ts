import { Expr } from "./expr"; import Token from "./token";

export abstract class Stmt {
	abstract accept(visitor: Visitor)
}

	export interface Visitor {
visitExpression(expression: Expression) 
visitBlock(block: Block) 
visitIf(ifStmt: If) 
visitPrint(print: Print) 
visitVar(varStmt: Var) 

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

