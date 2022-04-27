import React, { Suspense, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import type { Editor } from "codemirror";

import type { Ruby } from "./createRuby";
import initialSource from "./initialSource";

const Editor = React.lazy(() => import("./Editor"));
const Tree = React.lazy(() => import("./Tree"));

import "./index.css";

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

  const editorRef = useRef<Editor>(null);
  const rubyRef = useRef<Ruby>({
    format(source) {
      return source;
    },
    prettyPrint(source) {
      return "Loading...";
    }
  });

  const onFormat = () => {
    if (editorRef.current) {
      editorRef.current.getDoc().setValue(rubyRef.current.format(source));
    }
  };

  return (
    <>
      <nav>
        <h1>Syntax Tree</h1>
        <a href="https://ruby-syntax-tree.github.io/syntax_tree">Docs</a>
        <a href="https://github.com/ruby-syntax-tree/syntax_tree">Source</a>
        <span><button type="button" onClick={onFormat}>Format</button></span>
      </nav>
      <Suspense fallback={<EditorFallback value={source} onChange={setSource} />}>
        <Editor editorRef={editorRef} initialValue={source} onChange={setSource} />
      </Suspense>
      <Suspense fallback={<TreeFallback />}>
        <Tree rubyRef={rubyRef} value={source} />
      </Suspense>
    </>
  );
};

createRoot(document.querySelector("#root")).render(<App />);
