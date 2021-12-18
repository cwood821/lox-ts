import { LoxCallable } from "./callable";
import Environment from "./environment";
import LoxInstance from "./instance";
import Interpreter from "./interpreter";
import { Func } from "./stmt";

export class LoxFunction implements LoxCallable {
  private declaration: Func;
	private closure: Environment;
	private isInitializer: boolean;

  constructor(declaration: Func, closure: Environment, isInitializer: boolean) {
    this.declaration = declaration;
		this.closure = closure;
		this.isInitializer = isInitializer;
  }

	bind(instance: LoxInstance) {
		let environment = new Environment(this.closure);
		environment.define("this", instance);
		return new LoxFunction(this.declaration, environment, this.isInitializer);
	}

  call(interpreter: Interpreter, args: any[]) {
    let environment = new Environment(this.closure);

    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(this.declaration.params[i].getLexeme(), args[i]);
    }

		// We use an exception to jump out of deeploy nested functions with a return
		try {
			interpreter.executeBlock(this.declaration.body, environment);
		} catch (returnValue) {
			// Empty returns in a class return this rather than nil 
			if (this.isInitializer) return this.closure.getAt(0, "this");
			return returnValue?.value; 
		}

		if (this.isInitializer) return this.closure.getAt(0, "this");

    return null;
  }

	arity() {
		return this.declaration.params.length;
	}

	toString() {
		return "<fn " + this.declaration.name.getLexeme() + ">";
	}
}