#!/usr/local/bin/node 

import { lox } from "./lox";

let args = process.argv.slice(2, process.argv.length);

lox(args);