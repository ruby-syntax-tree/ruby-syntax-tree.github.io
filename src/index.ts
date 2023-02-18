import "./index.css";

type SourceChangedEvent = { source: string };
type DisplayChangedEvent = { kind: "prettyPrint" | "disasm" | "mermaid" };

Promise.all([
  // We're going to load the editor asynchronously so that we can get to
  // first-paint faster. This works out nicely since we can use a textarea until
  // this chunk is loaded.
  import("./monacoLoader").then(async ({ default: loader }) => {
    const monaco = await loader.init();
    const editor = document.getElementById("editor") as HTMLTextAreaElement;
    const newEditor = document.createElement("div");
    editor.replaceWith(newEditor);

    return monaco.editor.create(newEditor, {
      value: editor.value,
      language: "ruby",
      minimap: {
        enabled: false
      }
    });
  }),
  import("./mermaid-js"),
  // We're going to load the Ruby VM chunk asynchronously because it is pretty
  // dang huge (> 40Mb). In the meantime the textarea that is holding the place
  // of the actual functional one is just going to display "Loading...".
  import("./createRuby").then(({ default: createRuby }) => createRuby())
]).then(([editor, mermaidjs, ruby]) => {
  // First, grab a reference to the output element so that we can update it.
  // Then, set it initially to the output represented by the source.
  const output = document.getElementById("output") as HTMLTextAreaElement;
  output.value = ruby.prettyPrint(editor.getValue());
  output.disabled = false;

  // This is the function that will be used to display the output from the
  // source.
  let displayFunction = ruby.prettyPrint;

  // Handle a custom event here for if the display option changed.
  output.addEventListener("display-changed", (event: CustomEvent<DisplayChangedEvent>) => {
    displayFunction = ruby[event.detail.kind];

    try {
      let source = displayFunction(editor.getValue());

      if (event.detail.kind === 'mermaid') {
        mermaidjs.render(() => {
          output.setAttribute("style", "display: none;");

          return source;
        });
      } else {
        output.value = source;
        output.setAttribute("style", "");

        mermaidjs.reset();
      }
    } catch (error) {
      // For now, just ignoring the error. Eventually I'd like to make this mark
      // an error state on the editor to give feedback to the user.
    }
  });

  // Hook into both the output toggles to make sure they send out the correct
  // event information.
  const toggles = document.getElementsByClassName("toggles")[0];

  toggles.querySelector("select").addEventListener('change', (e) => {
    output.dispatchEvent(new CustomEvent<DisplayChangedEvent>("display-changed", {
      detail: { kind: e.target.value as DisplayChangedEvent["kind"] }
    }));
  });

  // We're going to handle updates to the source through a custom event. This
  // turns out to be faster than handling the change event directly on the
  // editor since it blocks updates to the UI until the event handled returns.
  output.addEventListener("source-changed", (event: CustomEvent<SourceChangedEvent>) => {
    // We may want to add some throttle here to avoid to much rerendering in our Graph
    output.dispatchEvent(new CustomEvent<DisplayChangedEvent>("display-changed", {
      detail: { kind: toggles.querySelector('select').value as DisplayChangedEvent["kind"] }
    }));
  });

  // Attach to the editor and dispatch custom source-changed events whenever the
  // value is updated in the editor.
  editor.onDidChangeModelContent(() => {
    output.dispatchEvent(new CustomEvent<SourceChangedEvent>("source-changed", {
      detail: { source: editor.getValue() }
    }));
  });

  // Attach to the format button to update the source whenever the button is
  // clicked.
  const format = document.getElementById("format") as HTMLButtonElement;
  format.disabled = false;

  format.addEventListener("click", () => {
    editor.setValue(ruby.format(editor.getValue()));
  });
});
