import { useState } from "react";
import "./App.css";

function App() {
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [days, setDays] = useState(7);
  const [hours, setHours] = useState(2);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generatePlan = async () => {
    if (!subject.trim()) {
      setError("Please enter a subject");
      return;
    }

    setLoading(true);
    setError("");
    setPlan(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, level, days, hours }),
      });

      if (!response.ok) throw new Error("Failed to generate plan");

      const data = await response.json();
      setPlan(data);
    } catch (err) {
      setError("Backend not reachable. Is Flask running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>📘 AI Study Planner</h1>

      <div className="card">
        <input
          type="text"
          placeholder="Enter subject (e.g. DSA, ML)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <label>
          Skill Level:
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </label>

        <label>
          Total Days:
          <input
            type="number"
            min="1"
            max="30"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          />
        </label>

        <label>
          Hours per Day:
          <input
            type="number"
            min="1"
            max="12"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
          />
        </label>

        <button onClick={generatePlan} disabled={loading}>
          {loading ? "Generating..." : "Generate Study Plan"}
        </button>

        {error && <p className="error">{error}</p>}
      </div>

      {plan && (
        <div className="card plan">
          <h2>Study Plan for {plan.subject}</h2>
          <ul>
            {plan.plan.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
