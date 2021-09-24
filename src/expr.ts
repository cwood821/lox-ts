import Token from "./token";

export abstract class Expr {
}

	export interface Visitor {
visitBinary(binary: Binary) 
visitGrouping(grouping: Grouping) 
visitLiteral(literal: Literal) 
visitUnary(unary: Unary) 

}
	
export class Binary extends Expr {
  left: Expr;
  operator: Token;
  right: Expr;
  constructor(left: Expr, operator: Token, right: Expr) {
		super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  } 

accept(visitor: Visitor) {

			return visitor.visitBinary(this);
		}
}

export class Grouping extends Expr {
  expression: Expr;
  constructor(expression: Expr) {
		super();
    this.expression = expression;
  } 

accept(visitor: Visitor) {

			return visitor.visitGrouping(this);
		}
}

export class Literal extends Expr {
  value: Object;
  constructor(value: Object) {
		super();
    this.value = value;
  } 

accept(visitor: Visitor) {

			return visitor.visitLiteral(this);
		}
}

export class Unary extends Expr {
  operator: Token;
  right: Expr;
  constructor(operator: Token, right: Expr) {
		super();
    this.operator = operator;
    this.right = right;
  } 

accept(visitor: Visitor) {

			return visitor.visitUnary(this);
		}
}

