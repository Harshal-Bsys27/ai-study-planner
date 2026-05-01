import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Card,
  CardContent,
  LinearProgress,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";

const ExportPlan = ({ plan, analytics, onExport }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState("json");
  const [isExporting, setIsExporting] = useState(false);

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const buildPrintHtml = (data) => {
    const planData = data.plan || {};
    const analyticsData = data.analytics || {};

    const summaryRows = [
      ["Subject", planData.subject],
      ["Level", planData.level],
      ["Days", planData.days],
      ["Hours per day", planData.hours_per_day],
      ["Total hours", planData.total_hours],
      ["Completion", `${planData.completion_percentage ?? 0}%`],
      ["Created", planData.created_at],
    ];

    const analyticsRows = [
      ["Completion", `${analyticsData.completion_percentage ?? planData.completion_percentage ?? "n/a"}%`],
      ["Total sessions", analyticsData.total_sessions ?? "n/a"],
      ["Total hours", analyticsData.total_hours ?? "n/a"],
    ];

    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Study Plan Export</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 32px; color: #0f172a; }
      h1 { margin: 0 0 8px; font-size: 22px; }
      h2 { margin: 24px 0 8px; font-size: 16px; color: #0f766e; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; }
      th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
      th { background: #f8fafc; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; }
      .note { margin-top: 12px; font-size: 12px; color: #64748b; }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(planData.subject || "Study Plan")}</h1>
    <div class="note">Exported on ${escapeHtml(new Date().toLocaleString())}</div>

    <h2>Plan Summary</h2>
    <table>
      <thead>
        <tr><th>Field</th><th>Value</th></tr>
      </thead>
      <tbody>
        ${summaryRows.map(([label, value]) => `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`).join("")}
      </tbody>
    </table>

    <h2>Analytics</h2>
    <table>
      <thead>
        <tr><th>Metric</th><th>Value</th></tr>
      </thead>
      <tbody>
        ${analyticsRows.map(([label, value]) => `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`).join("")}
      </tbody>
    </table>
  </body>
</html>`;
  };

  const printPdf = (data) => {
    const html = buildPrintHtml(data);
    const win = window.open("", "_blank", "noopener,noreferrer");
    if (!win) {
      console.error("Popup blocked. Allow popups to print the PDF.");
      return;
    }

    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const downloadFile = (data, filename, format) => {
    let content, type;

    if (format === "json") {
      content = JSON.stringify(data, null, 2);
      type = "application/json";
      filename = `${plan.subject}_plan.json`;
    } else if (format === "csv") {
      // Convert to CSV
      const headers = [
        "Topic",
        "Day",
        "Completed",
        "Time Spent (mins)",
        "Status",
      ];
      const rows = (data.progress || []).map((p) => [
        p.topic,
        p.day,
        p.completed ? "Yes" : "No",
        p.time_spent_minutes || 0,
        p.completed ? "✅" : "⏳",
      ]);

      content = [headers, ...rows].map((row) => row.join(",")).join("\n");
      type = "text/csv";
      filename = `${plan.subject}_plan.csv`;
    } else if (format === "pdf") {
      printPdf(data);
      return;
    }

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

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const exportData = {
        plan: {
          subject: plan.subject,
          level: plan.level,
          days: plan.days,
          hours_per_day: plan.hours_per_day,
          total_hours: plan.days * plan.hours_per_day,
          completion_percentage: plan.completion_percentage,
          created_at: plan.created_at,
        },
        analytics: analytics,
      };

      downloadFile(exportData, `${plan.subject}_plan.${exportFormat}`, exportFormat);

      if (onExport) {
        await onExport(exportFormat);
      }

      setOpenDialog(false);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<FileDownloadIcon />}
        onClick={() => setOpenDialog(true)}
        fullWidth
      >
        📥 Export Plan
      </Button>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Study Plan</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Typography variant="body2" color="textSecondary">
              Download your study plan with all progress and analytics data.
            </Typography>

            <Card sx={{ backgroundColor: "#F0F9FF", border: "1px solid #0EA5E9" }}>
              <CardContent>
                <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
                  📊 Export Includes:
                </Typography>
                <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14 }}>
                  <li>Plan details (subject, level, duration)</li>
                  <li>Progress tracking by topic</li>
                  <li>Time spent on each topic</li>
                  <li>Study analytics and statistics</li>
                </ul>
              </CardContent>
            </Card>

            <FormControl fullWidth>
              <InputLabel>Export Format</InputLabel>
              <Select
                value={exportFormat}
                label="Export Format"
                onChange={(e) => setExportFormat(e.target.value)}
              >
                <MenuItem value="json">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    📄 JSON (Complete Data)
                  </Box>
                </MenuItem>
                <MenuItem value="csv">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    📊 CSV (Spreadsheet)
                  </Box>
                </MenuItem>
                <MenuItem value="pdf">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    🖨️ PDF (Print)
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <Typography variant="caption" color="textSecondary">
              💡 Tip: JSON preserves full data. CSV is great for spreadsheets. PDF opens print view.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            variant="contained"
            disabled={isExporting}
            startIcon={
              exportFormat === "csv"
                ? <TableChartIcon />
                : exportFormat === "pdf"
                  ? <PictureAsPdfIcon />
                  : <FileDownloadIcon />
            }
          >
            {isExporting ? "Exporting..." : "Download"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExportPlan;
