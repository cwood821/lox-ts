import Token from "../src/token";

export abstract class Expression {
}
	export interface Visitor<T> {
visitBinary<T>(binary: Binary): T
visitGrouping<T>(grouping: Grouping): T
visitLiteral<T>(literal: Literal): T
visitUnary<T>(unary: Unary): T

}
	
export class Binary extends Expression {
  left: Expression;
  operator: Token;
  right: Expression;
  constructor(left: Expression, operator: Token, right: Expression) {
		super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  } 

accept(visitor: Visitor<Binary>) {
			return visitor.visitBinary(this);
		}
}

export class Grouping extends Expression {
  expression: Expression;
  constructor(expression: Expression) {
		super();
    this.expression = expression;
  } 

accept(visitor: Visitor<Grouping>) {

			return visitor.visitGrouping(this);
		}
}

export class Literal extends Expression {
  value: Object;
  constructor(value: Object) {
		super();
    this.value = value;
  } 

accept(visitor: Visitor<Literal>) {

			return visitor.visitLiteral(this);
		}
}

export class Unary extends Expression {
  operator: Token;
  right: Expression;
  constructor(operator: Token, right: Expression) {
		super();
    this.operator = operator;
    this.right = right;
  } 

accept(visitor: Visitor<Unary>) {

			return visitor.visitUnary(this);
		}
}

