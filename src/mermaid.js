import mermaidjs from "mermaid";

const getCleanContainer = () => {
  const div = document.querySelector("#graph-container");
  div.innerHTML = "";
  return div;
}

const render = (fn) => {
  let container = getCleanContainer();

  container.setAttribute("style", "display: block;");

  mermaidjs.initialize({ startOnLoad: false });
  mermaidjs.render('preparedScheme', fn(), (svg) => {
    container.innerHTML = svg;
  }, container);
}

const reset = () => getCleanContainer().setAttribute("style", "display: none;");

export { render, reset };
