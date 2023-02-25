import mermaidjs from "mermaid";

const getCleanContainer = () => {
  const div = document.querySelector("#graph-container");
  div.innerHTML = "";
  return div;
}

const render = async (source) => {
  let container = getCleanContainer();

  container.setAttribute("style", "display: block;");

  mermaidjs.initialize({ startOnLoad: false });
  const { svg } = await mermaidjs.render('preparedScheme', source);
  container.innerHTML = svg;
}

const reset = () => getCleanContainer().setAttribute("style", "display: none;");

export { render, reset };
