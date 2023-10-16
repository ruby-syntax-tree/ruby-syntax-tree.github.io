import "./index.css";

Promise.all([
  // We're going to load the editor asynchronously so that we can get to
  // first-paint faster. This works out nicely since we can use a textarea until
  // this chunk is loaded.
  import("./monacoLoader").then(async ({ default: loader }) => {
    const monaco = await loader.init();
    const editor = document.getElementById("editor");
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
  // We're going to load mermaid asynchronously because it is a large module.
  // When it gets loaded we'll tell it not to run on load and then we'll use it
  // when the user selects the graph.
  import("./mermaid").then(({ default: mermaid }) => {
    mermaid.initialize({ startOnLoad: false });
    return mermaid;
  }),
  // We're going to load the Ruby VM chunk asynchronously because it is pretty
  // dang huge (> 40Mb). In the meantime the textarea that is holding the place
  // of the actual functional one is just going to display "Loading...".
  import("./createRuby").then(({ default: createRuby }) => createRuby())
]).then(([editor, mermaid, ruby]) => {
  // First, grab a reference to the output element so that we can update it.
  // Then, set it initially to the output represented by the source.
  const output = document.getElementById("output");
  output.value = ruby.prettyPrint(editor.getValue());
  output.disabled = false;

  // Next, grab a reference to the graph container element.
  const graph = document.getElementById("graph");

  // This is the function that will be used to display the output from the
  // source.
  let displayFunction = ruby.prettyPrint;

  // Handle a custom event here for if the display option changed.
  output.addEventListener("display-changed", (event) => {
    displayFunction = ruby[event.detail.kind];

    try {
      let source = displayFunction(editor.getValue());

      if (event.detail.kind === "mermaid" || event.detail.kind === "seaOfNodes") {
        output.setAttribute("style", "display: none;");
        graph.setAttribute("style", "text-align: left;")
        graph.innerHTML = "Loading..."

        mermaid.render("preparedScheme", source).then(({ svg }) => {
          graph.innerHTML = svg;
          graph.setAttribute("style", "display: block; text-align: center;");
        });
      } else {
        output.value = source;
        output.setAttribute("style", "");
        graph.setAttribute("style", "display: none;");
      }
    } catch (error) {
      // For now, just ignoring the error. Eventually I'd like to make this mark
      // an error state on the editor to give feedback to the user.
    }
  });

  // Hook into both the output toggles to make sure they send out the correct
  // event information.
  const toggles = document.getElementsByClassName("toggles")[0];

  toggles.querySelector("select").addEventListener('change', (event) => {
    output.dispatchEvent(new CustomEvent("display-changed", {
      detail: { kind: event.target.value }
    }));
  });

  // We're going to handle updates to the source through a custom event. This
  // turns out to be faster than handling the change event directly on the
  // editor since it blocks updates to the UI until the event handled returns.
  output.addEventListener("source-changed", (event) => {
    // We may want to add some throttle here to avoid to much rerendering in our
    // graph.
    output.dispatchEvent(new CustomEvent("display-changed", {
      detail: { kind: toggles.querySelector("select").value }
    }));
  });

  // Attach to the editor and dispatch custom source-changed events whenever the
  // value is updated in the editor.
  editor.onDidChangeModelContent(() => {
    output.dispatchEvent(new CustomEvent("source-changed", {
      detail: { source: editor.getValue() }
    }));
  });

  // Attach to the format button to update the source whenever the button is
  // clicked.
  const format = document.getElementById("format");
  format.disabled = false;

  format.addEventListener("click", () => {
    editor.setValue(ruby.format(editor.getValue()));
  });

  toggles.querySelector("select").removeAttribute("disabled");

  // fetch code from URL
  const params = new URLSearchParams(document.location.search)
  const sourceURL = params.get('source')
  if (sourceURL) {
    fetch(new URL(sourceURL))
    .then(response => response.text())
    .then(data => editor.setValue(data))
    .catch(error => console.error(error))
  }
});
