import "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.3/codemirror.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.3/mode/ruby/ruby.min.js";
import { RubyVM } from "https://cdn.jsdelivr.net/npm/@ruby/wasm-wasi@2.6.1/dist/vm/+esm";
import {
  WASI,
  OpenFile,
  ConsoleStdout,
  File,
} from "https://cdn.jsdelivr.net/npm/@bjorn3/browser_wasi_shim@0.4.1/+esm";

document.addEventListener("DOMContentLoaded", function () {
  // Insert editor container
  const editorContainer = document.createElement("div");
  editorContainer.className = "ruby-playground";
  editorContainer.innerHTML = `
    <div class="editor-header">
      <h3>Ruby Playground</h3>
      <button id="run-ruby">Run Code</button>
    </div>
    <div id="ruby-editor"></div>
    <div class="output-container">
      <div class="output-header">Output:</div>
      <pre id="ruby-output"></pre>
    </div>
  `;

  const insertPoint = document.getElementById("editor-container");
  insertPoint.appendChild(editorContainer);

  // Load CodeMirror CSS
  const cmCSS = document.createElement("link");
  cmCSS.rel = "stylesheet";
  cmCSS.href =
    "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.3/codemirror.min.css";
  document.head.appendChild(cmCSS);

  // Load CodeMirror theme
  const cmThemeCSS = document.createElement("link");
  cmThemeCSS.rel = "stylesheet";
  cmThemeCSS.href =
    "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.3/theme/dracula.min.css";
  document.head.appendChild(cmThemeCSS);

  initVM();
  initializeEditor();
});

let rubyVM = null;
let outputArray = [];

async function initializeEditor() {
  const editor = CodeMirror(document.getElementById("ruby-editor"), {
    mode: "ruby",
    theme: "dracula",
    lineNumbers: true,
    indentUnit: 2,
    value: '# Type your Ruby code here\nputs "Hello, Ruby!"',
  });

  const runButton = document.getElementById("run-ruby");

  runButton.addEventListener("click", () => {
    if (!rubyVM) return;

    outputArray = [];
    const code = editor.getValue();

    let lastExpression = null;
    try {
      lastExpression = rubyVM.eval(code);
    } catch (error) {
      console.warn(error);
      renderOutput(error);
      return;
    }

    console.log(lastExpression);
    // if (lastExpression.call("nil?").toString() == "false") {
    outputArray.push("=> " + lastExpression);
    // }
    renderOutput();
  });
}

function renderOutput() {
  document.getElementById("ruby-output").textContent = outputArray.join("\n");
}

async function initVM() {
  const setOutput = (output) => {
    outputArray.push(output);
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

  const module = await WebAssembly.compileStreaming(downloadRuby());
  const instance = await WebAssembly.instantiate(module, imports);
  await vm.setInstance(instance);

  wasi.initialize(instance);
  vm.initialize();

  rubyVM = vm;
}
async function downloadRuby() {
  const response = await fetch(
    "https://cdn.jsdelivr.net/npm/@ruby/3.2-wasm-wasi@2.6.1/dist/ruby+stdlib.wasm",
  );
  return response;
}
