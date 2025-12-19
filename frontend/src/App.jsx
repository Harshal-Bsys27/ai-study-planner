import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Box,
  LinearProgress,
} from "@mui/material";
import { green, orange, red } from "@mui/material/colors";

function App() {
  const [subject, setSubject] = useState("DSA");
  const [days, setDays] = useState(3);
  const [hours, setHours] = useState(2);
  const [level, setLevel] = useState("Beginner");
  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(false);

  // ===============================
  // GENERATE PLAN (BACKEND)
  // ===============================
  const generatePlan = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, days, hours, level }),
      });

      const data = await res.json();
      setPlan(data.plan);
    } catch (err) {
      alert("Backend not reachable");
    }
    setLoading(false);
  };

  // ===============================
  // TOGGLE COMPLETION
  // ===============================
  const toggleSubtopic = (dayIndex, subIndex) => {
    const updated = [...plan];
    updated[dayIndex].subtopics[subIndex].completed =
      !updated[dayIndex].subtopics[subIndex].completed;
    setPlan(updated);
  };

  // ===============================
  // PROGRESS CALCULATIONS
  // ===============================
  const dayProgress = (day) => {
    const total = day.subtopics.length;
    const completed = day.subtopics.filter((s) => s.completed).length;
    return Math.round((completed / total) * 100);
  };

  const overallProgress = () => {
    if (plan.length === 0) return 0;
    const total = plan.reduce((s, d) => s + d.subtopics.length, 0);
    const done = plan.reduce(
      (s, d) => s + d.subtopics.filter((x) => x.completed).length,
      0
    );
    return Math.round((done / total) * 100);
  };

  // ===============================
  // SMART ADJUST (FIXED)
  // ===============================
  const smartAdjust = async (dayIndex) => {
    try {
      const res = await fetch("http://localhost:5000/api/smart-adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plan[dayIndex]), // 👈 FULL DAY OBJECT
      });

      const data = await res.json();

      const updated = [...plan];
      updated[dayIndex].subtopics = data.subtopics;
      updated[dayIndex].progress = data.progress;
      updated[dayIndex].status = data.status;

      setPlan(updated);
    } catch {
      alert("Smart adjust failed");
    }
  };

  // ===============================
  // STATUS COLOR
  // ===============================
  const statusInfo = (day) => {
    const p = dayProgress(day);
    if (p < 50) return { text: "Behind", color: red[500] };
    if (p < 80) return { text: "On Track", color: orange[500] };
    return { text: "Ahead", color: green[500] };
  };

  // ===============================
  // UI
  // ===============================
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">AI Study Planner</Typography>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        {/* CONTROLS */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Subject</InputLabel>
              <Select
                value={subject}
                label="Subject"
                onChange={(e) => setSubject(e.target.value)}
              >
                <MenuItem value="DSA">DSA</MenuItem>
                <MenuItem value="ML">ML</MenuItem>
                <MenuItem value="Python">Python</MenuItem>
                <MenuItem value="AI">AI</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={2}>
            <TextField
              label="Days"
              type="number"
              fullWidth
              value={days}
              onChange={(e) => setDays(+e.target.value)}
            />
          </Grid>

          <Grid item xs={6} md={2}>
            <TextField
              label="Hours/Day"
              type="number"
              fullWidth
              value={hours}
              onChange={(e) => setHours(+e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Level</InputLabel>
              <Select
                value={level}
                label="Level"
                onChange={(e) => setLevel(e.target.value)}
              >
                <MenuItem value="Beginner">Beginner</MenuItem>
                <MenuItem value="Intermediate">Intermediate</MenuItem>
                <MenuItem value="Advanced">Advanced</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <Button fullWidth variant="contained" onClick={generatePlan}>
              {loading ? "Generating..." : "Generate"}
            </Button>
          </Grid>
        </Grid>

        {/* OVERALL PROGRESS */}
        {plan.length > 0 && (
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography>
                Overall Progress: {overallProgress()}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={overallProgress()}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </CardContent>
          </Card>
        )}

        {/* DAY CARDS */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {plan.map((day, i) => {
            const status = statusInfo(day);
            return (
              <Grid item xs={12} md={4} key={i}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">
                      Day {day.day} — {day.topic}
                    </Typography>

                    <Typography sx={{ color: status.color }}>
                      {status.text} • {dayProgress(day)}%
                    </Typography>

                    <LinearProgress
                      variant="determinate"
                      value={dayProgress(day)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        my: 1,
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: status.color,
                        },
                      }}
                    />

                    <Box>
                      {day.subtopics.map((s, j) => (
                        <Chip
                          key={j}
                          label={`${s.name} (${s.hours}h)`}
                          clickable
                          onClick={() => toggleSubtopic(i, j)}
                          color={s.completed ? "success" : "default"}
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>

                    <Button
                      sx={{ mt: 1 }}
                      variant="outlined"
                      onClick={() => smartAdjust(i)}
                    >
                      Smart Adjust
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </>
  );
}

export default App;
