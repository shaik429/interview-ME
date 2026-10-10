const API_BASE_URL = "http://localhost:8080";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  return response.json();
}

// Check backend connection
export function checkBackend() {
  return request("/api/health");
}

// Create a new interview
export function createInterview(
  role,
  difficulty = "Medium",
  questionCount = 3
) {
  return request("/api/interviews", {
    method: "POST",
    body: JSON.stringify({
      role,
      difficulty,
      questionCount,
    }),
  });
}

// Evaluate an answer and associate it with an interview session
export function evaluateAnswer(sessionId, question, answer) {
  return request("/api/interviews/evaluate", {
    method: "POST",
    body: JSON.stringify({
      sessionId,
      question,
      answer,
    }),
  });
}

// Get all interview sessions
export function getInterviews() {
  return request("/api/interviews");
}

// Get a specific interview session
export function getInterview(id) {
  return request(`/api/interviews/${id}`);
}
