import React, { useContext, useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  Stack,
  LinearProgress,
} from "@mui/material";
import { ThemeModeContext } from "../theme";

const TopicsStatistics = ({ plan }) => {
  const { mode } = useContext(ThemeModeContext);
  const isDarkMode = mode === "dark";

  // Calculate topic statistics
  const topicStats = useMemo(() => {
    if (!plan || plan.length === 0) return [];

    const stats = {};

    // Aggregate topics across all days
    plan.forEach((day) => {
      if (day.topics && Array.isArray(day.topics)) {
        day.topics.forEach((topic) => {
          if (!stats[topic.name]) {
            stats[topic.name] = {
              name: topic.name,
              hours: 0,
              completed: 0,
              total: 0,
            };
          }
          stats[topic.name].hours += parseFloat(topic.hours) || 0;
          stats[topic.name].total += 1;
          if (topic.completed) stats[topic.name].completed += 1;
        });
      }
    });

    // Convert to array and sort by hours (descending)
    return Object.values(stats)
      .sort((a, b) => b.hours - a.hours);
  }, [plan]);

  const totalHours = useMemo(
    () => topicStats.reduce((sum, topic) => sum + topic.hours, 0),
    [topicStats]
  );

  if (!plan || plan.length === 0 || topicStats.length === 0) {
    return null;
  }

  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: 3,
        background: isDarkMode
          ? "linear-gradient(135deg, rgba(10, 40, 24, 0.8), rgba(15, 50, 30, 0.8))"
          : "linear-gradient(135deg, rgba(240, 249, 255, 0.95), rgba(224, 242, 254, 0.9))",
        border: `2px solid ${isDarkMode ? "#34d399" : "#06b6d4"}`,
        boxShadow: isDarkMode
          ? "0 4px 16px rgba(52, 211, 153, 0.1)"
          : "0 4px 16px rgba(6, 182, 212, 0.1)",
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 2.5,
            color: isDarkMode ? "#6ee7b7" : "#0f766e",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          ⏱️ Topics Time Breakdown
          <Chip
            label={`${topicStats.length} topics`}
            size="small"
            sx={{
              background: isDarkMode ? "#065f46" : "#dcfce7",
              color: isDarkMode ? "#6ee7b7" : "#166534",
              fontWeight: 600,
              ml: "auto",
            }}
          />
        </Typography>

        <List sx={{ width: "100%", p: 0 }}>
          {topicStats.map((topic, index) => {
            const percentage = totalHours > 0 ? (topic.hours / totalHours) * 100 : 0;
            const completionPercent =
              topic.total > 0 ? (topic.completed / topic.total) * 100 : 0;

            return (
              <ListItem
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 1,
                  py: 2,
                  px: 0,
                  borderBottom: isDarkMode
                    ? "1px solid rgba(34, 197, 94, 0.2)"
                    : "1px solid rgba(6, 182, 212, 0.2)",
                  "&:last-child": { borderBottom: "none" },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: isDarkMode ? "#e2e8f0" : "#0f172a",
                        }}
                      >
                        {topic.name}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        sx={{
                          color: isDarkMode ? "#9ca3af" : "#64748b",
                          fontWeight: 500,
                        }}
                      >
                        {topic.completed} of {topic.total} completed
                      </Typography>
                    }
                  />
                  <Stack spacing={0.5} alignItems="flex-end">
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: isDarkMode ? "#34d399" : "#0f766e",
                        fontFamily: "monospace",
                      }}
                    >
                      {topic.hours.toFixed(1)}h
                    </Typography>
                    <Chip
                      label={`${percentage.toFixed(0)}%`}
                      size="small"
                      sx={{
                        background: isDarkMode ? "#1e3a3a" : "#ecfdf5",
                        color: isDarkMode ? "#6ee7b7" : "#047857",
                        fontWeight: 600,
                        fontSize: "0.7rem",
                      }}
                    />
                  </Stack>
                </Box>

                {/* Progress bar */}
                <Box sx={{ width: "100%", display: "flex", gap: 1, alignItems: "center" }}>
                  <LinearProgress
                    variant="determinate"
                    value={completionPercent}
                    sx={{
                      flex: 1,
                      height: 6,
                      borderRadius: 3,
                      background: isDarkMode ? "#374151" : "#e5e7eb",
                      "& .MuiLinearProgress-bar": {
                        background: isDarkMode
                          ? "linear-gradient(90deg, #34d399, #6ee7b7)"
                          : "linear-gradient(90deg, #10b981, #34d399)",
                        borderRadius: 3,
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: isDarkMode ? "#9ca3af" : "#64748b",
                      fontWeight: 600,
                      minWidth: 35,
                    }}
                  >
                    {completionPercent.toFixed(0)}%
                  </Typography>
                </Box>
              </ListItem>
            );
          })}
        </List>

        {/* Total summary */}
        <Box
          sx={{
            mt: 2.5,
            pt: 2.5,
            borderTop: isDarkMode
              ? "2px solid rgba(34, 197, 94, 0.2)"
              : "2px solid rgba(6, 182, 212, 0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              color: isDarkMode ? "#cbd5e1" : "#64748b",
            }}
          >
            📊 Total Study Hours
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: isDarkMode ? "#34d399" : "#0f766e",
              fontFamily: "monospace",
            }}
          >
            {totalHours.toFixed(1)}h
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TopicsStatistics;
