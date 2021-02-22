
export const REPL_EXIT = ".exit";

// https://www.freebsd.org/cgi/man.cgi?query=sysexits&apropos=0&sektion=0&manpath=FreeBSD+4.3-RELEASE&format=html
export enum ERROR_CODES {
  EX_USAGE = 64,
}

export type Literal = string | number | undefined;

export enum TOKEN_TYPE {
  // Single-character tokens.
  LEFT_PAREN, RIGHT_PAREN, LEFT_BRACE, RIGHT_BRACE,
  COMMA, DOT, MINUS, PLUS, SEMICOLON, SLASH, STAR,

  // One or two character tokens.
  BANG, BANG_EQUAL,
  EQUAL, EQUAL_EQUAL,
  GREATER, GREATER_EQUAL,
  LESS, LESS_EQUAL,

  // Literals.
  IDENTIFIER, STRING, NUMBER,

  // Keywords.
  AND, CLASS, ELSE, FALSE, FUN, FOR, IF, NIL, OR,
  PRINT, RETURN, SUPER, THIS, TRUE, VAR, WHILE,

  EOF
}

export const KEYWORDS: {[key: string]: TOKEN_TYPE} = {
  "and": TOKEN_TYPE.AND,
  "class": TOKEN_TYPE.CLASS,
  "else": TOKEN_TYPE.ELSE,
  "false": TOKEN_TYPE.FALSE,
  "fun": TOKEN_TYPE.FUN,
  "for": TOKEN_TYPE.FOR,
  "if": TOKEN_TYPE.IF,
  "nil": TOKEN_TYPE.NIL,
  "or": TOKEN_TYPE.OR,
  "print": TOKEN_TYPE.PRINT,
  "return": TOKEN_TYPE.RETURN,
  "super": TOKEN_TYPE.SUPER,
  "this": TOKEN_TYPE.THIS,
  "true": TOKEN_TYPE.TRUE,
  "var": TOKEN_TYPE.VAR,
  "while": TOKEN_TYPE.WHILE
}