import React, { useEffect, useState } from "react";

import createRuby, { Ruby } from "./createRuby";

// Create a singleton since we don't actually want there to be multiple virtual
// machines running even if there are multiple Tree components.
let ruby: Ruby = {
  prettyPrint(source) {
    return "Loading...";
  }
};

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
  cols: number,
  value: string
};

const Tree: React.FC<TreeProps> = ({ cols, value }) => {
  const [output, setOutput] = useState<string>(() => prettyPrint(ruby, value));

  useEffect(() => {
    switch (rubyState) {
      case "initial":
        rubyState = "creating";

        createRuby().then((newRuby) => {
          ruby = newRuby;
          rubyState = "ready";
          setOutput(prettyPrint(ruby, value));
        });

        break;
      case "creating":
        break;
      case "ready":
        setOutput(prettyPrint(ruby, value));
        break;
    }
  }, [value]);

  return (
    <textarea
      className={rubyState != "ready" ? "loading" : ""}
      cols={cols}
      value={output}
      readOnly
    />
  );
};

export default Tree;
