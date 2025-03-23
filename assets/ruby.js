import { RubyVM } from "https://cdn.jsdelivr.net/npm/@ruby/wasm-wasi@2.6.1/dist/vm/+esm";
import {
  WASI,
  OpenFile,
  ConsoleStdout,
  File,
} from "https://cdn.jsdelivr.net/npm/@bjorn3/browser_wasi_shim@0.4.1/+esm";

class RubyEvaluator {
  constructor() {
    console.log("Ruby VM initialized");
    this.rubyVM = null;
    this.outputArray = [];
    this.initVM();
  }

  async initVM() {
    const setOutput = (output) => {
      this.outputArray.push(output);
      console.log("[Ruby] " + output);
    };

    const args = [];
    const envs = [];
    const fileDescriptors = [
      new OpenFile(new File([])), //stdin
      ConsoleStdout.lineBuffered(setOutput), //stdout
      ConsoleStdout.lineBuffered(setOutput), //stderr
    ];

    const wasi = new WASI(args, envs, fileDescriptors, { debug: false });
    const vm = new RubyVM();
    const imports = { wasi_snapshot_preview1: wasi.wasiImport };
    vm.addToImports(imports);

    const module = await WebAssembly.compileStreaming(this.downloadRuby());
    const instance = await WebAssembly.instantiate(module, imports);
    await vm.setInstance(instance);

    wasi.initialize(instance);
    vm.initialize();

    this.rubyVM = vm;
  }
  async downloadRuby() {
    const response = await fetch(
      "https://cdn.jsdelivr.net/npm/@ruby/3.2-wasm-wasi@2.6.1/dist/ruby+stdlib.wasm",
    );
    return response;
  }

  eval(code) {
    this.outputArray = [];
    let lastExpression = "";
    try {
      lastExpression = this.rubyVM.eval(code);
    } catch (error) {
      console.error(error);
      this.outputArray.push(error);
    }
    return [this.outputArray.join("\n"), lastExpression];
  }

  rawEval(code) {
    return this.rubyVM.eval(code);
  }
}

export const Ruby = new RubyEvaluator();
