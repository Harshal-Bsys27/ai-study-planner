import React, { useEffect, useRef, useReducer } from "react";
import {
  Card,
  CardContent,
  Button,
  Box,
  Typography,
  LinearProgress,
  Stack,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";

const PomodoroTimer = ({ planId, topic, onSessionComplete }) => {
  const FOCUS_TIME = 1500; // 25 minutes
  const BREAK_TIME = 300; // 5 minutes

  // Reducer for batching state updates
  const timerReducer = (state, action) => {
    switch (action.type) {
      case 'TICK':
        return { ...state, timeLeft: state.timeLeft - 1 };
      case 'TOGGLE':
        return { ...state, isRunning: !state.isRunning };
      case 'RESET':
        return { timeLeft: FOCUS_TIME, isRunning: false, isBreak: false, sessionsCompleted: state.sessionsCompleted };
      case 'COMPLETE_SESSION':
        return {
          timeLeft: BREAK_TIME,
          isRunning: state.isRunning,
          isBreak: true,
          sessionsCompleted: state.sessionsCompleted + 1,
        };
      case 'COMPLETE_BREAK':
        return {
          timeLeft: FOCUS_TIME,
          isRunning: state.isRunning,
          isBreak: false,
          sessionsCompleted: state.sessionsCompleted,
        };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(timerReducer, {
    timeLeft: FOCUS_TIME,
    isRunning: false,
    isBreak: false,
    sessionsCompleted: 0,
  });

  const lastSessionTimeRef = useRef(0);

  useEffect(() => {
    let interval;

    if (state.isRunning && state.timeLeft > 0) {
      interval = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [state.isRunning, state.timeLeft]);

  // Handle session completion separately
  useEffect(() => {
    if (state.isRunning && state.timeLeft === 0 && lastSessionTimeRef.current !== state.timeLeft) {
      lastSessionTimeRef.current = state.timeLeft;

      if (!state.isBreak) {
        // Completed a focus session
        if (onSessionComplete) {
          onSessionComplete({
            plan_id: planId,
            topic: topic,
            completed: true,
            duration: FOCUS_TIME,
          });
        }
        // Start break
        dispatch({ type: 'COMPLETE_SESSION' });
      } else {
        // Break completed, restart focus
        dispatch({ type: 'COMPLETE_BREAK' });
      }
    }
  }, [state.isRunning, state.timeLeft, state.isBreak, planId, topic, onSessionComplete, FOCUS_TIME]);

  const toggleTimer = () => {
    dispatch({ type: 'TOGGLE' });
  };

  const resetTimer = () => {
    dispatch({ type: 'RESET' });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = state.isBreak
    ? ((BREAK_TIME - state.timeLeft) / BREAK_TIME) * 100
    : ((FOCUS_TIME - state.timeLeft) / FOCUS_TIME) * 100;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: state.isBreak
          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        color: "white",
        borderRadius: 3,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <CardContent sx={{ textAlign: "center", flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {state.isBreak ? "🎵 Break Time" : "⏲️ Focus Time"}
        </Typography>

        <Typography variant="h2" sx={{ fontWeight: "bold", my: 3, fontFamily: "monospace" }}>
          {formatTime(state.timeLeft)}
        </Typography>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            mb: 3,
            height: 8,
            borderRadius: 4,
            backgroundColor: "rgba(255,255,255,0.2)",
            "& .MuiLinearProgress-bar": {
              backgroundColor: "white",
            },
          }}
        />

        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
          <Button
            onClick={toggleTimer}
            variant="contained"
            sx={{ bgcolor: "white", color: "black", fontWeight: "bold" }}
            startIcon={state.isRunning ? <PauseIcon /> : <PlayArrowIcon />}
          >
            {state.isRunning ? "Pause" : "Start"}
          </Button>
          <Button
            onClick={resetTimer}
            variant="outlined"
            sx={{ borderColor: "white", color: "white" }}
            startIcon={<StopIcon />}
          >
            Reset
          </Button>
        </Stack>

        <Box sx={{ mt: 2, p: 1, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 2 }}>
          <Typography variant="body2">
            ✅ Sessions Completed: <strong>{state.sessionsCompleted}</strong>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PomodoroTimer;
