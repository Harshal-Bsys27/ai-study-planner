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

  const generatePlan = async () => {
    setLoading(true);
    // Mock backend API call
    const tempPlan = [];
    for (let i = 1; i <= days; i++) {
      const subtopics = [
        { name: "Topic A", completed: false, hours },
        { name: "Topic B", completed: false, hours },
        { name: "Topic C", completed: false, hours },
      ];
      tempPlan.push({ day: i, topic: subject, hours, level, subtopics });
    }
    setPlan(tempPlan);
    setLoading(false);
  };

  const toggleSubtopic = (dayIndex, subIndex) => {
    const updated = [...plan];
    updated[dayIndex].subtopics[subIndex].completed =
      !updated[dayIndex].subtopics[subIndex].completed;
    setPlan(updated);
  };

  const dayProgress = (day) => {
    const total = day.subtopics.length;
    const completed = day.subtopics.filter(s => s.completed).length;
    return Math.round((completed / total) * 100);
  };

  const overallProgress = () => {
    if (plan.length === 0) return 0;
    const totalSubs = plan.reduce(
      (sum, day) => sum + day.subtopics.length,
      0
    );
    const completedSubs = plan.reduce(
      (sum, day) => sum + day.subtopics.filter(s => s.completed).length,
      0
    );
    return Math.round((completedSubs / totalSubs) * 100);
  };

  const smartAdjust = (dayIndex) => {
    const updated = [...plan];
    const day = updated[dayIndex];
    const progress = dayProgress(day);

    if (progress < 50) {
      day.subtopics.forEach(sub => {
        if (!sub.completed) sub.hours = (sub.hours || hours) + 1;
      });
    } else if (progress >= 50 && progress < 80) {
      day.subtopics.forEach(sub => {
        if (!sub.completed) sub.hours = (sub.hours || hours) + 0.5;
      });
    }
    setPlan(updated);
  };

  const dayStatus = (day) => {
    const progress = dayProgress(day);
    if (progress < 50) return { text: "Behind", color: red[500] };
    if (progress < 80) return { text: "On Track", color: orange[500] };
    return { text: "Ahead", color: green[500] };
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">AI Study Planner</Typography>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
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
              onChange={(e) => setDays(Number(e.target.value))}
            />
          </Grid>

          <Grid item xs={6} md={2}>
            <TextField
              label="Hours/Day"
              type="number"
              fullWidth
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
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
            <Button
              variant="contained"
              fullWidth
              sx={{ height: "100%" }}
              onClick={generatePlan}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate"}
            </Button>
          </Grid>
        </Grid>

        {plan.length > 0 && (
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6">
                Overall Progress: {overallProgress()}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={overallProgress()}
                sx={{ height: 10, borderRadius: 5, mt: 1 }}
                color="primary"
              />
            </CardContent>
          </Card>
        )}

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {plan.map((day, dayIndex) => {
            const status = dayStatus(day);
            return (
              <Grid item xs={12} md={4} key={dayIndex}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">
                      Day {day.day} — {day.topic}
                    </Typography>

                    <Typography variant="body2" sx={{ color: status.color }}>
                      ⏱ {day.hours} hrs | 🎯 {day.level} | Status: {status.text}
                    </Typography>

                    <Typography sx={{ mt: 1 }}>
                      Progress: {dayProgress(day)}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={dayProgress(day)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        mb: 1,
                        backgroundColor: "#f0f0f0",
                        "& .MuiLinearProgress-bar": { backgroundColor: status.color },
                      }}
                    />

                    <Box sx={{ mt: 1 }}>
                      {day.subtopics.map((sub, subIndex) => (
                        <Chip
                          key={subIndex}
                          label={`${sub.name} (${sub.hours || hours}h)`}
                          clickable
                          onClick={() => toggleSubtopic(dayIndex, subIndex)}
                          color={sub.completed ? "success" : "default"}
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>

                    <Button
                      variant="outlined"
                      sx={{ mt: 1 }}
                      onClick={() => smartAdjust(dayIndex)}
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
