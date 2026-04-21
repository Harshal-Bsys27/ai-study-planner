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
              </Select>
            </FormControl>

            <Typography variant="caption" color="textSecondary">
              💡 Tip: JSON format preserves all data. CSV is great for spreadsheets!
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
            startIcon={exportFormat === "json" ? <FileDownloadIcon /> : <TableChartIcon />}
          >
            {isExporting ? "Exporting..." : "Download"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExportPlan;
