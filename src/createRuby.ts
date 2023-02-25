import { WASI } from "@wasmer/wasi";
import { WasmFs } from "@wasmer/wasmfs";
import path from "path-browserify";
import { RubyVM } from "ruby-head-wasm-wasi/dist/index";

import load from "./app.wasm";

// This overwrites the default writeSync function used by the WasmFs to instead
// pipe it out to the console.
function createWriter(originalWriter: Function) {
  return function () {
    let text: string;

    if (arguments.length === 4) {
      text = arguments[1];
    } else {
      text = new TextDecoder("utf-8").decode(arguments[1]);
    }

    switch (arguments[0]) {
      case 1:
        console.log(text);
        break;
      case 2:
        console.warn(text);
        break;
    }

    return originalWriter.call(arguments);
  }
}

export default async function createRuby() {
  // First, create a new file system that we can use internally within the Ruby
  // WASM VM.
  const wasmFs = new WasmFs();
  wasmFs.fs.mkdirSync("/tmp", 0o777);
  wasmFs.fs.writeSync = createWriter(wasmFs.fs.writeSync.bind(wasmFs.fs));

  // Next, create a new WASI instance with the correct options overridden from
  // the defaults.
  const wasi = new WASI({
    bindings: { ...WASI.defaultBindings, fs: wasmFs.fs, path: path },
    preopens: { "/": "/tmp" }
  });

  // Then, create a new Ruby VM instance that we can use to store the memory for
  // our application.
  const ruby = new RubyVM();
  const imports = { wasi_snapshot_preview1: wasi.wasiImport };
  ruby.addToImports(imports);

  // Set the WASI memory to use the memory for our application.
  const instance = await load(imports);
  wasi.setMemory(instance.exports.memory);

  // Load our application into the virtual machine.
  instance.exports._initialize();
  await ruby.setInstance(instance);

  // Initial our virtual machine and return it. It should now be able to
  // evaluate and execute Ruby code.
  ruby.initialize();

  // Once our virtual machine is booted, we're going to require the necessary
  // files to make it work. I'm not sure why I need to explicitly require
  // did_you_mean here, but it doesn't work without it.
  ruby.eval(`
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

      return ruby.eval(rubySource).toString();
    },
    mermaid(source: string) {
      const jsonSource = JSON.stringify(JSON.stringify(source));
      const rubySource = `
        source = JSON.parse(${jsonSource})
        SyntaxTree.parse(source).to_mermaid
      `;

      return ruby.eval(rubySource).toString();
    },
    // A function that calls through to the SyntaxTree.format function to get
    // the pretty-printed version of the source.
    format(source: string) {
      const jsonSource = JSON.stringify(JSON.stringify(source));
      const rubySource = `SyntaxTree.format(JSON.parse(${jsonSource}))`;

      return ruby.eval(rubySource).toString();
    },
    // A function that calls through to PP to get the pretty-printed version of
    // the syntax tree.
    prettyPrint(source: string) {
      const jsonSource = JSON.stringify(JSON.stringify(source));
      const rubySource = `PP.pp(SyntaxTree.parse(JSON.parse(${jsonSource})), +"", 80)`;
    
      return ruby.eval(rubySource).toString();
    }
  };
};

export type Ruby = Awaited<ReturnType<typeof createRuby>>;
