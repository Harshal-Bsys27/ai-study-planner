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
  Paper,
} from "@mui/material";

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
  Legend,
} from "recharts";

const COLORS = {
  ahead: "#10B981",
  track: "#F59E0B",
  behind: "#EF4444",
  primary: "#0F766E",
  secondary: "#06B6D4",
  bg: "#F8FAFC",
  cardBg: "#FFFFFF",
};

function App() {
  const [subject, setSubject] = useState("DSA");
  const [days, setDays] = useState(3);
  const [hours, setHours] = useState(2);
  const [level, setLevel] = useState("Beginner");
  const [plan, setPlan] = useState([]);

  // ===============================
  // GENERATE PLAN
  // ===============================
  const generatePlan = async () => {
    const res = await fetch("http://localhost:5000/api/generate-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, days, hours, level }),
    });
    const data = await res.json();

    const enriched = data.plan.map((d) => ({
      ...d,
      baseHours: d.hours,
      status: "Behind",
    }));

    setPlan(enriched);
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
  // PROGRESS
  // ===============================
  const dayProgress = (day) => {
    const total = day.subtopics.length;
    const completed = day.subtopics.filter((s) => s.completed).length;
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  // ===============================
  // STATUS
  // ===============================
  const statusInfo = (day) => {
    const p = dayProgress(day);
    if (p < 50) return { text: "Behind", color: COLORS.behind };
    if (p < 80) return { text: "On Track", color: COLORS.track };
    return { text: "Ahead", color: COLORS.ahead };
  };

  // ===============================
  // SMART ADJUST
  // ===============================
  const smartAdjust = async (dayIndex) => {
    const res = await fetch("http://localhost:5000/api/smart-adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plan[dayIndex]),
    });

    const data = await res.json();
    const updated = [...plan];

    updated[dayIndex].subtopics = data.subtopics;
    updated[dayIndex].status = statusInfo(updated[dayIndex]).text;

    setPlan(updated);
  };

  // ===============================
  // CHART DATA (DYNAMIC)
  // ===============================
  const barData = plan.map((day) => ({
    name: `Day ${day.day}`,
    progress: dayProgress(day),
    completed: day.subtopics.filter((x) => x.completed).length,
    total: day.subtopics.length,
  }));

  const pieData = [
    {
      name: "Completed",
      value:
        plan.reduce(
          (s, d) =>
            s +
            d.subtopics.filter((x) => x.completed).length,
          0
        ) || 0,
    },
    {
      name: "Remaining",
      value:
        plan.reduce(
          (s, d) =>
            s +
            d.subtopics.filter((x) => !x.completed).length,
          0
        ) || 0,
    },
  ];

  const totalProgress = pieData[0].value + pieData[1].value > 0 
    ? Math.round((pieData[0].value / (pieData[0].value + pieData[1].value)) * 100)
    : 0;

  // ===============================
  // UI
  // ===============================
  return (
    <Box sx={{ background: COLORS.bg, minHeight: "100vh" }}>
      {/* NAVBAR */}
      <AppBar
        position="sticky"
        sx={{
          background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
          boxShadow: "0 4px 20px rgba(15, 118, 110, 0.15)",
        }}
      >
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              variant="h5" 
              sx={{ fontWeight: 700, letterSpacing: 0.5 }}
            >
              📚 AI Study Planner
            </Typography>
            <Typography
              variant="caption"
              sx={{ display: "block", opacity: 0.9, mt: 0.5 }}
            >
              Personalized • Adaptive • Human-centric
            </Typography>
          </Box>

          <Button 
            color="inherit"
            sx={{ 
              textTransform: "capitalize",
              "&:hover": { background: "rgba(255,255,255,0.1)" }
            }}
          >
            Analytics
          </Button>
          <Button 
            color="inherit"
            sx={{ 
              textTransform: "capitalize",
              "&:hover": { background: "rgba(255,255,255,0.1)" }
            }}
          >
            History
          </Button>
          <Button 
            color="inherit"
            sx={{ 
              textTransform: "capitalize",
              "&:hover": { background: "rgba(255,255,255,0.1)" }
            }}
          >
            Settings
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* CONTROLS */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            background: COLORS.cardBg,
            borderRadius: 3,
            border: `1px solid #E2E8F0`,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Plan Your Study
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={subject}
                  onChange={(e) =>
                    setSubject(e.target.value)
                  }
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="DSA">DSA</MenuItem>
                  <MenuItem value="ML">ML</MenuItem>
                  <MenuItem value="Python">Python</MenuItem>
                  <MenuItem value="AI">AI</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Days"
                type="number"
                fullWidth
                value={days}
                onChange={(e) =>
                  setDays(+e.target.value)
                }
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Hours/Day"
                type="number"
                fullWidth
                value={hours}
                onChange={(e) =>
                  setHours(+e.target.value)
                }
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Level</InputLabel>
                <Select
                  value={level}
                  onChange={(e) =>
                    setLevel(e.target.value)
                  }
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="Beginner">
                    Beginner
                  </MenuItem>
                  <MenuItem value="Intermediate">
                    Intermediate
                  </MenuItem>
                  <MenuItem value="Advanced">
                    Advanced
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                sx={{
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                  borderRadius: 2,
                  fontWeight: 600,
                  py: 1.5,
                  textTransform: "capitalize",
                  "&:hover": {
                    boxShadow: `0 8px 24px ${COLORS.primary}30`,
                  },
                }}
                onClick={generatePlan}
              >
                Generate Plan
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* CHARTS */}
        {plan.length > 0 && (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Card 
                  sx={{ 
                    borderRadius: 3,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    height: "100%",
                  }}
                >
                  <CardContent>
                    <Typography 
                      variant="h6" 
                      sx={{ fontWeight: 600, mb: 2 }}
                    >
                      📊 Overall Progress
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                      <ResponsiveContainer
                        width="100%"
                        height={180}
                      >
                        <PieChart>
                          <Pie
                            data={pieData}
                            dataKey="value"
                            innerRadius={50}
                            outerRadius={80}
                          >
                            <Cell fill={COLORS.ahead} />
                            <Cell fill="#E2E8F0" />
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: 8,
                              border: `1px solid ${COLORS.primary}`,
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography 
                        variant="h4" 
                        sx={{ fontWeight: 700, color: COLORS.primary }}
                      >
                        {totalProgress}%
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {pieData[0].value} of {pieData[0].value + pieData[1].value} completed
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Card 
                  sx={{ 
                    borderRadius: 3,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    height: "100%",
                  }}
                >
                  <CardContent>
                    <Typography 
                      variant="h6" 
                      sx={{ fontWeight: 600, mb: 2 }}
                    >
                      📈 Day-wise Progress
                    </Typography>
                    <ResponsiveContainer
                      width="100%"
                      height={280}
                    >
                      <BarChart 
                        data={barData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                      >
                        <XAxis dataKey="name" stroke="#94A3B8" />
                        <YAxis stroke="#94A3B8" />
                        <Tooltip 
                          contentStyle={{
                            borderRadius: 8,
                            border: `1px solid ${COLORS.primary}`,
                            background: "#FFF",
                          }}
                          formatter={(value) => `${value}%`}
                        />
                        <Bar
                          dataKey="progress"
                          fill={COLORS.secondary}
                          radius={[8, 8, 0, 0]}
                          isAnimationActive
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}

        {/* DAY CARDS */}
        {plan.length > 0 && (
          <Box>
            <Typography 
              variant="h6" 
              sx={{ fontWeight: 600, mb: 3, color: COLORS.primary }}
            >
              📅 Your Study Plan
            </Typography>
            <Grid container spacing={3}>
              {plan.map((day, i) => {
                const status = statusInfo(day);
                return (
                  <Grid item xs={12} md={4} key={i}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        border: `2px solid ${status.color}20`,
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                          transform: "translateY(-8px)",
                          boxShadow: `0 12px 24px ${status.color}25`,
                          border: `2px solid ${status.color}`,
                        },
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
                          <Box>
                            <Typography 
                              variant="h6"
                              sx={{ fontWeight: 700, color: COLORS.primary }}
                            >
                              Day {day.day}
                            </Typography>
                            <Typography 
                              variant="body2"
                              sx={{ color: "#64748B", fontWeight: 500 }}
                            >
                              {day.topic}
                            </Typography>
                          </Box>
                          <Chip
                            label={status.text}
                            sx={{
                              background: status.color,
                              color: "#fff",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                            }}
                          />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              Progress
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: status.color }}>
                              {dayProgress(day)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={dayProgress(day)}
                            sx={{
                              height: 10,
                              borderRadius: 8,
                              background: "#E2E8F0",
                              "& .MuiLinearProgress-bar": {
                                background: status.color,
                                borderRadius: 8,
                              },
                            }}
                          />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 1 }}>
                            Topics ({day.subtopics.filter(s => s.completed).length}/{day.subtopics.length})
                          </Typography>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {day.subtopics.map((s, j) => (
                              <Chip
                                key={j}
                                label={`${s.name} (${s.hours}h)`}
                                clickable
                                onClick={() =>
                                  toggleSubtopic(i, j)
                                }
                                sx={{
                                  background: s.completed 
                                    ? COLORS.ahead 
                                    : "#F1F5F9",
                                  color: s.completed ? "#fff" : "#475569",
                                  fontWeight: 500,
                                  transition: "all 0.2s",
                                  "&:hover": {
                                    transform: "scale(1.05)",
                                  },
                                }}
                              />
                            ))}
                          </Box>
                        </Box>

                        <Button
                          fullWidth
                          variant="outlined"
                          sx={{
                            borderColor: COLORS.primary,
                            color: COLORS.primary,
                            borderRadius: 2,
                            fontWeight: 600,
                            textTransform: "capitalize",
                            "&:hover": {
                              background: `${COLORS.primary}08`,
                              borderColor: COLORS.secondary,
                              color: COLORS.secondary,
                            },
                          }}
                          onClick={() =>
                            smartAdjust(i)
                          }
                        >
                          ⚡ Smart Adjust
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {plan.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 8,
              textAlign: "center",
              background: COLORS.cardBg,
              borderRadius: 3,
              border: `2px dashed #CBD5E1`,
            }}
          >
            <Typography variant="h5" sx={{ color: "#64748B", fontWeight: 600, mb: 1 }}>
              📚 No Plan Generated Yet
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Fill in your details above and click "Generate Plan" to get started!
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
}

export default App;
