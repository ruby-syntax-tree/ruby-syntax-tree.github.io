import React, { Suspense, useState } from "react";
import { createRoot } from "react-dom/client";

import initialSource from "./initialSource";
import Editor from "./Editor";
const Tree = React.lazy(() => import("./Tree"));

type TreeFallbackProps = {
  cols: number
};

const TreeFallback: React.FC<TreeFallbackProps> = ({ cols }) => (
  <textarea className="loading" cols={cols} readOnly>Loading...</textarea>
);

const App: React.FC = () => {
  const [source, setSource] = useState<string>(initialSource);
  const cols = 80;

  return (
    <>
      <nav>
        <h1>Syntax Tree</h1>
        <a href="https://ruby-syntax-tree.github.io/syntax_tree">Docs</a>
        <a href="https://github.com/ruby-syntax-tree/syntax_tree">Source</a>
      </nav>
      <main>
        <Editor cols={cols} value={source} onChange={setSource} />
        <Suspense fallback={<TreeFallback cols={cols} />}>
          <Tree cols={cols} value={source} />
        </Suspense>
      </main>
    </>
  );
};

createRoot(document.querySelector("#root")).render(<App />);
