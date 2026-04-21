import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  Grid,
  Box,
  Typography,
  CircularProgress,
  LinearProgress,
  Paper,
} from "@mui/material";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ProgressChart = ({ analytics }) => {
  const transformAnalyticsData = (analyticsData) => {
    if (analyticsData && analyticsData.topic_progress) {
      return Object.entries(analyticsData.topic_progress).map(([topic, progress]) => ({
        name: topic.substring(0, 15),
        completed: progress.completed,
        remaining: progress.total - progress.completed,
        total: progress.total,
      }));
    }
    return [];
  };

  const chartData = useMemo(() => transformAnalyticsData(analytics), [analytics]);

  if (!analytics) {
    return (
      <Card sx={{ mt: 3, textAlign: "center", p: 3 }}>
        <Typography>Loading analytics...</Typography>
      </Card>
    );
  }

  const pieData = [
    {
      name: "Completed",
      value: analytics.topics_completed || 0,
      color: "#10B981",
    },
    {
      name: "Remaining",
      value: (analytics.completion_percentage === 100 ? 0 : 1),
      color: "#F3F4F6",
    },
  ];

  return (
    <Box sx={{ mt: 0 }}>
      <Grid container spacing={2}>
        {/* Overall Stats */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography color="textSecondary" gutterBottom>
                Overall Progress
              </Typography>
              <Box sx={{ position: "relative", display: "inline-flex", my: 2 }}>
                <CircularProgress
                  variant="determinate"
                  value={analytics.completion_percentage || 0}
                  size={80}
                  thickness={4}
                  sx={{
                    color: "#10B981",
                  }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: "absolute",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="caption" component="div" color="textSecondary">
                    {Math.round(analytics.completion_percentage || 0)}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Study Sessions */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography color="textSecondary" gutterBottom>
                Study Sessions
              </Typography>
              <Typography variant="h4" sx={{ my: 2, fontWeight: "bold", color: "#F59E0B" }}>
                {analytics.total_sessions || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {analytics.total_hours || 0}h total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Topics Completed */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography color="textSecondary" gutterBottom>
                Topics Completed
              </Typography>
              <Typography variant="h4" sx={{ my: 2, fontWeight: "bold", color: "#10B981" }}>
                {analytics.topics_completed || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Time Per Topic */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography color="textSecondary" gutterBottom>
                Avg Time/Topic
              </Typography>
              <Typography variant="h4" sx={{ my: 2, fontWeight: "bold", color: "#0F766E" }}>
                {analytics.total_sessions > 0
                  ? Math.round((analytics.total_hours * 60) / analytics.total_sessions)
                  : 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                minutes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Progress by Topic */}
        {chartData.length > 0 && (
          <Grid item xs={12}>
            <Card sx={{ boxShadow: 2, borderRadius: 2, p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                📊 Progress by Topic
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#10B981" name="Completed" />
                  <Bar dataKey="remaining" fill="#E5E7EB" name="Remaining" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        )}

        {/* Completion Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 2, borderRadius: 2, p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              📈 Completion Status
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProgressChart;
