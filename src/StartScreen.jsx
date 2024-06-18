import React from "react";

function StartScreen({ numQuestions, dispatch }) {
  return (
    <>
      <h2> Welcome to the React Quiz</h2>
      <h3>{numQuestions} questions to test your React Knowledge</h3>
      <button
        onClick={() => dispatch({ type: "start" })}
        className="btn btn-ui"
      >
        Let's Start
      </button>
    </>
  );
}

export default StartScreen;
