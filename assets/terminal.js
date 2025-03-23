import { Ruby } from "./ruby.js";

import "https://cdn.jsdelivr.net/npm/xterm/lib/xterm.js";

class RubyTerminal {
  constructor(containerId) {
    this.containerId = containerId;
    this.term = null;
    this.init();
  }

  async init() {
    const xTermCSS = document.createElement("link");
    xTermCSS.rel = "stylesheet";
    xTermCSS.href = "https://cdn.jsdelivr.net/npm/xterm/css/xterm.css";
    document.head.appendChild(xTermCSS);

    this.createTerminal();
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
    this.term.write('Ruby "almost terminal".\r\n> ');
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
      const result = Ruby.rawEval(code);
      this.term.write(result + "\r\n");
    } catch (err) {
      this.term.write("Error: " + err.message + "\r\n");
    }
  }
}

new RubyTerminal("wasi-container");
