import React from "react";

type EditorProps = {
  cols: number,
  value: string,
  onChange: (value: string) => void
};

const Editor: React.FC<EditorProps> = ({ cols, value, onChange }) => {
  const onSourceChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return <textarea cols={cols} value={value} onChange={onSourceChange} />;
};

export default Editor;
