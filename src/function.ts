import { LoxCallable } from "./callable";
import Environment from "./environment";
import Interpreter from "./interpreter";
import { Func } from "./stmt";

export class LoxFunction implements LoxCallable {
  private declaration: Func;
  constructor(declaration: Func) {
    this.declaration = declaration;
  }

  call(interpreter: Interpreter, args: any[]) {
    let environment = new Environment(interpreter.globals);
    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(this.declaration.params[i].getLexeme(), args[i]);
    }

    interpreter.executeBlock(this.declaration.body, environment);
    return null;
  }

	arity() {
		return this.declaration.params.length;
	}

	toString() {
		return "<fn " + this.declaration.name.getLexeme() + ">";
	}
}