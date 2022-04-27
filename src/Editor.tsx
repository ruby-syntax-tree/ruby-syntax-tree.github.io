import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror";

import "codemirror/mode/ruby/ruby";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/xq-light.css";

type EditorProps = {
  value: string,
  onChange: (value: string) => void
};

const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<CodeMirror.Editor>(null);

  useEffect(() => {
    if (elementRef.current && !editorRef.current) {
      const editor = CodeMirror(elementRef.current, {
        lineNumbers: true,
        mode: "ruby",
        value,
        theme: "xq-light"
      });

      editor.on("change", () => {
        onChange(editor.getDoc().getValue());
      });

      editorRef.current = editor;
    }
  });

  return <div ref={elementRef} />;
};

export default Editor;
