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
} from "@mui/material";

function App() {
  const [subject, setSubject] = useState("");
  const [days, setDays] = useState(1);
  const [hours, setHours] = useState(1);
  const [level, setLevel] = useState("Beginner");
  const [plan, setPlan] = useState([]);

  const generatePlan = async () => {
    // Placeholder plan logic, later replace with backend API call
    const tempPlan = [];
    for (let i = 1; i <= days; i++) {
      tempPlan.push(
        `Day ${i}: Study ${subject} (${hours} hour${hours > 1 ? "s" : ""}) - ${level} level`
      );
    }
    setPlan(tempPlan);
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">AI Study Planner</Typography>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              label="Subject"
              fullWidth
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              label="Days"
              type="number"
              fullWidth
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            />
          </Grid>

          <Grid item xs={12} md={2}>
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
            >
              Generate
            </Button>
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mt: 4 }}>
          {plan.map((item, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card>
                <CardContent>
                  <Typography>{item}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  );
}

export default App;
