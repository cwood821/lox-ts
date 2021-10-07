import Token from "./token";

export abstract class Expr {
	abstract accept(visitor: Visitor)
}

	export interface Visitor {
visitAssign(assign: Assign) 
visitBinary(binary: Binary) 
visitGrouping(grouping: Grouping) 
visitLiteral(literal: Literal) 
visitLogical(logical: Logical) 
visitUnary(unary: Unary) 
visitVariable(variable: Variable) 

}
	
export class Assign extends Expr {
  name: Token;
  value: Expr;
  constructor(name: Token, value: Expr) {
		super();
    this.name = name;
    this.value = value;
  } 

accept(visitor: Visitor) {

			return visitor.visitAssign(this);
		}
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

export class Logical extends Expr {
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

			return visitor.visitLogical(this);
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

export class Variable extends Expr {
  name: Token;
  constructor(name: Token) {
		super();
    this.name = name;
  } 

accept(visitor: Visitor) {

			return visitor.visitVariable(this);
		}
}

