import Interpreter from "./interpreter";

export abstract class LoxCallable {
	abstract call(interpreter: Interpreter, args: any[])
	abstract arity(): number
}

export function isCallable(type) {
	return type && type.call && type.arity;
}

export class Clock implements LoxCallable {
	call(interpreter, args) {
		let ms = Date.now();
		return Math.floor(ms / 1000);
	}

	arity() {
		return 0;
	}

	toString() {
		return "<native fn>"
	}
}
