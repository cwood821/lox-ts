let { writeFileSync, readFileSync } = require("fs");
const { basename } = require("path");

const types = {
	"Binary": "left: Expr, operator: Token, right: Expr",
	"Grouping": "expression: Expr",
	"Literal": "value: Object",
	"Unary": "operator: Token, right: Expr"
}

const statements = {
	"Expression": "expression: Expr",
	"Print": "expression: Expr"
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
	for (type of Object.keys(types)) {
		let field = types[type];
		let [name, typeName] = field.split(":");
		// let titleCase = typeName.charAt(0).toUpperCase() + typeName.slice(1);
		visitor += `visit${type}(${type.toLowerCase()}: ${type}) \n`
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

writeClasses(cwd, "Stmt", statements, 'import { Expr } from "./expr";');