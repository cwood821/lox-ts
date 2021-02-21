import Token from "./token"
import { reportError } from "./lox"
import { TOKEN_TYPE } from "./types";

export default class Scanner {
  private source: string;
  private tokens: Token[] = [];
  private start = 0;
  private current = 0; 
  private line = 1;

  constructor(source: string) {
    this.source = source;
  }

  scanTokens() {

    while (!this.isAtEnd())  {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token(TOKEN_TYPE.EOF, "", undefined, this.line));
    return this.tokens;
  }

  advance(): string {
    this.current++;
    return this.source.charAt(this.current - 1);
  }

  addToken(type: TOKEN_TYPE, literal?: object) {
    let text = this.source.substring(this.start,this.current);
    this.tokens.push(new Token(type, text, literal, this.line));
  }

  // Functions like a conditional 'advance'. Handles cases like 
  // !=, where the lexeme are multiple characters
  match(char: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.source.charAt(this.current) !== char) return false;
    // The next character matched, so we consume it
    this.current++;
    return true;
  }

  // Check the next character without consuming  
  peek(): string {
    if (this.isAtEnd()) return '\0';
    return this.source.charAt(this.current);
  }

  scanToken() {
    let c: string = this.advance();
    switch (c) {
      case '(': 
        this.addToken(TOKEN_TYPE.LEFT_PAREN); 
        break;
      case ')': 
        this.addToken(TOKEN_TYPE.RIGHT_PAREN); 
        break;
      case '{': 
        this.addToken(TOKEN_TYPE.LEFT_BRACE); 
        break;
      case '}': 
        this.addToken(TOKEN_TYPE.RIGHT_BRACE); 
        break;
      case ',': 
        this.addToken(TOKEN_TYPE.COMMA); 
        break;
      case '.': 
        this.addToken(TOKEN_TYPE.DOT); 
        break;
      case '-': 
        this.addToken(TOKEN_TYPE.MINUS); 
        break;
      case '+': 
        this.addToken(TOKEN_TYPE.PLUS); 
        break;
      case ';': 
        this.addToken(TOKEN_TYPE.SEMICOLON); 
        break;
      case '*': 
        this.addToken(TOKEN_TYPE.STAR); 
        break; 
      case '!':
        this.addToken(this.match('=') ? TOKEN_TYPE.BANG_EQUAL : TOKEN_TYPE.BANG);
        break;
      case '=':
        this.addToken(this.match('=') ? TOKEN_TYPE.EQUAL_EQUAL : TOKEN_TYPE.EQUAL);
        break;
      case '<':
        this.addToken(this.match('=') ? TOKEN_TYPE.LESS_EQUAL : TOKEN_TYPE.LESS);
        break;
      case '>':
        this.addToken(this.match('=') ? TOKEN_TYPE.GREATER_EQUAL : TOKEN_TYPE.GREATER);
        break;
      case '/':
        if (this.match('/')) {
          // A comment goes until the end of the line.
          // Advance until the end and throw it away
          while (this.peek() !== '\n' && !this.isAtEnd()) this.advance();
        } else {
          this.addToken(TOKEN_TYPE.SLASH);
        }
        break;
      case ' ':
      case '\r':
      case '\t':
        // Ignore whitespace.
        break;
      case '\n':
        this.line++;
        break;
      default:
        reportError(this.line, "Unexpected Character.");
        break;
    }
    // 
  }

  isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

}