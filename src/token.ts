import { Literal, TokenType } from "./types";

export default class Token {
  
  private tokenType: TokenType;
  private lexeme: string;
  private literal?: Literal;
  private line: number;

  constructor(type: TokenType, lexeme: string, literal: Literal, line: number) {
    this.tokenType = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
  }

  isType(type: TokenType) {
    return this.tokenType === type;
  }

  getLiteral(): Literal {
    return this.literal;
  }

  getLine(): number {
    return this.line;
  }

  getLexeme(): string {
    return this.lexeme;
  }

  getType(): TokenType {
    return this.tokenType;
  }

  toString() {
    return this.tokenType + " " + this.lexeme;
  }

}