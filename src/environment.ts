import Token from "./token";

export default class Environment {
	private enclosing: Environment | null = null;
	private values: Map<string, object> = new Map();

	constructor(environment: Environment | null = null) {
		this.enclosing = environment;
	}

	define(name: string, value: any) {
		this.values.set(name, value);
	}

	assign(name: Token, value: any) {
    if (this.values.has(name.getLexeme())) {
      this.values.set(name.getLexeme(), value);
      return;
    }

    if (this.enclosing != null) {
      this.enclosing.assign(name, value);
      return;
    }

		throw new Error(`Undefined variable ${name.getLexeme()}.`);
	}


	get(name: Token) {
		if (this.values.has(name.getLexeme())) {
      return this.values.get(name.getLexeme());
    }

		if (this.enclosing != null)  {
			return this.enclosing.get(name);
		}

    throw new Error("Undefined variable '" + name.getLexeme() + "'.");
	}
}