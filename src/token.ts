import { Literal, TOKEN_TYPE } from "./types";

export default class Token {
  
  private tokenType: TOKEN_TYPE;
  private lexeme: string;
  private literal?: Literal;
  private line: number;

  constructor(type: TOKEN_TYPE, lexeme: string, literal: Literal, line: number) {
    this.tokenType = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
  }

  isType(type: TOKEN_TYPE) {
    return this.tokenType === type;
  }

  getLiteral(): Literal {
    return this.literal;
  }

  toString() {
    return this.tokenType + " " + this.lexeme;
  }

}