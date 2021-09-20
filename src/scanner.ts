import Token from "./token"
import { reportError } from "./lox"
import { TokenType, Literal, KEYWORDS } from "./types";

export default class Scanner {
  private source: string;
  private tokens: Token[] = [];
  private start = 0;
  private current = 0; 
  private line = 1;

  constructor(source: string) {
    this.source = source;
  }

  scanTokens(): Token[] {

    while (!this.isAtEnd())  {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token(TokenType.EOF, "", undefined, this.line));
    return this.tokens;
  }

  advance(): string {
    this.current++;
    return this.source.charAt(this.current - 1);
  }

  addToken(type: TokenType, literal?: Literal) {
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

  peekNext(): string {
    if (this.current + 1 >= this.source.length) return '\0';

    return this.source.charAt(this.current + 1);
  }

  // Handles string literals
  // Lox only supports double quotations
  string() {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() == '\n') this.line++;
      this.advance();
    }

    if (this.isAtEnd()) {
      reportError(this.line, "Unterminated String")
    }

    // Closing "
    this.advance();

    // Inside the quotes, start of token to end of token
    let value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, value);
  }

  // This works because
  isDigit(char: string): boolean {
    // String comparison works here because of ordering of encoding
    return char >= '0' && char <= '9';
  }

  // Handle numbers
  number() {
    // Consume everything in integer portion
    while (this.isDigit(this.peek())) this.advance();

    // Look for a fractional part.
    if (this.peek() == '.' && this.isDigit(this.peekNext())) {
      // Consume the "."
      this.advance();
      while (this.isDigit(this.peek())) this.advance();
    }

    this.addToken(
        TokenType.NUMBER, 
        // Note: parseFloat is equivalent to 'parseDouble'
        // because JS only has one type of number 
        // https://stackoverflow.com/questions/21278234/does-parsedouble-exist-in-javascript
        parseFloat(this.source.substring(this.start, this.current))
    );
  }

  isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z')  ||
           (char >= 'A' && char <= 'Z') ||
           char === '_';
  }

  isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }

  identifier() {
    // While the next character is alphanumeric 
    while (this.isAlphaNumeric(this.peek())) this.advance();

    let text = this.source.substring(this.start, this.current);
    let type = KEYWORDS[text] ? KEYWORDS[text] : TokenType.IDENTIFIER;

    this.addToken(type);
  }

  scanToken() {
    let c: string = this.advance();
    switch (c) {
      case '(': 
        this.addToken(TokenType.LEFT_PAREN); 
        break;
      case ')': 
        this.addToken(TokenType.RIGHT_PAREN); 
        break;
      case '{': 
        this.addToken(TokenType.LEFT_BRACE); 
        break;
      case '}': 
        this.addToken(TokenType.RIGHT_BRACE); 
        break;
      case ',': 
        this.addToken(TokenType.COMMA); 
        break;
      case '.': 
        this.addToken(TokenType.DOT); 
        break;
      case '-': 
        this.addToken(TokenType.MINUS); 
        break;
      case '+': 
        this.addToken(TokenType.PLUS); 
        break;
      case ';': 
        this.addToken(TokenType.SEMICOLON); 
        break;
      case '*': 
        this.addToken(TokenType.STAR); 
        break; 
      case '!':
        this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
        break;
      case '=':
        this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
        break;
      case '<':
        this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      case '>':
        this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);
        break;
      case '/':
        if (this.match('/')) {
          // A comment goes until the end of the line.
          // Advance until the end and throw it away
          while (this.peek() !== '\n' && !this.isAtEnd()) this.advance();
        } else {
          this.addToken(TokenType.SLASH);
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

      // Start of a string
      case '"': 
        this.string();
        break;

      default:
        // We handle digits here rather than handling every
        // decimal digit individually
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          reportError(this.line, "Unexpected Character.");
        }
        break;
    }
    // 
  }

  isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

}