import React, { useEffect, useRef } from "react";
import CodeMirror, { Editor } from "codemirror";

import "codemirror/mode/ruby/ruby";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/xq-light.css";

type EditorProps = {
  editorRef: React.MutableRefObject<Editor>,
  initialValue: string,
  onChange: (value: string) => void
};

const Editor: React.FC<EditorProps> = ({ editorRef, initialValue, onChange }) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current && !editorRef.current) {
      const editor = CodeMirror(elementRef.current, {
        lineNumbers: true,
        mode: "ruby",
        value: initialValue,
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
