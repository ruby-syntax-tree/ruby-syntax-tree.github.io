import React, { useEffect, useMemo, useState } from "react";

import createRuby, { Ruby } from "./createRuby";

function prettyPrint(ruby: Ruby, value: string) {
  try {
    return ruby.prettyPrint(value);
  } catch (error) {
    // For now, just ignoring the error. Eventually I'd like to make this mark
    // an error state on the editor to give feedback to the user.
  }
}

type TreeProps = {
  cols: number,
  value: string
};

const Tree: React.FC<TreeProps> = ({ cols, value }) => {
  const [ruby, setRuby] = useState<Ruby>(null);
  const [output, setOutput] = useState<string>("");

  useEffect(() => {
    createRuby().then((ruby) => {
      setRuby(ruby);
      setOutput(prettyPrint(ruby, value));
    });
  }, []);

  useMemo(() => {
    if (ruby) {
      setOutput(prettyPrint(ruby, value));
    }
  }, [ruby, value]);

  return <textarea cols={cols} value={output} readOnly />;
};

export default Tree;
