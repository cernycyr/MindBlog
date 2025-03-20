import { DefaultRubyVM } from "https://cdn.jsdelivr.net/npm/@ruby/wasm-wasi@2.7.1/dist/browser/+esm";

class RubyTerminal {
  constructor(containerId) {
    this.containerId = containerId;
    this.term = null;
    this.ruby = null;
    this.init();
  }

  async init() {
    await this.loadRubyWasm();
    this.createTerminal();
  }

  async loadRubyWasm() {
    console.log("Loading Ruby WASM...");
    const response = await fetch(
      "https://cdn.jsdelivr.net/npm/@ruby/3.4-wasm-wasi@2.7.1/dist/ruby+stdlib.wasm",
    );
    const module = await WebAssembly.compileStreaming(response);
    const { vm } = await DefaultRubyVM(module);
    this.ruby = vm;
    console.log("Ruby WASM Loaded.");
  }

  createTerminal() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error("Terminal container not found");
      return;
    }

    this.term = new window.Terminal({
      cursorBlink: true,
      rows: 20,
      cols: 80,
    });

    this.term.open(container);
    this.term.write("Hello there.\r\n> ");
    this.handleInput();
  }

  handleInput() {
    let command = "";
    this.term.onData((data) => {
      if (data === "\r") {
        this.term.write("\r\n");
        this.runRuby(command);
        command = "";
        this.term.write("> ");
      } else if (data === "\u007F") {
        // Backspace
        if (command.length > 0) {
          command = command.slice(0, -1);
          this.term.write("\b \b");
        }
      } else {
        command += data;
        this.term.write(data);
      }
    });
  }

  runRuby(code) {
    try {
      const result = this.ruby.eval(code);
      this.term.write(result + "\r\n");
    } catch (err) {
      this.term.write("Error: " + err.message + "\r\n");
    }
  }
}

const wasiButton = document.getElementById("enable-wasi");
wasiButton.addEventListener("click", () => {
  new RubyTerminal("wasi-container");
  wasiButton.remove();
});
