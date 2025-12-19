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

// 🔥 RECHARTS
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

function App() {
  const [subject, setSubject] = useState("DSA");
  const [days, setDays] = useState(3);
  const [hours, setHours] = useState(2);
  const [level, setLevel] = useState("Beginner");
  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(false);

  // ===============================
  // GENERATE PLAN
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
    } catch {
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
  // PROGRESS CALC
  // ===============================
  const dayProgress = (day) => {
    const total = day.subtopics.length;
    const completed = day.subtopics.filter((s) => s.completed).length;
    return Math.round((completed / total) * 100);
  };

  const overallProgress = () => {
    if (!plan.length) return 0;
    const total = plan.reduce((s, d) => s + d.subtopics.length, 0);
    const done = plan.reduce(
      (s, d) => s + d.subtopics.filter((x) => x.completed).length,
      0
    );
    return Math.round((done / total) * 100);
  };

  // ===============================
  // SMART ADJUST (BACKEND AI)
  // ===============================
  const smartAdjust = async (dayIndex) => {
    try {
      const res = await fetch("http://localhost:5000/api/smart-adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plan[dayIndex]),
      });
      const data = await res.json();

      const updated = [...plan];
      updated[dayIndex].subtopics = data.subtopics;
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
  // 📊 CHART DATA
  // ===============================
  const pieData = [
    { name: "Completed", value: overallProgress() },
    { name: "Remaining", value: 100 - overallProgress() },
  ];

  const barData = plan.map((day) => ({
    name: `Day ${day.day}`,
    progress: dayProgress(day),
  }));

  const COLORS = ["#4caf50", "#e0e0e0"];

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
              <Select value={subject} onChange={(e) => setSubject(e.target.value)}>
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
              <Select value={level} onChange={(e) => setLevel(e.target.value)}>
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

        {/* 📊 ANALYTICS */}
        {plan.length > 0 && (
          <Grid container spacing={3} sx={{ mt: 4 }}>
            {/* PIE */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Overall Completion</Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" innerRadius={50}>
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* BAR */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Day-wise Progress</Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={barData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="progress" fill="#1976d2" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
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
