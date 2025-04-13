import "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.3/codemirror.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.3/mode/ruby/ruby.min.js";
import { Ruby } from "./ruby.js";

export class RubyEditor {
  constructor(containerSelector) {
    this.mainContainer = document.getElementById(containerSelector);
    this.mainContainer.appendChild(this.createEditor());

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

    Ruby.initVM()
      .then(async () => {})
      .then(async () => {
        await import(
          "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.3/mode/ruby/ruby.min.js"
        );
      })
      .then(() => {
        this.initializeCodeMirror();
      });
  }

  createEditor() {
    const editorContainer = document.createElement("div");
    // TODO: Either remove one leayer of div, or move it into the jekyll include template
    editorContainer.className = "ruby-playground";
    editorContainer.innerHTML = `
      <div class="editor-body">
        <div id="ruby-editor"></div>
        <div class="output-container">
          <div class="editor-header">
            <div class="output-header">Output:</div>
            <button id="run-ruby">Run Code</button>
          </div>
          <pre id="ruby-output"></pre>
        </div>
      </div>
    `;
    return editorContainer;
  }

  initializeCodeMirror() {
    const editor = CodeMirror(
      this.mainContainer.querySelector("#ruby-editor"),
      {
        mode: "ruby",
        theme: "dracula",
        lineNumbers: true,
        indentUnit: 2,
        value: '# Type your Ruby code here\nputs "Hello, Ruby!"',
      },
    );

    const runButton = this.mainContainer.querySelector("#run-ruby");

    runButton.addEventListener("click", () => {
      const code = editor.getValue();
      this.renderOutput(Ruby.eval(code));
    });
  }

  renderOutput(output) {
    const [stdOutput, lastExpression] = output;
    this.mainContainer.querySelector("#ruby-output").textContent =
      stdOutput + "\n=> " + lastExpression;
  }
}
