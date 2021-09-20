
export const REPL_EXIT = ".exit";

// https://www.freebsd.org/cgi/man.cgi?query=sysexits&apropos=0&sektion=0&manpath=FreeBSD+4.3-RELEASE&format=html
export enum ERROR_CODES {
  EX_USAGE = 64,
}

export type Literal = string | number | undefined;

export enum TokenType {
  // Single-character tokens.
  LEFT_PAREN, 
  RIGHT_PAREN, 
  LEFT_BRACE, 
  RIGHT_BRACE,
  COMMA, 
  DOT, 
  MINUS, 
  PLUS, 
  SEMICOLON, 
  SLASH, 
  STAR,

  // One or two character tokens.
  BANG, 
  BANG_EQUAL,
  EQUAL, 
  EQUAL_EQUAL,
  GREATER, 
  GREATER_EQUAL,
  LESS, 
  LESS_EQUAL,

  // Literals.
  IDENTIFIER, 
  STRING, 
  NUMBER,

  // Keywords.
  AND, 
  CLASS, 
  ELSE, 
  FALSE, 
  FUN, 
  FOR, 
  IF, 
  NIL, 
  OR,
  PRINT, 
  RETURN, 
  SUPER, 
  THIS, 
  TRUE, 
  VAR, 
  WHILE,

  EOF
}

export const KEYWORDS: { [key: string]: TokenType } = {
  "and": TokenType.AND,
  "class": TokenType.CLASS,
  "else": TokenType.ELSE,
  "false": TokenType.FALSE,
  "fun": TokenType.FUN,
  "for": TokenType.FOR,
  "if": TokenType.IF,
  "nil": TokenType.NIL,
  "or": TokenType.OR,
  "print": TokenType.PRINT,
  "return": TokenType.RETURN,
  "super": TokenType.SUPER,
  "this": TokenType.THIS,
  "true": TokenType.TRUE,
  "var": TokenType.VAR,
  "while": TokenType.WHILE
}