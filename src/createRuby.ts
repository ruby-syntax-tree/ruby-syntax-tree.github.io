import { WASI } from "@wasmer/wasi";
import { WasmFs } from "@wasmer/wasmfs";
import path from "path-browserify";
import { DefaultRubyVM } from "ruby-head-wasm-wasi/dist/browser.esm.js";

import load from "./app.wasm";

export default async function createRuby() {
  const { vm } = await DefaultRubyVM(await load())

  // Once our virtual machine is booted, we're going to require the necessary
  // files to make it work. I'm not sure why I need to explicitly require
  // did_you_mean here, but it doesn't work without it.
  vm.eval(`
    require "rubygems"
    require "did_you_mean"
    require "json"
    require "pp"
    $:.unshift("/lib")
    require_relative "/lib/syntax_tree"
    require_relative "/lib/prettier_print"
  `);

  return {
    // A function that disassembles the YARV instructions for the given source.
    disasm(source: string) {
      const jsonSource = JSON.stringify(JSON.stringify(source));
      const rubySource = `RubyVM::InstructionSequence.compile(JSON.parse(${jsonSource})).disasm`;

      return vm.eval(rubySource).toString();
    },
    mermaid(source: string) {
      const jsonSource = JSON.stringify(JSON.stringify(source));
      const rubySource = `
        source = JSON.parse(${jsonSource})
        SyntaxTree.parse(source).to_mermaid
      `;

      return vm.eval(rubySource).toString();
    },
    // A function that calls through to the SyntaxTree.format function to get
    // the pretty-printed version of the source.
    format(source: string) {
      const jsonSource = JSON.stringify(JSON.stringify(source));
      const rubySource = `SyntaxTree.format(JSON.parse(${jsonSource}))`;

      return vm.eval(rubySource).toString();
    },
    // A function that calls through to PP to get the pretty-printed version of
    // the syntax tree.
    prettyPrint(source: string) {
      const jsonSource = JSON.stringify(JSON.stringify(source));
      const rubySource = `PP.pp(SyntaxTree.parse(JSON.parse(${jsonSource})), +"", 80)`;
    
      return vm.eval(rubySource).toString();
    }
  };
};

export type Ruby = Awaited<ReturnType<typeof createRuby>>;
