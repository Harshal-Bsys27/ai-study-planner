import React, { useState, useContext } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Box,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  CircularProgress,
  Chip,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { ThemeModeContext } from "../theme";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const FlashcardWidget = ({ planId, flashcards = [], onAddFlashcard, onDeleteFlashcard, onFlashcardsGenerated }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAiDialog, setOpenAiDialog] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [topic, setTopic] = useState("");

  // AI generate state
  const [aiTopic, setAiTopic] = useState("");
  const [aiNumCards, setAiNumCards] = useState(5);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiSuccess, setAiSuccess] = useState("");

  const { mode } = useContext(ThemeModeContext);
  const isDarkMode = mode === "dark";

  const getToken = () => localStorage.getItem("token");

  // Manual add
  const handleAddFlashcard = () => {
    if (!question.trim()) { alert("Please enter a question"); return; }
    if (!answer.trim()) { alert("Please enter an answer"); return; }
    if (!topic.trim()) { alert("Please enter a topic"); return; }
    onAddFlashcard({ plan_id: planId, question: question.trim(), answer: answer.trim(), topic: topic.trim() });
    setQuestion(""); setAnswer(""); setTopic("");
    setOpenDialog(false);
  };

  // ✨ AI Generate flashcards
  const handleAiGenerate = async () => {
    if (!aiTopic.trim()) { setAiError("Please enter a topic"); return; }
    if (!planId) { setAiError("No active study plan selected"); return; }

    setAiLoading(true);
    setAiError("");
    setAiSuccess("");

    try {
      const res = await fetch(`${API_URL}/api/ai/generate-flashcards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ plan_id: planId, topic: aiTopic.trim(), num_cards: aiNumCards }),
      });

      const data = await res.json();
      if (res.ok) {
        setAiSuccess(`✅ ${data.message || `Generated ${data.count} flashcards!`}`);
        // Notify parent to refresh flashcards
        if (onFlashcardsGenerated) onFlashcardsGenerated(data.flashcards || []);
        setAiTopic("");
        setTimeout(() => { setOpenAiDialog(false); setAiSuccess(""); }, 1800);
      } else {
        setAiError(data.error || "AI generation failed");
      }
    } catch (e) {
      setAiError("Network error: " + e.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleNext = () => { setIsFlipped(false); setCurrentIndex((prev) => (prev + 1) % flashcards.length); };
  const handlePrev = () => { setIsFlipped(false); setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length); };
  const currentCard = flashcards[currentIndex];

  return (
    <Card sx={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      borderRadius: 3,
      boxShadow: isDarkMode ? "0 4px 12px rgba(34, 197, 94, 0.1)" : "0 4px 12px rgba(0,0,0,0.05)",
      background: isDarkMode ? "rgba(10, 20, 15, 0.8)" : "#ffffff",
    }}>
      <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: isDarkMode ? "#6ee7b7" : "#000" }}>
            📇 Flashcards
          </Typography>
          {flashcards.length > 0 && (
            <Chip
              label={`${flashcards.length} cards`}
              size="small"
              sx={{
                background: isDarkMode ? "rgba(110,231,183,0.15)" : "#f0fdf4",
                color: isDarkMode ? "#6ee7b7" : "#059669",
                fontWeight: 700,
                fontSize: "0.7rem",
              }}
            />
          )}
        </Box>

        {flashcards.length > 0 ? (
          <Grid container spacing={2} sx={{ mb: 2, flexGrow: 1 }}>
            <Grid item xs={12}>
              <Card
                onClick={() => setIsFlipped(!isFlipped)}
                sx={{
                  minHeight: 180,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  background: isFlipped
                    ? isDarkMode
                      ? "linear-gradient(135deg, #065f46 0%, #034e37 100%)"
                      : "linear-gradient(135deg, #10B981 0%, #047857 100%)"
                    : isDarkMode
                      ? "linear-gradient(135deg, #0c4a6e 0%, #0a3c54 100%)"
                      : "linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)",
                  color: "white",
                  borderRadius: 3,
                  boxShadow: isDarkMode
                    ? "0 8px 24px rgba(34, 197, 94, 0.15)"
                    : "0 8px 24px rgba(15, 118, 110, 0.15)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: isDarkMode
                      ? "0 12px 40px rgba(34, 197, 94, 0.2)"
                      : "0 12px 40px rgba(15, 118, 110, 0.25)",
                  },
                }}
              >
                <CardContent sx={{ textAlign: "center", width: "100%", p: 2 }}>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                    {isFlipped ? "Answer" : "Question"} — click to flip
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {isFlipped ? currentCard?.answer : currentCard?.question}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: "block" }}>
                    📌 {currentCard?.topic}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Button size="small" onClick={handlePrev} disabled={flashcards.length <= 1}>&larr; Prev</Button>
                <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                  {currentIndex + 1} / {flashcards.length}
                </Typography>
                <Button size="small" onClick={handleNext} disabled={flashcards.length <= 1}>Next &rarr;</Button>
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, py: 2 }}>
            <Typography sx={{ fontSize: "2rem" }}>📇</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ textAlign: "center" }}>
              No flashcards yet. Add manually or use <strong>✨ AI Generate</strong>!
            </Typography>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ mt: "auto", display: "flex", gap: 1 }}>
          <Tooltip title="Add flashcard manually">
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{ flex: 1 }}
            >
              Add
            </Button>
          </Tooltip>

          <Tooltip title="Auto-generate flashcards using AI (Gemini)">
            <Button
              variant="contained"
              size="small"
              startIcon={<AutoAwesomeIcon />}
              onClick={() => setOpenAiDialog(true)}
              sx={{
                flex: 1,
                background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                "&:hover": { background: "linear-gradient(135deg, #6d28d9 0%, #4338ca 100%)" },
                fontWeight: 700,
                fontSize: "0.75rem",
              }}
            >
              AI Generate
            </Button>
          </Tooltip>

          {flashcards.length > 0 && (
            <Tooltip title="Delete current card">
              <Button variant="outlined" color="error" size="small" onClick={() => onDeleteFlashcard(currentCard.id)}>
                <DeleteIcon fontSize="small" />
              </Button>
            </Tooltip>
          )}
        </Box>
      </CardContent>

      {/* Manual Add Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Flashcard</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField fullWidth label="Topic" placeholder="e.g., Binary Search" value={topic} onChange={(e) => setTopic(e.target.value)} variant="outlined" size="small" />
            <TextField fullWidth label="Question" placeholder="What is binary search?" value={question} onChange={(e) => setQuestion(e.target.value)} variant="outlined" multiline rows={3} />
            <TextField fullWidth label="Answer" placeholder="Binary search is an algorithm..." value={answer} onChange={(e) => setAnswer(e.target.value)} variant="outlined" multiline rows={3} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddFlashcard} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* ✨ AI Generate Dialog */}
      <Dialog open={openAiDialog} onClose={() => { setOpenAiDialog(false); setAiError(""); setAiSuccess(""); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AutoAwesomeIcon sx={{ color: "#7c3aed" }} />
          AI Flashcard Generator
          <Chip label="Powered by Gemini" size="small" sx={{ ml: "auto", background: "#ede9fe", color: "#6d28d9", fontWeight: 700 }} />
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Typography variant="body2" color="textSecondary">
              Enter a topic and Gemini AI will auto-generate flashcard Q&A pairs for you.
            </Typography>
            <TextField
              fullWidth
              label="Topic"
              placeholder="e.g., Binary Search Trees, React Hooks, Gradient Descent..."
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              variant="outlined"
              disabled={aiLoading}
            />
            <TextField
              fullWidth
              label="Number of flashcards"
              type="number"
              value={aiNumCards}
              onChange={(e) => setAiNumCards(Math.min(10, Math.max(1, parseInt(e.target.value) || 5)))}
              inputProps={{ min: 1, max: 10 }}
              variant="outlined"
              size="small"
              disabled={aiLoading}
              helperText="Max 10 cards per generation"
            />
            {aiError && <Typography color="error" variant="body2">❌ {aiError}</Typography>}
            {aiSuccess && <Typography color="success.main" variant="body2">{aiSuccess}</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenAiDialog(false); setAiError(""); setAiSuccess(""); }} disabled={aiLoading}>Cancel</Button>
          <Button
            onClick={handleAiGenerate}
            variant="contained"
            disabled={aiLoading || !aiTopic.trim()}
            startIcon={aiLoading ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
            sx={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)", "&:hover": { background: "linear-gradient(135deg, #6d28d9 0%, #4338ca 100%)" } }}
          >
            {aiLoading ? "Generating..." : "Generate with AI"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default FlashcardWidget;
