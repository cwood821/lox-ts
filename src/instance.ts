import LoxClass from "./class";
import Token from "./token";

export default class LoxInstance {
	private klass: LoxClass;
	private fields: Map<string, any> = new Map();

	constructor(klass: LoxClass) {
		this.klass = klass;
	}

	public toString(): string {
    return this.klass.name + " instance";
  }

	public get(name: Token) {
		if (this.fields.has(name.getLexeme())) {
      return this.fields.get(name.getLexeme());
    }

		let method = this.klass.findMethod(name.getLexeme());
    if (method != null) return method.bind(this);

    throw new Error("Undefined property '" + name.getLexeme() + "'.");
	}

	public set(name: Token, value: any) {
    this.fields.set(name.getLexeme(), value);
  }

}