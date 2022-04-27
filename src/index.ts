import "./index.css";

import type { Editor } from "codemirror";
import type { Ruby } from "./createRuby";
import initialSource from "./initialSource";

let editorElement = document.getElementById("editor") as HTMLTextAreaElement;
const formatElement = document.getElementById("format");
const treeElement = document.getElementById("tree") as HTMLTextAreaElement;

// First, set the initial value of the editor element. It's just going to be a
// textarea until we've loaded the editor chunk.
editorElement.value = initialSource;

let editor: Editor = null;
let ruby: Ruby = null;

type SourceChangedEvent = {
  source: string
};;

// This function is called to set up the event handlers once both the editor and
// the ruby chunk have been loaded.
function synchronize() {
  // We're going to handle updates to the source through a custom event. This
  // turns out to be faster than handling the change event directly on the
  // editor since it blocks updates to the UI until the event handled returns.
  document.body.addEventListener("source-changed", (event: CustomEvent<SourceChangedEvent>) => {
    try {
      treeElement.value = ruby.prettyPrint(event.detail.source);
    } catch (error) {
      // For now, just ignoring the error. Eventually I'd like to make this mark
      // an error state on the editor to give feedback to the user.
    }
  });

  // Attach to the editor and dispatch custom source-changed events whenever the
  // value is updated in the editor.
  editor.on("change", () => {
    document.body.dispatchEvent(new CustomEvent<SourceChangedEvent>("source-changed", {
      detail: { source: editor.getDoc().getValue() }
    }));
  });

  // Attach to the format button to update the source whenever the button is
  // clicked.
  formatElement.addEventListener("click", () => {
    editor.getDoc().setValue(ruby.format(editor.getValue()));
  });

  // Finally, un-disable the tree element.
  treeElement.disabled = false;
}

import("./CodeMirror").then(({ default: CodeMirror }) => {
  const newEditorElement = document.createElement("div");
  editorElement.replaceWith(newEditorElement);

  editor = CodeMirror(newEditorElement, {
    lineNumbers: true,
    mode: "ruby",
    theme: "xq-light",
    value: editorElement.value
  });

  if (ruby) {
    synchronize();
  }
});

import("./createRuby").then(({ default: createRuby }) => createRuby()).then((created) => {
  ruby = created;

  if (editor) {
    synchronize();
  }
});
