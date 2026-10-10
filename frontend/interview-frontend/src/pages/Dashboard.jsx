
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkBackend, getInterviews } from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkBackend()
      .then((data) => setBackendStatus(data.message || "Connected"))
      .catch(() => setBackendStatus("Backend connection failed"));

    getInterviews()
      .then((data) => {
        setInterviews(Array.isArray(data) ? data : []);
        setError("");
      })
      .catch(() => {
        setError("Could not load interview history.");
      })
      .finally(() => setLoading(false));
  }, []);

  function startInterview(role) {
    navigate(`/interview?role=${encodeURIComponent(role)}`);
  }

  function formatDate(date) {
    if (!date) return "Date unavailable";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "Date unavailable";
    }

    return parsed.toLocaleString();
  }

  return (
    <main className="page">
      <section className="welcome">
        <span className="eyebrow">
          YOUR PERSONAL INTERVIEW COACH
        </span>

        <h1>Ready to ace your next interview?</h1>

        <p>
          Practice technical questions, improve your answers,
          and prepare for your dream role.
        </p>

        <button
          className="primary-btn"
          onClick={() => startInterview("Backend Developer")}
        >
          Start an interview <span>→</span>
        </button>
      </section>

      <section className="stats">
        <article className="stat-card">
          <span className="stat-icon purple">✦</span>
          <p>Interview sessions</p>
          <h2>{loading ? "..." : interviews.length}</h2>
          <small>Sessions saved in your database</small>
        </article>

        <article className="stat-card">
          <span className="stat-icon blue">◷</span>
          <p>Practice time</p>
          <h2>—</h2>
          <small>Time tracking not implemented yet</small>
        </article>

        <article className="stat-card">
          <span className="stat-icon orange">↗</span>
          <p>Average score</p>
          <h2>—</h2>
          <small>Score tracking not implemented yet</small>
        </article>
      </section>

      <section className="section-heading">
        <div>
          <h2>Start practicing</h2>
          <p>Choose a track for your next opportunity.</p>
        </div>
      </section>

      <section className="tracks">
        <article className="track-card">
          <span className="track-icon">{"</>"}</span>
          <h3>Backend Developer</h3>
          <p>APIs, databases, Java, Python and system fundamentals.</p>
          <button
            className="text-btn"
            onClick={() => startInterview("Backend Developer")}
          >
            Practice now →
          </button>
        </article>

        <article className="track-card">
          <span className="track-icon">✧</span>
          <h3>AI / ML Engineer</h3>
          <p>Machine learning, deep learning, model evaluation and AI.</p>
          <button
            className="text-btn"
            onClick={() => startInterview("AI / ML Engineer")}
          >
            Practice now →
          </button>
        </article>

        <article className="track-card">
          <span className="track-icon">⌘</span>
          <h3>Full Stack Developer</h3>
          <p>React, REST APIs, frontend and backend development.</p>
          <button
            className="text-btn"
            onClick={() => startInterview("Full Stack Developer")}
          >
            Practice now →
          </button>
        </article>
      </section>

      <section className="section-heading">
        <div>
          <h2>Recent interviews</h2>
          <p>Your saved interview sessions from the backend.</p>
        </div>
      </section>

      {loading ? (
        <p>Loading interview history...</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : interviews.length === 0 ? (
        <p>
          No interview sessions yet. Start your first interview to see
          it here.
        </p>
      ) : (
        <section className="tracks">
          {interviews.slice(0, 5).map((interview) => (
            <article className="track-card" key={interview.id}>
              <h3>{interview.role}</h3>
              <p>Difficulty: {interview.difficulty}</p>
              <p>
                Questions:{" "}
                {Array.isArray(interview.questions)
                  ? interview.questions.length
                  : "—"}
              </p>
              <small>{formatDate(interview.createdAt)}</small>
            </article>
          ))}
        </section>
      )}

      <p style={{ marginTop: "24px" }}>
        <strong>Backend status:</strong> {backendStatus}
      </p>
    </main>
  );
}
