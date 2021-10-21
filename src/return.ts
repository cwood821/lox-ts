
export default class ReturnException extends Error {
  value;

  constructor(value) {
    super();
    this.value = value;
  }
}