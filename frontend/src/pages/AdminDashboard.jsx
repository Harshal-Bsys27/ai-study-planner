import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  CircularProgress,
  TableContainer,
  Paper,
  Stack,
  Divider,
  Avatar,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import RefreshIcon from "@mui/icons-material/Refresh";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

const AdminDashboard = ({ token, onLogout, onBack }) => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState("");
  const [busyUserId, setBusyUserId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const initializedRef = useRef(false);

  const authHeaders = useMemo(() => ({
    Authorization: `Bearer ${token}`,
  }), [token]);

  const safeStats = useMemo(() => stats || {
    total_users: 0,
    active_users: 0,
    admin_users: 0,
    total_plans: 0,
    average_completion: 0,
    total_flashcards: 0,
    total_sessions: 0,
    total_hours: 0,
    avg_current_streak: 0,
    max_longest_streak: 0,
  }, [stats]);

  const totalUsers = safeStats.total_users || 0;
  const disabledUsers = Math.max(totalUsers - (safeStats.active_users || 0), 0);
  const nonAdminUsers = Math.max(totalUsers - (safeStats.admin_users || 0), 0);

  const metricCards = useMemo(() => ([
    {
      label: "Total Users",
      value: safeStats.total_users,
      caption: `${safeStats.active_users} active`,
      accent: "#0f766e",
    },
    {
      label: "Total Plans",
      value: safeStats.total_plans,
      caption: `Avg ${safeStats.average_completion}% complete`,
      accent: "#0ea5e9",
    },
    {
      label: "Flashcards",
      value: safeStats.total_flashcards,
      caption: `${safeStats.admin_users} admins`,
      accent: "#f59e0b",
    },
    {
      label: "Study Sessions",
      value: safeStats.total_sessions,
      caption: `${safeStats.total_hours} hours`,
      accent: "#ef4444",
    },
    {
      label: "Active Users",
      value: safeStats.active_users,
      caption: `${disabledUsers} disabled`,
      accent: "#10b981",
    },
    {
      label: "Avg Current Streak",
      value: safeStats.avg_current_streak,
      caption: `Max ${safeStats.max_longest_streak}`,
      accent: "#14b8a6",
    },
  ]), [safeStats, disabledUsers]);

  const activityData = useMemo(() => ([
    { name: "Plans", value: safeStats.total_plans },
    { name: "Flashcards", value: safeStats.total_flashcards },
    { name: "Sessions", value: safeStats.total_sessions },
  ]), [safeStats]);

  const userStatusData = useMemo(() => ([
    { name: "Active", value: safeStats.active_users, color: "#0f766e" },
    { name: "Disabled", value: disabledUsers, color: "#94a3b8" },
  ]), [safeStats, disabledUsers]);

  const roleData = useMemo(() => ([
    { name: "Admins", value: safeStats.admin_users, color: "#f59e0b" },
    { name: "Members", value: nonAdminUsers, color: "#0ea5e9" },
  ]), [safeStats, nonAdminUsers]);

  const growthData = useMemo(() => {
    const now = new Date();
    const days = [];
    const dayMap = new Map();

    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      const label = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      const entry = { key, name: label, users: 0 };
      dayMap.set(key, entry);
      days.push(entry);
    }

    users.forEach((user) => {
      if (!user.created_at) return;
      const key = new Date(user.created_at).toISOString().slice(0, 10);
      const entry = dayMap.get(key);
      if (entry) entry.users += 1;
    });

    return days;
  }, [users]);

  const perUserData = useMemo(() => {
    const base = totalUsers || 1;
    return [
      { name: "Plans per user", value: Number((safeStats.total_plans / base).toFixed(2)) },
      { name: "Sessions per user", value: Number((safeStats.total_sessions / base).toFixed(2)) },
      { name: "Flashcards per user", value: Number((safeStats.total_flashcards / base).toFixed(2)) },
    ];
  }, [safeStats, totalUsers]);

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) setLoadingStats(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/admin/stats", {
        headers: authHeaders,
      });
      if (!res.ok) {
        throw new Error("Failed to load admin stats");
      }
      setStats(await res.json());
    } catch (err) {
      setError(err.message || "Failed to load admin stats");
    } finally {
      if (!silent) setLoadingStats(false);
    }
  }, [authHeaders]);

  const fetchUsers = useCallback(async (silent = false) => {
    if (!silent) setLoadingUsers(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: authHeaders,
      });
      if (!res.ok) {
        throw new Error("Failed to load users");
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      if (!silent) setLoadingUsers(false);
    }
  }, [authHeaders]);

  const refreshAll = useCallback(async (silent = false) => {
    await Promise.all([fetchStats(silent), fetchUsers(silent)]);
    setLastUpdated(new Date());
  }, [fetchStats, fetchUsers]);

  // Initial fetch on mount
  useEffect(() => {
    if (token && !initializedRef.current) {
      initializedRef.current = true;
      refreshAll(false);
    }
  }, [token, refreshAll]);

  // Set up interval for auto-refresh
  useEffect(() => {
    if (token) {
      const interval = setInterval(() => refreshAll(true), 30000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [token, refreshAll]);

  const handleToggleActive = async (user) => {
    setBusyUserId(user.id);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      if (!res.ok) {
        throw new Error("Failed to update user status");
      }
      const data = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...data.user } : u)));
    } catch (err) {
      setError(err.message || "Failed to update user status");
    } finally {
      setBusyUserId(null);
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(`Delete user ${user.username}? This cannot be undone.`);
    if (!confirmed) return;

    setBusyUserId(user.id);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${user.id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (!res.ok) {
        throw new Error("Failed to delete user");
      }
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      setError(err.message || "Failed to delete user");
    } finally {
      setBusyUserId(null);
    }
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleExport = async (format) => {
    setExporting(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/admin/export", {
        headers: authHeaders,
      });
      if (!res.ok) {
        throw new Error("Failed to export data");
      }
      const data = await res.json();

      if (format === "json") {
        downloadFile(JSON.stringify(data, null, 2), "admin_export.json", "application/json");
      } else {
        const headers = [
          "id",
          "username",
          "email",
          "is_admin",
          "is_active",
          "created_at",
        ];
        const rows = (data.users || []).map((u) => [
          u.id,
          u.username,
          u.email,
          u.is_admin,
          u.is_active,
          u.created_at,
        ]);
        const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
        downloadFile(csv, "admin_users.csv", "text/csv");
      }
    } catch (err) {
      setError(err.message || "Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box className="admin-shell">
      <Box className="admin-ambient">
        <Box className="admin-orb admin-orb-1" />
        <Box className="admin-orb admin-orb-2" />
        <Box className="admin-orb admin-orb-3" />
        <Box className="admin-grid" />
      </Box>

      <AppBar
        position="sticky"
        elevation={0}
        className="navbar-glow"
        sx={{
          background: "linear-gradient(135deg, #011a11 0%, #052e1c 50%, #053a23 100%)",
          backdropFilter: "blur(28px)",
          borderBottom: "1px solid rgba(52, 211, 153, 0.12)",
          height: 64,
        }}
      >
        <Toolbar sx={{ minHeight: 64, gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexGrow: 1 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: "10px",
              background: "linear-gradient(145deg, #f59e0b 0%, #d97706 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 16px rgba(245, 158, 11, 0.35)",
            }}>
              <DashboardIcon sx={{ color: "#fff", fontSize: 20 }} />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                className="shimmer-text"
                sx={{ fontWeight: 800, fontSize: "1rem", lineHeight: 1.2, fontFamily: '"Outfit", sans-serif' }}
              >
                Admin Panel
              </Typography>
              <Typography sx={{ color: "rgba(251, 191, 36, 0.7)", fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                Command Center
              </Typography>
            </Box>
          </Box>

          <Button
            onClick={onBack}
            startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
            sx={{
              color: "rgba(255,255,255,0.8)", borderRadius: "10px", px: 2,
              fontWeight: 600, fontSize: "0.82rem",
              border: "1px solid rgba(255,255,255,0.1)",
              transition: "all 0.2s ease",
              "&:hover": { background: "rgba(52, 211, 153, 0.12)", borderColor: "rgba(52, 211, 153, 0.3)", color: "#34d399" }
            }}
          >
            Back
          </Button>
          <Button
            onClick={onLogout}
            startIcon={<LogoutIcon sx={{ fontSize: 16 }} />}
            sx={{
              color: "rgba(255,255,255,0.6)", borderRadius: "10px", px: 2,
              fontWeight: 600, fontSize: "0.82rem",
              transition: "all 0.2s ease",
              "&:hover": { background: "rgba(239, 68, 68, 0.1)", color: "#f87171" }
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" className="admin-content" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{
                color: "var(--admin-muted)",
                letterSpacing: "0.2em",
                fontWeight: 600,
              }}
            >
              PLATFORM OVERVIEW
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.025em",
                mb: 1,
                fontSize: { xs: "1.75rem", md: "2.2rem" },
                background: "linear-gradient(135deg, #0b1f24 0%, #0f766e 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Admin Command Center
            </Typography>
            <Typography variant="body1" sx={{ color: "var(--admin-muted)", fontSize: "0.95rem" }}>
              Track user growth, learning activity, and system health in real time.
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
              <Box className="admin-live-dot" />
              <Typography variant="caption" sx={{ color: "var(--admin-muted)" }}>
                Auto-refresh every 30s{lastUpdated ? ` | Last updated ${lastUpdated.toLocaleTimeString()}` : ""}
              </Typography>
            </Box>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button
              variant="contained"
              onClick={() => refreshAll(false)}
              startIcon={<RefreshIcon sx={{ fontSize: 18 }} />}
              sx={{
                background: "linear-gradient(135deg, #0f766e, #0891b2)",
                color: "#fff",
                fontWeight: 700,
                px: 3, borderRadius: "12px",
                boxShadow: "0 6px 20px rgba(15, 118, 110, 0.3)",
                transition: "all 0.25s ease",
                "&:hover": { transform: "translateY(-1px)", boxShadow: "0 8px 28px rgba(15, 118, 110, 0.4)" }
              }}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleExport("json")}
              disabled={exporting}
              startIcon={<FileDownloadIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderColor: "rgba(15, 118, 110, 0.3)",
                color: "#0f766e", fontWeight: 700, px: 2.5, borderRadius: "12px",
                transition: "all 0.2s ease",
                "&:hover": { borderColor: "#0f766e", background: "rgba(15, 118, 110, 0.05)", transform: "translateY(-1px)" }
              }}
            >
              JSON
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleExport("csv")}
              disabled={exporting}
              startIcon={<FileDownloadIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderColor: "rgba(15, 118, 110, 0.3)",
                color: "#0f766e", fontWeight: 700, px: 2.5, borderRadius: "12px",
                transition: "all 0.2s ease",
                "&:hover": { borderColor: "#0f766e", background: "rgba(15, 118, 110, 0.05)", transform: "translateY(-1px)" }
              }}
            >
              CSV
            </Button>
          </Stack>
        </Box>

        {error && (
          <Card sx={{ mb: 2, border: "1px solid #fecaca", background: "#fff" }}>
            <CardContent>
              <Typography color="error">{error}</Typography>
            </CardContent>
          </Card>
        )}

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {metricCards.map((metric) => (
            <Grid item xs={12} sm={6} md={4} key={metric.label}>
              <Card
                className="metric-card"
                sx={{
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.96)",
                  border: "1px solid rgba(15, 23, 42, 0.06)",
                  boxShadow: "0 4px 20px rgba(15, 23, 42, 0.06)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${metric.accent}, ${metric.accent}80)` }} />
                <CardContent sx={{ p: 2.5 }}>
                  <Typography
                    sx={{ color: "#64748b", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase" }}
                  >
                    {metric.label}
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      mt: 1,
                      fontSize: "1.8rem",
                      fontFamily: '"JetBrains Mono", monospace',
                      color: "#0b1f24",
                    }}
                  >
                    {loadingStats ? <CircularProgress size={22} sx={{ color: metric.accent }} /> : metric.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#94a3b8", mt: 1, fontWeight: 500, fontSize: "0.82rem" }}>
                    {metric.caption}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 3,
                background: "rgba(255,255,255,0.94)",
                border: "1px solid rgba(15, 23, 42, 0.08)",
                boxShadow: "var(--admin-shadow)",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Activity Mix
                  </Typography>
                  <Chip label="Live" size="small" sx={{ background: "#e0f2f1", color: "#0f766e" }} />
                </Box>
                <Box sx={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                      <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 12 }} />
                      <YAxis tick={{ fill: "#475569", fontSize: 12 }} />
                      <Tooltip cursor={{ fill: "rgba(15, 118, 110, 0.08)" }} />
                      <Bar dataKey="value" fill="#0f766e" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 3,
                background: "rgba(255,255,255,0.94)",
                border: "1px solid rgba(15, 23, 42, 0.08)",
                boxShadow: "var(--admin-shadow)",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    User Growth (7 days)
                  </Typography>
                  <Chip label="Realtime" size="small" sx={{ background: "#fef3c7", color: "#92400e" }} />
                </Box>
                {growthData.length === 0 ? (
                  <Typography variant="body2" color="textSecondary">
                    Not enough data to show growth yet.
                  </Typography>
                ) : (
                  <Box sx={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={growthData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.4)" />
                        <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 12 }} />
                        <YAxis tick={{ fill: "#475569", fontSize: 12 }} allowDecimals={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="users" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 3,
                background: "rgba(255,255,255,0.94)",
                border: "1px solid rgba(15, 23, 42, 0.08)",
                boxShadow: "var(--admin-shadow)",
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  User Health
                </Typography>
                <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
                  <Box sx={{ flex: 1, height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={userStatusData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={4}
                        >
                          {userStatusData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Stack spacing={1.5}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: "var(--admin-muted)", fontWeight: 600 }}>
                          Admins
                        </Typography>
                        <Typography variant="h5" sx={{ fontFamily: "var(--admin-font-mono)", fontWeight: 700 }}>
                          {roleData[0].value}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: "var(--admin-muted)", fontWeight: 600 }}>
                          Members
                        </Typography>
                        <Typography variant="h5" sx={{ fontFamily: "var(--admin-font-mono)", fontWeight: 700 }}>
                          {roleData[1].value}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: "var(--admin-muted)", fontWeight: 600 }}>
                          Total Hours Logged
                        </Typography>
                        <Typography variant="h5" sx={{ fontFamily: "var(--admin-font-mono)", fontWeight: 700 }}>
                          {safeStats.total_hours}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 3,
                background: "rgba(255,255,255,0.94)",
                border: "1px solid rgba(15, 23, 42, 0.08)",
                boxShadow: "var(--admin-shadow)",
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Engagement per User
                </Typography>
                <Box sx={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={perUserData}
                      layout="vertical"
                      margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
                    >
                      <XAxis type="number" tick={{ fill: "#475569", fontSize: 12 }} />
                      <YAxis dataKey="name" type="category" tick={{ fill: "#475569", fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 6, 6]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card
          sx={{
            borderRadius: 3,
            background: "rgba(255,255,255,0.96)",
            border: "1px solid rgba(15, 23, 42, 0.08)",
            boxShadow: "var(--admin-shadow)",
          }}
        >
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Registered Users
              </Typography>
              <Chip
                label={`${users.length} users`}
                size="small"
                sx={{ background: "#e2e8f0", color: "#0b1f24" }}
              />
            </Box>

            {loadingUsers ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  background: "transparent",
                  maxHeight: 520,
                  borderRadius: 2,
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                }}
              >
                <Table size="small" stickyHeader sx={{ minWidth: 920 }}>
                  <TableHead>
                    <TableRow sx={{ background: "rgba(15, 23, 42, 0.04)" }}>
                      {[
                        "ID",
                        "Username",
                        "Email",
                        "Admin",
                        "Status",
                        "Plans",
                        "Flashcards",
                        "Sessions",
                        "Hours",
                        "Current Streak",
                        "Longest Streak",
                        "Actions",
                      ].map((label) => (
                        <TableCell
                          key={label}
                          sx={{
                            fontSize: 11,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: "#64748b",
                            fontWeight: 600,
                            borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
                          }}
                        >
                          {label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow
                        key={user.id}
                        sx={{
                          "&:hover": { background: "rgba(14, 165, 233, 0.06)" },
                        }}
                      >
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.is_admin ? (
                            <Chip label="Admin" size="small" sx={{ background: "#fef3c7", color: "#92400e" }} />
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {user.is_active ? (
                            <Chip label="Active" size="small" sx={{ background: "#dcfce7", color: "#166534" }} />
                          ) : (
                            <Chip label="Disabled" size="small" sx={{ background: "#e2e8f0", color: "#475569" }} />
                          )}
                        </TableCell>
                        <TableCell>{user.plans_count || 0}</TableCell>
                        <TableCell>{user.flashcards_count || 0}</TableCell>
                        <TableCell>{user.sessions_count || 0}</TableCell>
                        <TableCell>{user.total_hours || 0}</TableCell>
                        <TableCell>{user.current_streak || 0}</TableCell>
                        <TableCell>{user.longest_streak || 0}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleToggleActive(user)}
                              disabled={busyUserId === user.id}
                              sx={{ textTransform: "none" }}
                            >
                              {user.is_active ? "Disable" : "Enable"}
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => handleDeleteUser(user)}
                              disabled={busyUserId === user.id}
                              sx={{ textTransform: "none" }}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
