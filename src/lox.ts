import { readFileSync } from "fs";
import { createInterface, Interface as ReadeLineInterface } from "readline";
import { ERROR_CODES, REPL_EXIT } from "./types";
import Scanner from "./scanner";
import Token from "./token";
import { TokenType } from "./types";
import { AstPrinter } from "../tools/printer";
import Parser from "./parser";
import { exit } from "process";
import Interpreter from "./interpreter";

export function lox(args: string[]) {
  if (args.length > 1) {
    process.exit(ERROR_CODES.EX_USAGE);
  } else if (args.length === 1) {
    runFile(args[0]);
  } else {
    runPrompt();
  }
}

function runFile(path: string) {
  // TODO: error handling for file not found, permissions, etc.
  const content = readFileSync(path, {
    encoding: "ascii"
  });
  Lox.run(content);

  if (Lox.hadError) exit(65);
  if (Lox.hadRuntimeError) exit(70);
}

async function prompt(rl: ReadeLineInterface): Promise<string> {
  return new Promise((resolve) => {
    rl.question('> ', resolve);
  })
}

async function runPrompt() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  while (true) {
    let content = await prompt(rl);
    if (content === REPL_EXIT) break;
    Lox.run(content);
  }

  rl.close(); 
}

// function run(source: string) {
//   let scanner = new Scanner(source);
//   let tokens = scanner.scanTokens();

//   // Print the tokens for now
//   tokens.forEach(token => console.log(token));
// }


export class Lox {
  static hadError = false;
  static hadRuntimeError = false;

  static run(source: string) {
    let scanner = new Scanner(source);
    let tokens = scanner.scanTokens();
    let parser = new Parser(tokens);
    let parsed = parser.parse();
    let intepreter = new Interpreter();

    // Syntax error
    if (Lox.hadError) return;

    // Print the tokens for now
    // tokens.forEach(token => console.log(token));
    // let printer = new AstPrinter();
    // let result = printer.print(parsed);
    // console.log('result', result);

    // @ts-ignore - null
    console.log(intepreter.interpret(parsed));
  }

  static runtimeError(error) {
    this.hadRuntimeError = true;
    console.error(`${error.message} [line ${error.token.line}]`);
  }

  static error(token, message) {
    Lox.hadError = true;
    if (token.type == TokenType.EOF) {
      report(token.getLine(), " at end", message);
    } else {
      report(token.getLine(), " at '" + token.getLexeme() + "'", message);
    } 
  }
}


export function reportError(lineNum: number, message: string) {
  report(lineNum, "", message);
}

export function parserError(token: Token, message: string) {
  if (token.getType() == TokenType.EOF) {
    report(token.getLine(), " at end", message);
  } else {
    report(token.getLine(), " at '" + token.getLexeme() + "'", message);
  }
}

function report(lineNum: number, where: string, message: string) {
  console.error(`[line ${lineNum} ] Error ${where} + ${message}`);
  // hadError = true -- should we hold this in state or throw custom exceptions instead? 
}