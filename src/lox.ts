import { readFileSync } from "fs";
import { createInterface, Interface as ReadeLineInterface } from "readline";
import { ERROR_CODES, REPL_EXIT } from "./types";
import Scanner from "./scanner";

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
  run(content);
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
    run(content);
  }

  rl.close(); 
}

function run(source: string) {
  let scanner = new Scanner(source);
  let tokens = scanner.scanTokens();

  // Print the tokens for now
  tokens.forEach(token => console.log(token));
}


export function reportError(lineNum: number, message: string) {
  report(lineNum, "", message);
}

function report(lineNum: number, where: string, message: string) {
  console.error(`[line ${lineNum} ] Error ${where} + ${message}`);
  // hadError = true -- should we hold this in state or throw custom exceptions instead? 
}