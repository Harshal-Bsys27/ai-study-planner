import React, { useState, useEffect } from "react";
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
  Snackbar,
  Alert,
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
} from "recharts";

import Auth from "./pages/Auth";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [subject, setSubject] = useState("DSA");
  const [days, setDays] = useState(3);
  const [hours, setHours] = useState(2);
  const [level, setLevel] = useState("Beginner");
  const [plan, setPlan] = useState([]);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setPlan([]);
  };

  // Show snackbar
  const showSnackbar = (message, type = 'success') => {
    setSnackbar({ open: true, message, type });
  };

  // ===============================
  // GENERATE PLAN
  // ===============================
  const generatePlan = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify({ subject, days, hours, level }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          handleLogout();
        }
        return;
      }

      const data = await res.json();
      setPlan(data.plan || []);
      setCurrentPlanId(data.id);
      showSnackbar('✅ Study plan generated successfully!');
    } catch (error) {
      showSnackbar('Error generating plan', 'error');
    }
  };

  // ===============================
  // TOGGLE COMPLETION
  // ===============================
  const toggleSubtopic = async (dayIndex, subIndex) => {
    const updated = [...plan];
    updated[dayIndex].topics[subIndex].completed =
      !updated[dayIndex].topics[subIndex].completed;

    try {
      await fetch(`http://localhost:5000/api/plans/1/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          day: dayIndex + 1,
          topic: updated[dayIndex].topics[subIndex].name,
          completed: updated[dayIndex].topics[subIndex].completed,
        }),
      });

      setPlan(updated);
      
      const action = updated[dayIndex].topics[subIndex].completed ? 'completed' : 'uncompleted';
      showSnackbar(`✅ Topic ${action}!`);
    } catch (error) {
      showSnackbar('Error updating progress', 'error');
    }
  };

  // ===============================
  // PROGRESS
  // ===============================
  const dayProgress = (day) => {
    const total = day.topics.length;
    const completed = day.topics.filter((s) => s.completed).length;
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
  // CHART DATA
  // ===============================
  const barData = plan.map((day) => ({
    name: `Day ${day.day}`,
    progress: dayProgress(day),
  }));

  const pieData = [
    {
      name: "Completed",
      value: plan.reduce((s, d) => s + d.topics.filter((x) => x.completed).length, 0) || 0,
    },
    {
      name: "Remaining",
      value: plan.reduce((s, d) => s + d.topics.filter((x) => !x.completed).length, 0) || 0,
    },
  ];

  const totalProgress = pieData[0].value + pieData[1].value > 0 
    ? Math.round((pieData[0].value / (pieData[0].value + pieData[1].value)) * 100)
    : 0;

  // Show auth page if not logged in
  if (!isAuthenticated) {
    return <Auth onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

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
          </Box>

          <Button 
            color="inherit"
            onClick={handleLogout}
            sx={{ 
              textTransform: "capitalize",
              "&:hover": { background: "rgba(255,255,255,0.1)" }
            }}
          >
            🚪 Logout
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
            📋 Plan Your Study
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="DSA">📊 DSA</MenuItem>
                  <MenuItem value="Python">🐍 Python</MenuItem>
                  <MenuItem value="Web Dev">🌐 Web Dev</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Days"
                type="number"
                fullWidth
                value={days}
                onChange={(e) => setDays(+e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Hours/Day"
                type="number"
                fullWidth
                value={hours}
                onChange={(e) => setHours(+e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Level</InputLabel>
                <Select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="Beginner">🌱 Beginner</MenuItem>
                  <MenuItem value="Intermediate">📈 Intermediate</MenuItem>
                  <MenuItem value="Advanced">🚀 Advanced</MenuItem>
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
                <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      📊 Overall Progress
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie data={pieData} dataKey="value" innerRadius={50} outerRadius={80}>
                            <Cell fill={COLORS.ahead} />
                            <Cell fill="#E2E8F0" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.primary }}>
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
                <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      📈 Day-wise Progress
                    </Typography>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={barData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Bar dataKey="progress" fill={COLORS.secondary} radius={[8, 8, 0, 0]} />
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
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: COLORS.primary }}>
              📅 Your Study Plan
            </Typography>
            <Grid container spacing={3}>
              {plan.map((day, i) => {
                const status = statusInfo(day);
                return (
                  <Grid item xs={12} md={4} key={i}>
                    <Card sx={{
                      borderRadius: 3,
                      border: `2px solid ${status.color}20`,
                      transition: "all 0.3s",
                      "&:hover": { transform: "translateY(-8px)", boxShadow: "0 12px 24px rgba(0,0,0,0.15)" },
                    }}>
                      <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.primary }}>
                              Day {day.day}
                            </Typography>
                          </Box>
                          <Chip label={status.text} sx={{ background: status.color, color: "#fff" }} />
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
                          <LinearProgress value={dayProgress(day)} variant="determinate" sx={{ height: 10, borderRadius: 8 }} />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 1 }}>
                            Topics ({day.topics.filter(s => s.completed).length}/{day.topics.length})
                          </Typography>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {day.topics.map((s, j) => (
                              <Chip
                                key={j}
                                label={s.name}
                                onClick={() => toggleSubtopic(i, j)}
                                sx={{
                                  background: s.completed ? COLORS.ahead : "#F1F5F9",
                                  color: s.completed ? "#fff" : "#475569",
                                  cursor: 'pointer',
                                  fontWeight: 500,
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    transform: 'scale(1.05)',
                                  }
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {plan.length === 0 && (
          <Paper elevation={0} sx={{ p: 8, textAlign: "center", borderRadius: 3, border: "2px dashed #CBD5E1" }}>
            <Typography variant="h5" sx={{ color: "#64748B", fontWeight: 600, mb: 1 }}>
              📚 No Plan Generated Yet
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Fill in your details and click "Generate Plan" to get started!
            </Typography>
          </Paper>
        )}
      </Container>

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.type} sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
