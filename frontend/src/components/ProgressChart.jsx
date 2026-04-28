import React from "react";
import {
  Card,
  CardContent,
  Grid,
  Box,
  Typography,
  CircularProgress,
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
  Legend,
  ResponsiveContainer,
} from "recharts";

const ProgressChart = ({ analytics }) => {
  const safeAnalytics = {
    completion_percentage: 0,
    topics_completed: 0,
    total_sessions: 0,
    total_hours: 0,
    topic_progress: {},
    ...(analytics || {}),
  };

  const transformAnalyticsData = (analyticsData) => {
    try {
      const tp = analyticsData?.topic_progress;
      if (tp && typeof tp === 'object' && Object.keys(tp).length > 0) {
        return Object.entries(tp)
          .filter(([topic, progress]) => topic && progress && typeof progress === 'object')
          .map(([topic, progress]) => ({
            name: String(topic).substring(0, 20),
            completed: Number(progress.completed) || 0,
            remaining: Math.max(0, (Number(progress.total) || 0) - (Number(progress.completed) || 0)),
            total: Number(progress.total) || 0,
          }))
          .filter(item => item.total > 0);
      }
      return [];
    } catch (error) {
      console.error('Error transforming analytics data:', error);
      return [];
    }
  };

  const chartData = transformAnalyticsData(safeAnalytics);

  const completionPercentage = Math.min(100, Math.max(0, Number(safeAnalytics.completion_percentage) || 0));
  const topicsCompleted = Number(safeAnalytics.topics_completed) || 0;
  const totalSessions = Number(safeAnalytics.total_sessions) || 0;
  const totalHours = Number(safeAnalytics.total_hours) || 0;

  const pieCompleted = Math.max(0, topicsCompleted);
  const pieRemaining = completionPercentage === 100 ? 0 : Math.max(0, 1);
  const pieTotal = pieCompleted + pieRemaining;

  const pieData = [
    { name: "Completed", value: pieTotal > 0 ? pieCompleted : 0, color: "#10B981" },
    { name: "Remaining", value: pieTotal > 0 ? pieRemaining : 1, color: "#F3F4F6" },
  ];

  const avgTimePerTopic = totalSessions > 0
    ? Math.round((totalHours * 60) / totalSessions)
    : 0;

  return (
    <Box sx={{ mt: 0, background: "linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 50%, #99f6e4 100%)", borderRadius: 3, p: 3 }}>
      <Grid container spacing={3}>
        {/* Overall Stats */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            boxShadow: "0 8px 24px rgba(15, 118, 110, 0.15)",
            borderRadius: 4, 
            border: "1px solid rgba(15, 118, 110, 0.1)",
            background: "linear-gradient(145deg, #0f766e 0%, #0d9488 100%)",
            height: "100%",
            minHeight: "200px",
            display: "flex",
            flexDirection: "column",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              boxShadow: "0 12px 40px rgba(15, 118, 110, 0.25)",
              transform: "translateY(-4px)",
              border: "1px solid rgba(15, 118, 110, 0.2)"
            }
          }}>
            <CardContent sx={{ textAlign: "center", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", p: 2 }}>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 700, letterSpacing: 0.5, mb: 0.8, textTransform: "uppercase", fontSize: "0.7rem" }}>
                📊 Overall Progress
              </Typography>
              <Box sx={{ position: "relative", display: "inline-flex", my: 1.5, mx: "auto" }}>
                <CircularProgress
                  variant="determinate"
                  value={completionPercentage}
                  size={80}
                  thickness={3.5}
                  sx={{
                    color: "#34d399",
                    filter: "drop-shadow(0 2px 8px rgba(52, 211, 153, 0.4))"
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
                  <Typography variant="h5" component="div" sx={{ color: "#fff", fontWeight: 800, fontSize: "1.4rem" }}>
                    {Math.round(completionPercentage)}%
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 500, mt: 0.5 }}>
                Topics mastered
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Study Sessions */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            boxShadow: "0 8px 24px rgba(245, 158, 11, 0.15)",
            borderRadius: 4, 
            border: "1px solid rgba(245, 158, 11, 0.1)",
            background: "linear-gradient(145deg, #d97706 0%, #b45309 100%)",
            height: "100%",
            minHeight: "200px",
            display: "flex",
            flexDirection: "column",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              boxShadow: "0 12px 40px rgba(245, 158, 11, 0.25)",
              transform: "translateY(-4px)",
              border: "1px solid rgba(245, 158, 11, 0.2)"
            }
          }}>
            <CardContent sx={{ textAlign: "center", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", p: 2 }}>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 700, letterSpacing: 0.5, mb: 0.8, textTransform: "uppercase", fontSize: "0.7rem" }}>
                ⏱️ Study Sessions
              </Typography>
              <Typography variant="h3" sx={{ my: 1.5, fontWeight: 800, color: "#fff", fontSize: "2rem" }}>
                {totalSessions}
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 600, mb: 0.3 }}>
                {totalHours}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                total hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Topics Completed */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            boxShadow: "0 8px 24px rgba(16, 185, 129, 0.15)",
            borderRadius: 4, 
            border: "1px solid rgba(16, 185, 129, 0.1)",
            background: "linear-gradient(145deg, #059669 0%, #047857 100%)",
            height: "100%",
            minHeight: "200px",
            display: "flex",
            flexDirection: "column",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              boxShadow: "0 12px 40px rgba(16, 185, 129, 0.25)",
              transform: "translateY(-4px)",
              border: "1px solid rgba(16, 185, 129, 0.2)"
            }
          }}>
            <CardContent sx={{ textAlign: "center", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", p: 2 }}>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 700, letterSpacing: 0.5, mb: 0.8, textTransform: "uppercase", fontSize: "0.7rem" }}>
                ✅ Topics Completed
              </Typography>
              <Typography variant="h3" sx={{ my: 1.5, fontWeight: 800, color: "#fff", fontSize: "2rem" }}>
                {topicsCompleted}
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 600, mb: 0.3 }}>
                out of
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                total topics
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Time Per Topic */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            boxShadow: "0 8px 24px rgba(6, 182, 212, 0.15)",
            borderRadius: 4, 
            border: "1px solid rgba(6, 182, 212, 0.1)",
            background: "linear-gradient(145deg, #0891b2 0%, #0e7490 100%)",
            height: "100%",
            minHeight: "200px",
            display: "flex",
            flexDirection: "column",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              boxShadow: "0 12px 40px rgba(6, 182, 212, 0.25)",
              transform: "translateY(-4px)",
              border: "1px solid rgba(6, 182, 212, 0.2)"
            }
          }}>
            <CardContent sx={{ textAlign: "center", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", p: 2 }}>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 700, letterSpacing: 0.5, mb: 0.8, textTransform: "uppercase", fontSize: "0.7rem" }}>
                ⏳ Avg Time/Topic
              </Typography>
              <Typography variant="h3" sx={{ my: 1.5, fontWeight: 800, color: "#fff", fontSize: "2rem" }}>
                {avgTimePerTopic}
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 600, mb: 0.3 }}>
                per topic
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                minutes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Completion Pie Chart */}
        <Grid item xs={12}>
          <Card sx={{ 
            boxShadow: "0 8px 24px rgba(15, 118, 110, 0.15)",
            borderRadius: 4,
            border: "1px solid rgba(15, 118, 110, 0.15)",
            p: 3,
            background: "#ffffff"
          }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 800, color: "#0f766e", fontSize: "1.1rem", letterSpacing: 0.5 }}>
              📈 Completion Status
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#ffffff", 
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Progress by Topic */}
        <Grid item xs={12}>
          <Card sx={{ 
            boxShadow: "0 8px 24px rgba(15, 118, 110, 0.15)",
            borderRadius: 4,
            border: "1px solid rgba(15, 118, 110, 0.15)",
            p: 3,
            background: "#ffffff"
          }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 800, color: "#0f766e", fontSize: "1.1rem", letterSpacing: 0.5 }}>
              📊 Progress by Topic
            </Typography>
            {(() => {
              try {
                if (!chartData || chartData.length === 0) {
                  return (
                    <Box sx={{ 
                      height: 300, 
                      display: "flex", 
                      flexDirection: "column",
                      alignItems: "center", 
                      justifyContent: "center",
                      gap: 2,
                      color: "#94a3b8"
                    }}>
                      <Typography sx={{ fontSize: "2.5rem" }}>📊</Typography>
                      <Typography variant="body1" sx={{ color: "#64748b", fontWeight: 600 }}>
                        No topic data yet
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#94a3b8", textAlign: "center", maxWidth: 300 }}>
                        Mark topics as completed in your study plan to see your progress chart
                      </Typography>
                    </Box>
                  );
                }
                return (
                  <Box sx={{ width: "100%", overflowX: "auto", pb: 1 }}>
                    <Box sx={{ minWidth: Math.max(800, chartData.length * 100), height: 400 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          barSize={36}
                          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                          <XAxis
                            dataKey="name"
                            stroke="#64748b"
                            tick={{ fontSize: 13, fontWeight: 600, fill: "#475569" }}
                            angle={-40}
                            textAnchor="end"
                            interval={0}
                            height={80}
                          />
                          <YAxis
                            stroke="#64748b"
                            tick={{ fontSize: 13, fontWeight: 600 }}
                            allowDecimals={false}
                          />
                          <Tooltip 
                            cursor={{ fill: "rgba(15, 118, 110, 0.05)" }}
                            contentStyle={{ 
                              backgroundColor: "#ffffff", 
                              border: "1px solid #cbd5e1",
                              borderRadius: "12px",
                              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                              fontSize: 14,
                              fontWeight: 500
                            }}
                            formatter={(value, name) => [value, name === 'completed' ? '✅ Completed' : '⏳ Remaining']}
                          />
                          <Legend 
                            wrapperStyle={{ fontSize: 14, fontWeight: 700, paddingBottom: 20 }}
                            iconType="circle"
                            formatter={(value) => value === 'completed' ? '✅ Completed' : '⏳ Remaining'}
                            verticalAlign="top"
                            align="right"
                          />
                          <Bar dataKey="completed" fill="#10b981" name="completed" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="remaining" fill="#cbd5e1" name="remaining" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                );
              } catch (err) {
                console.error('Chart render error:', err);
                return (
                  <Box sx={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography variant="body2" color="error">
                      Could not render chart. Please try again.
                    </Typography>
                  </Box>
                );
              }
            })()}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProgressChart;
