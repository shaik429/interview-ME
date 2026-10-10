
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { getInterview, getInterviewAnswers } from "../services/api";

export default function Results() {
  const { state } = useLocation();
  const { id } = useParams();

  const sessionId = state?.sessionId ?? id;

  const [interview, setInterview] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadResults() {
      if (sessionId == null) {
        setError(
          "No interview session was specified. Start an interview from the dashboard."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [interviewData, answerData] = await Promise.all([
          getInterview(sessionId),
          getInterviewAnswers(sessionId),
        ]);

        if (!cancelled) {
          setInterview(interviewData);
          setRecords(answerData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Could not load saved interview results."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadResults();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (loading) {
    return (
      <main className="page results-page">
        <section className="results-panel">
          <h1>Loading your results...</h1>
          <p>Retrieving your saved interview from MySQL.</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page results-page">
        <section className="results-panel">
          <h1>Unable to load results</h1>
          <p role="alert">{error}</p>
          <Link className="primary-btn link-btn" to="/">
            Back to dashboard
          </Link>
        </section>
      </main>
    );
  }

  const role = interview?.role || state?.role || "Developer";
  const difficulty =
    interview?.difficulty || state?.difficulty || "Medium";

  const detailedAnswers = records.filter(
    (record) => record.answer.trim().length >= 50
  ).length;

  // Extract scores when the AI uses the expected "Score: X/10" format.
  const scores = records
    .map((record) => {
      const match = record.feedback.match(
        /\bscore\s*(?:is|:)?\s*(\d+(?:\.\d+)?)\s*(?:\/\s*10|out of 10)\b/i
      );

      return match ? Number(match[1]) : null;
    })
    .filter(
      (score) =>
        score !== null && Number.isFinite(score) && score >= 0 && score <= 10
    );

  const averageScore =
    scores.length > 0
      ? (scores.reduce((total, score) => total + score, 0) / scores.length)
          .toFixed(1)
      : null;

  return (
    <main className="page results-page">
      <section className="results-panel">
        <span className="result-check">✓</span>
        <span className="eyebrow">INTERVIEW RESULTS</span>

        <h1>Great work!</h1>
        <p>
          Your saved results for the {role} mock interview.
        </p>
        <p>Difficulty: {difficulty}</p>

        <div className="result-stats">
          <div>
            <strong>{records.length}</strong>
            <span>Answers evaluated</span>
          </div>

          <div>
            <strong>{detailedAnswers}</strong>
            <span>Detailed answers</span>
          </div>

          <div>
            <strong>{averageScore ?? "—"}</strong>
            <span>Average score / 10</span>
          </div>
        </div>

        <h2>Your AI feedback</h2>

        {records.length === 0 ? (
          <p>
            No answers have been saved for this interview yet.
          </p>
        ) : (
          records.map((record, index) => (
            <article className="answer-card" key={record.id}>
              <h3>
                {index + 1}. {record.question}
              </h3>

              <p>
                <strong>Your answer:</strong>
              </p>
              <p>{record.answer}</p>

              <p>
                <strong>AI evaluation:</strong>
              </p>
              <p className="feedback-text">{record.feedback}</p>
            </article>
          ))
        )}

        <p className="disclaimer">
          AI feedback is intended for practice and may not reflect an actual
          interviewer's assessment. Average score is calculated only from
          feedback containing a recognizable score out of 10.
        </p>

        <Link className="primary-btn link-btn" to="/">
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}
