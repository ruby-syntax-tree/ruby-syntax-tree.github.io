import React, { Suspense, useState } from "react";
import { createRoot } from "react-dom/client";

import Editor from "./Editor";
const Tree = React.lazy(() => import("./Tree"));

const App: React.FC = () => {
  const [source, setSource] = useState<string>("1 + 2");
  const cols = 80;

  return (
    <>
      <Editor cols={cols} value={source} onChange={setSource} />
      <Suspense fallback={<textarea cols={cols} readOnly />}>
        <Tree cols={cols} value={source} />
      </Suspense>
    </>
  );
};

createRoot(document.querySelector("#root")).render(<App />);
