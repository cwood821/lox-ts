import Token from "../src/token";

export abstract class Expr {
}
	export interface Visitor<T> {
visitBinary<T>(binary: Binary): T
visitGrouping<T>(grouping: Grouping): T
visitLiteral<T>(literal: Literal): T
visitUnary<T>(unary: Unary): T

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

accept(visitor: Visitor<Binary>) {

			return visitor.visitBinary(this);
		}
}

export class Grouping extends Expr {
  expression: Expr;
  constructor(expression: Expr) {
		super();
    this.expression = expression;
  } 

accept(visitor: Visitor<Grouping>) {

			return visitor.visitGrouping(this);
		}
}

export class Literal extends Expr {
  value: Object;
  constructor(value: Object) {
		super();
    this.value = value;
  } 

accept(visitor: Visitor<Literal>) {

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

accept(visitor: Visitor<Unary>) {

			return visitor.visitUnary(this);
		}
}

