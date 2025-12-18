import { useState } from "react";

function App() {
  const [subject, setSubject] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const generatePlan = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subject }),
      });

      const data = await response.json();
      setPlan(data);
    } catch (error) {
      console.error("Error:", error);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>AI Study Planner</h1>

      <form onSubmit={generatePlan}>
        <input
          type="text"
          placeholder="Enter subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          style={{ padding: "10px", width: "250px" }}
        />
        <br /><br />
        <button type="submit" style={{ padding: "10px 20px" }}>
          Generate Study Plan
        </button>
      </form>

      {loading && <p>Generating plan...</p>}

      {plan && (
        <div style={{ marginTop: "30px" }}>
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
