import React, { Suspense, useState } from "react";
import { createRoot } from "react-dom/client";

import initialSource from "./initialSource";
const Editor = React.lazy(() => import("./Editor"));
const Tree = React.lazy(() => import("./Tree"));

import "./index.css";

// type TreeProps = { value: string };
// const Tree: React.FC<TreeProps> = () => <textarea disabled readOnly value="Hello, world!" />;

type EditorFallbackProps = {
  value: string,
  onChange: (value: string) => void
};

const EditorFallback: React.FC<EditorFallbackProps> = ({ value, onChange }) => {
  const onValueChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return <textarea value={value} onChange={onValueChange} />;
};

const TreeFallback: React.FC = () => (
  <textarea disabled readOnly value="Loading..." />
);

const App: React.FC = () => {
  const [source, setSource] = useState<string>(initialSource);

  return (
    <>
      <nav>
        <h1>Syntax Tree</h1>
        <a href="https://ruby-syntax-tree.github.io/syntax_tree">Docs</a>
        <a href="https://github.com/ruby-syntax-tree/syntax_tree">Source</a>
      </nav>
      <Suspense fallback={<EditorFallback value={source} onChange={setSource} />}>
        <Editor value={source} onChange={setSource} />
      </Suspense>
      <Suspense fallback={<TreeFallback />}>
        <Tree value={source} />
      </Suspense>
    </>
  );
};

createRoot(document.querySelector("#root")).render(<App />);
