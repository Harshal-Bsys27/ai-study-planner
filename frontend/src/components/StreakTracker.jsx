import React, { useState, useContext } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  LinearProgress,
} from "@mui/material";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { ThemeModeContext } from "../theme";

const StreakTracker = ({ streak, onUpdateStreak }) => {
  const [loading, setLoading] = useState(false);
  const { mode } = useContext(ThemeModeContext);
  const isDarkMode = mode === "dark";

  const handleUpdateStreak = async () => {
    setLoading(true);
    if (onUpdateStreak) {
      await onUpdateStreak();
    }
    setLoading(false);
  };

  if (!streak) {
    return (
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: isDarkMode 
            ? "linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)" 
            : "linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)",
          color: "white",
          borderRadius: 3,
          boxShadow: isDarkMode 
            ? "0 4px 12px rgba(239, 68, 68, 0.2)" 
            : "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <CardContent sx={{ textAlign: "center", flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography>Loading streak data...</Typography>
        </CardContent>
      </Card>
    );
  }

  const streakPercentage = Math.min((streak.current_streak / Math.max(streak.longest_streak, 1)) * 100, 100);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: isDarkMode 
          ? "linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)" 
          : "linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)",
        color: "white",
        borderRadius: 3,
        boxShadow: isDarkMode 
          ? "0 4px 12px rgba(239, 68, 68, 0.2)" 
          : "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <CardContent sx={{ textAlign: "center", flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          🔥 Study Streak
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-around", alignItems: "center", mb: 3 }}>
          <Box>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 1 }}>
              <LocalFireDepartmentIcon sx={{ fontSize: 32, mr: 0.5, color: '#FFE66D' }} />
              <Typography variant="h2" sx={{ fontWeight: "bold", fontSize: '2rem' }}>
                {streak.current_streak}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Current
            </Typography>
          </Box>

          {/* Divider */}
          <Box sx={{ width: '2px', height: '50px', backgroundColor: 'rgba(255,255,255,0.3)' }} />

          <Box>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 1 }}>
              <Typography variant="h4" sx={{ mr: 0.5, fontSize: '1.5rem' }}>👑</Typography>
              <Typography variant="h2" sx={{ fontWeight: "bold", fontSize: '2rem' }}>
                {streak.longest_streak}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Longest
            </Typography>
          </Box>
        </Box>

        <LinearProgress
          variant="determinate"
          value={streakPercentage}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: "rgba(255,255,255,0.3)",
            "& .MuiLinearProgress-bar": { backgroundColor: "#FFE66D" },
            mb: 3
          }}
        />

        <Typography variant="caption" sx={{ opacity: 0.9, mb: 3, display: 'block' }}>
          {streakPercentage.toFixed(0)}% progress to longest streak
        </Typography>

        <Box sx={{ mt: 'auto' }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleUpdateStreak}
            disabled={loading}
            sx={{
              backgroundColor: "white",
              color: "#FF6B6B",
              fontWeight: "bold",
              py: 1.5,
              "&:hover": { backgroundColor: "#FFE66D", color: "#333" },
              textTransform: 'none',
              fontSize: '0.95rem'
            }}
          >
            {loading ? "Updating..." : "📝 Log Study Session"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StreakTracker;
