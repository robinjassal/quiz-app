import { useEffect, useReducer } from "react";
import "./App.css";
import Header from "./Header";
import Question from "./Question";
import Loader from "./Loader";
import Error from "./Error";
import StartScreen from "./StartScreen";
import Questions from "./Questions";
import NextButton from "./NextButton";
import ProgressBar from "./ProgressBar";
import FinishedScreen from "./FinishedScreen";
import Timer from "./Timer";

const SECS_PER_QUESTION = 30;
const initialState = {
  Questions: [],
  //'loading','error','ready','action','finished'
  status: "loading",
  index: 0,
  answer: null,
  points: 0,
  highscore: 0,
  secondsRemaining: null,
};
function reducer(state, action) {
  switch (action.type) {
    case "dataReceived":
      return {
        ...state,
        Questions: action.payload,
        status: "ready",
      };

    case "dataFailed":
      return {
        ...state,
        status: "error",
      };

    case "start":
      return {
        ...state,
        status: "active",
        secondsRemaining: state.Questions.length * SECS_PER_QUESTION,
      };
    case "newAnswer":
      const question = state.Questions.at(state.index);
      return {
        ...state,
        answer: action.payload,
        points:
          action.payload === question.correctOption
            ? state.points + question.points
            : state.points,
      };
    case "nextQuestion":
      return { ...state, index: state.index + 1, answer: null };

    case "finished":
      return {
        ...state,
        status: "finished",
        highscore:
          state.points > state.highscore ? state.points : state.highscore,
      };
    case "restart":
      return { ...initialState, Questions: state.Questions, status: "ready" };

    case "tick":
      return {
        ...state,
        secondsRemaining: state.secondsRemaining - 1,
        status: state.secondsRemaining === 0 ? "finished" : state.status,
      };
    default:
      throw new Error("Action unknown");
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const numQuestions = state.Questions.length;

  const maxPoints = state.Questions.reduce((prev, cur) => prev + cur.points, 0);
  useEffect(function () {
    fetch("https://raw.githubusercontent.com/rayguddu/api/main/questions.json")
      .then((res) => res.json())
      .then((data) => dispatch({ type: "dataReceived", payload: data }))
      .catch((err) => dispatch({ type: "dataFailed" }));
  }, []);
  return (
    <>
      <div className="app">
        <Header />
        <Question>
          {state.status === "loading" && <Loader />}
          {state.status === "error" && <Error />}

          {state.status === "ready" && (
            <StartScreen numQuestions={numQuestions} dispatch={dispatch} />
          )}
          {state.status === "active" && (
            <>
              <ProgressBar
                index={state.index}
                numQuestions={numQuestions}
                points={state.points}
                maxPoints={maxPoints}
                answer={state.answer}
              />
              <Questions
                question={state.Questions[state.index]}
                dispatch={dispatch}
                answer={state.answer}
              />
              <footer>
                <Timer
                  dispatch={dispatch}
                  secondsRemaining={state.secondsRemaining}
                />
                <NextButton
                  dispatch={dispatch}
                  answer={state.answer}
                  index={state.index}
                  numQuestions={numQuestions}
                />
              </footer>
            </>
          )}
          {state.status === "finished" && (
            <FinishedScreen
              points={state.points}
              maxPoints={maxPoints}
              highscore={state.highscore}
              dispatch={dispatch}
            />
          )}
        </Question>
      </div>
    </>
  );
}

export default App;
