import Token from "./token";

export default class Environment {
	public enclosing: Environment | null = null;
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

	assignAt(distance: number, name: Token, value) {
		// @ts-ignore - let this error happen for anaysis
    this.ancestor(distance).values.set(name.getLexeme(), value);
	}

	getAt(distance: number, name: string) {
		// @ts-ignore - let this error happen for anaysis
		return this.ancestor(distance).values.get(name);
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

	ancestor(distance: number) {
		let environment: Environment | null = this;
    for (let i = 0; i < distance; i++) {
			// @ts-ignore - let this error happen for analysis 
      environment = environment.enclosing || null;
    }

    return environment;
	}
}