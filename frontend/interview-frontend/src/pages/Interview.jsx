
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { createInterview, evaluateAnswer } from "../services/api";

function parseQuestions(data) {
  if (Array.isArray(data.questions)) {
    return data.questions
      .map((question) =>
        typeof question === "string" ? question.trim() : String(question)
      )
      .filter(Boolean);
  }

  if (typeof data.questions !== "string") {
    throw new Error("The backend did not return interview questions.");
  }

  const questions = data.questions
    .split(/\n+/)
    .map((line) =>
      line
        .replace(/^\s*(?:[-*]\s*)?(?:Q(?:uestion)?\s*)?\d+[\s.):\-]+\s*/i, "")
        .trim()
    )
    .filter(Boolean);

  if (questions.length === 0) {
    throw new Error("No questions were generated. Please try again.");
  }

  return questions;
}

export default function Interview() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const role = params.get("role") || "Backend Developer";
  const difficulty = params.get("difficulty") || "Medium";
  const questionCount = Math.min(
    15,
    Math.max(1, Number(params.get("questionCount")) || 3)
  );

  const [questions, setQuestions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [feedback, setFeedback] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Generate questions and create a session in MySQL
  useEffect(() => {
    let cancelled = false;

    async function startInterview() {
      try {
        setLoading(true);
        setError("");

        const data = await createInterview(
          role,
          difficulty,
          questionCount
        );

        const generatedQuestions = parseQuestions(data);

        if (data.id == null) {
          throw new Error(
            "The backend did not return an interview session ID."
          );
        }

        if (!cancelled) {
          setQuestions(generatedQuestions);
          setSessionId(data.id);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message ||
              "Could not generate questions. Check the backend and Ollama."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    startInterview();

    return () => {
      cancelled = true;
    };
  }, [role, difficulty, questionCount]);

  // Evaluate and save the current answer
  async function nextQuestion() {
    const currentAnswer = answer.trim();

    if (!currentAnswer || submitting || sessionId == null) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const currentQuestion = questions[index];

      // The session ID connects this answer to the correct interview
      const result = await evaluateAnswer(
        sessionId,
        currentQuestion,
        currentAnswer
      );

      const updatedAnswers = [...answers, currentAnswer];

      const updatedFeedback = [
        ...feedback,
        result.feedback || "No feedback was returned.",
      ];

      setAnswers(updatedAnswers);
      setFeedback(updatedFeedback);

      if (index < questions.length - 1) {
        setIndex((previous) => previous + 1);
        setAnswer("");
      } else {
        // All answers have been evaluated and saved
        navigate("/results", {
          state: {
            role,
            difficulty,
            sessionId,
            answers: updatedAnswers,
            feedback: updatedFeedback,
            questions,
          },
        });
      }
    } catch (err) {
      setError(
        err.message ||
          "Could not evaluate your answer. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Loading screen
  if (loading) {
    return (
      <main className="page interview-page">
        <section className="interview-panel">
          <p className="eyebrow">AI INTERVIEW SIMULATOR</p>
          <h1>Preparing your interview...</h1>
          <p>
            Ollama is generating questions for your {role} interview.
            This may take a little time.
          </p>
        </section>
      </main>
    );
  }

  // Error screen if the interview could not be created
  if (error && questions.length === 0) {
    return (
      <main className="page interview-page">
        <section className="interview-panel">
          <h1>Unable to start interview</h1>
          <p role="alert">{error}</p>

          <button
            className="primary-btn"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>

          <Link className="secondary-btn link-btn" to="/">
            Back to dashboard
          </Link>
        </section>
      </main>
    );
  }

  if (questions.length === 0) {
    return null;
  }

  const isLastQuestion = index === questions.length - 1;
  const progress = ((index + 1) / questions.length) * 100;

  return (
    <main className="page interview-page">
      <section className="interview-panel">
        <div className="interview-header">
          <div>
            <p className="eyebrow">AI MOCK INTERVIEW</p>
            <h1>{role}</h1>
            <p>Difficulty: {difficulty}</p>
          </div>

          <Link className="secondary-btn link-btn" to="/">
            Exit interview
          </Link>
        </div>

        <div className="interview-progress">
          <div className="progress-label">
            <span>
              Question {index + 1} of {questions.length}
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="question-card">
          <p className="eyebrow">YOUR QUESTION</p>
          <h2>{questions[index]}</h2>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            nextQuestion();
          }}
        >
          <label htmlFor="answer">Your answer</label>

          <textarea
            id="answer"
            name="answer"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Explain your answer clearly. Include examples where appropriate..."
            rows={8}
            required
            disabled={submitting}
          />

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}

          <div className="interview-actions">
            <span>
              {answer.trim().length} characters
            </span>

            <button
              className="primary-btn"
              type="submit"
              disabled={!answer.trim() || submitting}
            >
              {submitting
                ? "Evaluating answer..."
                : isLastQuestion
                  ? "Finish interview"
                  : "Submit & Next"}
            </button>
          </div>
        </form>

        <p className="interview-note">
          Your answer is evaluated by AI and saved to your interview session.
        </p>
      </section>
    </main>
  );
}
