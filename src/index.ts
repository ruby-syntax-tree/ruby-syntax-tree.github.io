import "./index.css";

Promise.all([
  // We're going to load the editor asynchronously so that we can get to
  // first-paint faster. This works out nicely since we can use a textarea until
  // this chunk is loaded.
  import("./CodeMirror").then(({ default: CodeMirror }) => {
    const editor = document.getElementById("editor") as HTMLTextAreaElement;
    const newEditor = document.createElement("div");
    editor.replaceWith(newEditor);
  
    return CodeMirror(newEditor, {
      lineNumbers: true,
      mode: "ruby",
      theme: "xq-light",
      value: editor.value
    });
  }),
  // We're going to load the Ruby VM chunk asynchronously because it is pretty
  // dang huge (> 40Mb). In the meantime the textarea that is holding the place
  // of the actual functional one is just going to display "Loading...".
  import("./createRuby").then(({ default: createRuby }) => createRuby())
]).then(([editor, ruby]) => {
  // First, grab a reference to the tree element so that we can update it. Then,
  // set it initially to the tree represented by the source already there.
  const tree = document.getElementById("tree") as HTMLTextAreaElement;
  tree.value = ruby.prettyPrint(editor.getDoc().getValue());
  tree.disabled = false;

  // We're going to handle updates to the source through a custom event. This
  // turns out to be faster than handling the change event directly on the
  // editor since it blocks updates to the UI until the event handled returns.
  tree.addEventListener("source-changed", (event: CustomEvent<{ source: string }>) => {
    try {
      tree.value = ruby.prettyPrint(event.detail.source);
    } catch (error) {
      // For now, just ignoring the error. Eventually I'd like to make this mark
      // an error state on the editor to give feedback to the user.
    }
  });

  // Attach to the editor and dispatch custom source-changed events whenever the
  // value is updated in the editor.
  editor.on("change", () => {
    tree.dispatchEvent(new CustomEvent<{ source: string }>("source-changed", {
      detail: { source: editor.getDoc().getValue() }
    }));
  });

  // Attach to the format button to update the source whenever the button is
  // clicked.
  document.getElementById("format").addEventListener("click", () => {
    editor.getDoc().setValue(ruby.format(editor.getValue()));
  });
});
