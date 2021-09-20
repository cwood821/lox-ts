let Token = require("../src/token").default;
let { TokenType } = require("../src/types");
let { Grouping, Literal, Unary, Binary, Visitor, Expr } = require("./expr");

// let { Visitor, Expr } = require("./expr");

// import Token from "../token";


	

export class AstPrinter {
	constructor() {

	}

  print(expr) {
    return expr.accept(this);
  }

  visitBinary(expr) {
    return this.parenthesize(expr.operator.lexeme,
                        expr.left, expr.right);
  }

  visitGrouping(expr) {
    return this.parenthesize("group", expr.expression);
  }

  visitLiteral(expr) {
    if (expr.value == null) return "nil";
    return expr.value.toString();
  }

  visitUnary(expr) {
		console.log(expr, expr.operator)
    return this.parenthesize(expr.operator.lexeme, expr.right);
  }

	parenthesize(name, ...exprs) {
		let ret = "";
	
		ret += `(${name}`;
		exprs.forEach(expr => {
			ret += " ";
			ret += expr.accept(this);
		})
		ret += ")";
	
		return ret; 
	}
	
}

// function main() {

// 	console.log(Token);

// 	let expr = new Binary( 
// 			new Unary(
// 			new Token(TokenType.MINUS, "-", null, 1),
// 			new Literal(123)
// 		),
// 		new Token(TokenType.STAR, "*", null, 1),
// 		new Grouping(
// 			new Literal(45.67)
// 		)
// 	)

// 	let printer = new AstPrinter()
// 	console.log(printer.print(expr))
// }

// main()