import Interpreter from "./interpreter";
import LoxInstance from "./instance";
import { LoxFunction } from "./function";

export default class LoxClass {
	public name: string;
	private methods: {[key: string]: LoxFunction} = {};

	constructor(name: string, methods: {[key: string]: LoxFunction}) {
		this.name = name;
		this.methods = methods;
	}

	arity() {
		return 0;
	}

	call(interpreter: Interpreter, args: any[]) {
		let instance = new LoxInstance(this);
		return instance;
	}

	findMethod(name: string): LoxFunction | null {
		if (this.methods[name]) {
			return this.methods[name];
		}

		return null;
	}

	toString() {
		return this.name;
	}
}