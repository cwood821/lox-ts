import { readFileSync } from "fs";
import { createInterface, Interface as ReadeLineInterface } from "readline";
import { ERROR_CODES, REPL_EXIT } from "./types";

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
  console.log("Source: ", source);
}