import { Expr } from "./expr";

export abstract class Stmt {
  abstract accept(visitor: Visitor)
}

	export interface Visitor {
visitExpression(expression: Expression) 
visitPrint(print: Print) 

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

