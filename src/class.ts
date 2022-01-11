import Interpreter from "./interpreter";
import LoxInstance from "./instance";
import { LoxFunction } from "./function";

const CONSTRUCTOR_METHOD = "init";

export default class LoxClass {
	public name: string;
	public superclass: LoxClass | null;
	private methods: {[key: string]: LoxFunction} = {};

	constructor(name: string, superclass: LoxClass, methods: {[key: string]: LoxFunction}) {
		this.superclass = superclass;
		this.name = name;
		this.methods = methods;
	}

	arity() {
		let initializer = this.findMethod(CONSTRUCTOR_METHOD);
    if (initializer === null) return 0;
		return initializer.arity();
	}

	call(interpreter: Interpreter, args: any[]) {
		let instance = new LoxInstance(this);
		let initializer = this.findMethod(CONSTRUCTOR_METHOD);

		if (initializer !== null) {
			initializer.bind(instance).call(interpreter, args);
		}

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