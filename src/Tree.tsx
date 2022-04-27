import React, { useEffect, useState } from "react";

import createRuby, { Ruby } from "./createRuby";

// Track a state that represents where the ruby constant is at any given time.
let rubyState: "initial" | "creating" | "ready" = "initial";

function prettyPrint(ruby: Ruby, value: string) {
  try {
    return ruby.prettyPrint(value);
  } catch (error) {
    // For now, just ignoring the error. Eventually I'd like to make this mark
    // an error state on the editor to give feedback to the user.
  }
}

type TreeProps = {
  rubyRef: React.MutableRefObject<Ruby>,
  value: string
};

const Tree: React.FC<TreeProps> = ({ rubyRef, value }) => {
  const [output, setOutput] = useState<string>(() => prettyPrint(rubyRef.current, value));

  useEffect(() => {
    switch (rubyState) {
      case "initial":
        rubyState = "creating";

        createRuby().then((newRuby) => {
          rubyRef.current = newRuby;
          rubyState = "ready";
          setOutput(prettyPrint(rubyRef.current, value));
        });

        break;
      case "creating":
        break;
      case "ready":
        setOutput(prettyPrint(rubyRef.current, value));
        break;
    }
  }, [value]);

  return (
    <textarea
      cols={80}
      disabled={rubyState != "ready"}
      value={output}
      readOnly
    />
  );
};

export default Tree;
