import { TOKEN_TYPE } from "./types";

export default class Token {
  
  private tokenType: TOKEN_TYPE;
  private lexeme: string;
  private literal?: object;
  private line: number;

  constructor(type: TOKEN_TYPE, lexeme: string, literal: object | undefined, line: number) {
    this.tokenType = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
  }

  isType(type: TOKEN_TYPE) {
    return this.tokenType === type;
  }

  toString() {
    return this.tokenType + " " + this.lexeme;
  }

}