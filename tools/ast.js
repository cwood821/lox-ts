let { writeFileSync, readFileSync } = require("fs");
const { basename } = require("path");

const types = {
	"Assign": "name: Token, value: Expr",
	"Binary": "left: Expr, operator: Token, right: Expr",
	"Call": "callee: Expr, paren: Token, args: Expr[]",
	"Get": "object: Expr, name: Token",
	"ExprSet": "obj: Expr, name: Token, value: Expr",
	"This": "keyword: Token",
	"Grouping": "expression: Expr",
	"Literal": "value: Object",
	"Logical": "left: Expr, operator: Token, right: Expr",
	"Unary": "operator: Token, right: Expr",
	"Variable": "name: Token"
}

const statements = {
	"Expression": "expression: Expr",
	"Block": "statements: Stmt[]",
	"Class": "name: Token, methods: Func[]",
	"Func": "name: Token, params: Token[], body: Stmt[]",
	"If": "condition: Expr, thenBranch: Stmt, elseBranch: Stmt | null",
	"Print": "expression: Expr",
	"Ret": "keyword: Token, value: Expr",
	"Var": "name: Token, initializer: Expr",
	"While": "condition: Expr, body: Stmt"
};

function writeClasses(path, name, types, imports = "") {
	// Base class
	let base = `${imports}

export abstract class ${name} {
	abstract accept(visitor: Visitor)
}
`;

	// visitor interface
	let visitor = `export interface Visitor {\n`
	for (let type of Object.keys(types)) {
		let field = types[type];
		let [name, typeName] = field.split(":");
		// let titleCase = typeName.charAt(0).toUpperCase() + typeName.slice(1);
		let param = type.toLowerCase();
		if (param === "if" || param === "var" || param === "while") {
			param += "Stmt"
		}
		visitor += `visit${type}(${param}: ${type}) \n`;
	}

	visitor += `\n}`

	let classes = '\n';

	for (type of Object.keys(types)) {
		let className = type;
		let fields = types[type].split(", ");

		classes += `export class ${className} extends ${name} {`;

		fields.forEach(field => {
			classes += `\n  ` + field + `;`;
		})

		classes += `\n`;
		classes += `  constructor(`;

		fields.forEach((field, i) => {	
			classes += `${field}`
			classes += i < fields.length -1 ? `, ` : '';
		});

		classes += `) {
		super();`;

		fields.forEach((field, i) => {	
			let name = field.split(":")[0];
			classes += `\n    this.${name} = ${name};`
		});


		// body
		classes += `\n  } \n\n`  

		// Visitor pattern accept method
		classes += `accept(visitor: Visitor) {\n
			return visitor.visit${className}(this);
		}`

		classes += '\n}\n\n';
	}

	// Statements
	// for (statement of Object.keys(statements)) {	
	// 	let className = statement;
	// 	let fields = statements[statement].split(", ")

	// 	classes += `export class ${className} extends Stmt  {`;

	// 	fields.forEach(field => {
	// 		classes += `\n  ` + field + `;`;
	// 	})

	// 	classes += `\n`;
	// 	classes += `  constructor(`;

	// 	fields.forEach((field, i) => {	
	// 		classes += `${field}`
	// 		classes += i < fields.length -1 ? `, ` : '';
	// 	});

	// 	classes += `) {
	// 	super();`;

	// 	fields.forEach((field, i) => {	
	// 		let name = field.split(":")[0];
	// 		classes += `\n    this.${name} = ${name};`
	// 	});


	// 	// body
	// 	classes += `\n  } \n\n`  

	// 	// Visitor pattern accept method
	// 	classes += `accept(visitor: Visitor<${type}>) {\n
	// 		return visitor.visit${className}(this);
	// 	}`

	// 	classes += '\n}\n\n';
	// }

	writeFileSync(path + `/${name.toLowerCase()}.ts` , `${base}
	${visitor}
	${classes}`)

}

const cwd = process.cwd();

writeClasses(cwd, "Expr", types, `import Token from "./token";`);

writeClasses(cwd, "Stmt", statements, 'import { Expr } from "./expr"; import Token from "./token";');