import React, { useEffect, useReducer } from "react";
import { createRoot } from "react-dom/client";

import createRuby, { Ruby } from "./createRuby";

type State = {
  state: "initializing" | "ready" | "evaluating",
  source: string,
  output: string,
  ruby: null | Ruby
};

const initialState: State = {
  state: "initializing",
  source: "1 + 2",
  output: "",
  ruby: null
};

type Action = (
  | { type: "changeSource", source: string }
  | { type: "createRuby", ruby: Ruby }
  | { type: "evaluateSource", output: string }
  | { type: "syntaxErrorSource" }
);

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "changeSource":
      return { ...state, state: "evaluating", source: action.source };
    case "createRuby":
      return { ...state, state: "ready", ruby: action.ruby };
    case "evaluateSource":
      return { ...state, state: "ready", output: action.output };
    case "syntaxErrorSource":
      return { ...state, state: "ready" };
  }
}

const App: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const onSourceChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch({ type: "changeSource", source: event.target.value });
  };

  useEffect(() => {
    switch (state.state) {
      case "initializing":
        createRuby().then((ruby) => {
          dispatch({ type: "createRuby", ruby });
        });
        return;
      case "evaluating":
        try {
          dispatch({ type: "evaluateSource", output: state.ruby.prettyPrint(state.source) });
        } catch (error) {
          dispatch({ type: "syntaxErrorSource" });
        }
        return;
    }
  }, [state.state]);

  return (
    <>
      <textarea
        cols={80}
        value={state.source}
        onChange={onSourceChange}
        readOnly={state.state !== "ready"}
      />
      <textarea
        cols={80}
        value={state.output}
        readOnly
      />
    </>
  );
};

createRoot(document.querySelector("#root")).render(<App />);
