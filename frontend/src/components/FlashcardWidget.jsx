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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import StorageIcon from "@mui/icons-material/Storage";
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

  // Model switcher state
  const [currentProvider, setCurrentProvider] = useState("groq");
  const [currentModel, setCurrentModel] = useState("llama-3.3-70b-versatile");
  const [showModelDialog, setShowModelDialog] = useState(false);

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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout

      const res = await fetch(`${API_URL}/api/ai/generate-flashcards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ 
          plan_id: planId, 
          topic: aiTopic.trim(), 
          num_cards: aiNumCards,
          provider: currentProvider,
          model: currentModel
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json();
      
      if (res.ok) {
        setAiSuccess(`✅ ${data.message || `Generated ${data.count} flashcards!`}`);
        if (onFlashcardsGenerated) onFlashcardsGenerated(data.flashcards || []);
        setAiTopic("");
        setTimeout(() => { setOpenAiDialog(false); setAiSuccess(""); }, 1800);
      } else {
        const errorMsg = data.error || "AI generation failed";
        setAiError(`❌ ${errorMsg}`);
      }
    } catch (e) {
      if (e.name === 'AbortError') {
        setAiError("Request timeout - AI took too long. Please try again.");
      } else {
        setAiError("Network error: " + e.message);
      }
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
      minHeight: { xs: 380, md: 480 }, // responsive: auto-grows on mobile
      display: "flex",
      flexDirection: "column",
      borderRadius: 3,
      boxShadow: isDarkMode ? "0 4px 12px rgba(34, 197, 94, 0.1)" : "0 4px 12px rgba(0,0,0,0.05)",
      background: isDarkMode ? "rgba(10, 20, 15, 0.8)" : "#ffffff",
    }}>
      <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexShrink: 0 }}>
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

        {/* Model Switcher */}
        <Box sx={{
          mb: 2,
          p: 1.5,
          borderRadius: 2,
          background: isDarkMode ? "rgba(34, 211, 153, 0.1)" : "rgba(16, 185, 129, 0.05)",
          border: isDarkMode ? "1px solid rgba(34, 211, 153, 0.3)" : "1px solid rgba(16, 185, 129, 0.3)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
          flexShrink: 0,
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <StorageIcon sx={{ color: isDarkMode ? "#34d399" : "#10b981", fontSize: "1.2rem" }} />
            <Box>
              <Typography variant="caption" sx={{ color: isDarkMode ? "#cbd5e1" : "#64748b", display: "block" }}>
                AI Provider
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: "bold", color: isDarkMode ? "#34d399" : "#10b981" }}>
                {currentProvider === "groq" ? "⚡ Groq (Active)" : currentProvider === "gemini" ? "🔍 Gemini" : currentProvider}
              </Typography>
            </Box>
          </Box>
          <Button
            size="small"
            startIcon={<StorageIcon />}
            onClick={() => setShowModelDialog(true)}
            sx={{
              textTransform: "none",
              color: isDarkMode ? "#34d399" : "#10b981",
              border: isDarkMode ? "1px solid #34d399" : "1px solid #10b981",
              "&:hover": {
                background: isDarkMode ? "rgba(34, 211, 153, 0.1)" : "rgba(16, 185, 129, 0.1)",
              },
            }}
          >
            Switch Model
          </Button>
        </Box>

        {flashcards.length > 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, minHeight: 0 }}>
            <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 }}>
              <Card
                onClick={() => setIsFlipped(!isFlipped)}
                sx={{
                  width: "100%",
                  height: { xs: 160, sm: 180, md: 200 }, // responsive card height
                  maxHeight: { xs: 160, sm: 180, md: 200 },
                  overflow: "hidden",
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
                <CardContent 
                  sx={{ 
                    textAlign: "center", 
                    width: "100%", 
                    height: "100%",
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    "&:last-child": { pb: 2 } 
                  }}
                >
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5, flexShrink: 0 }}>
                    {isFlipped ? "Answer" : "Question"} — click to flip
                  </Typography>
                  
                  {/* Scrollable container for the main text - strictly limited to 110px */}
                  <Box 
                    sx={{ 
                      height: 110, // Rigorous fixed height for text area
                      maxHeight: 110,
                      display: "flex", 
                      flexDirection: "column",
                      justifyContent: "center",
                      overflowY: "auto",
                      my: 0.5,
                      px: 1,
                      "&::-webkit-scrollbar": { width: "4px" },
                      "&::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.3)", borderRadius: "4px" }
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600, 
                        wordBreak: "break-word", 
                        fontSize: "1.05rem",
                        textAlign: "center",
                        margin: "auto 0" // Centered when short, scrolls from top when long
                      }}
                    >
                      {isFlipped ? currentCard?.answer : currentCard?.question}
                    </Typography>
                  </Box>

                  <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5, display: "block", flexShrink: 0 }}>
                    📌 {currentCard?.topic}
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Navigation buttons anchored at the bottom of this section */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1.5, flexShrink: 0 }}>
              <Button size="small" onClick={handlePrev} disabled={flashcards.length <= 1}>&larr; Prev</Button>
              <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                {currentIndex + 1} / {flashcards.length}
              </Typography>
              <Button size="small" onClick={handleNext} disabled={flashcards.length <= 1}>Next &rarr;</Button>
            </Box>
          </Box>
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
          <Chip label="Powered by Groq" size="small" sx={{ ml: "auto", background: "#ede9fe", color: "#6d28d9", fontWeight: 700 }} />
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Typography variant="body2" color="textSecondary">
              Enter a topic and Groq AI (LLaMA 3.3) will auto-generate flashcard Q&A pairs for you.
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

      {/* Model Switcher Dialog */}
      <Dialog open={showModelDialog} onClose={() => setShowModelDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ background: isDarkMode ? "#051c12" : "#f0fdfa", color: isDarkMode ? "#34d399" : "#10b981", fontWeight: "bold" }}>
          🔄 Switch AI Model
        </DialogTitle>
        <DialogContent sx={{ background: isDarkMode ? "#051c12" : "#f0fdfa", pt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel sx={{ color: isDarkMode ? "#34d399" : "#10b981" }}>AI Provider</InputLabel>
            <Select
              value={currentProvider}
              label="AI Provider"
              onChange={(e) => {
                setCurrentProvider(e.target.value);
                setCurrentModel(e.target.value === "groq" ? "llama-3.3-70b-versatile" : "gemini-2.0-flash");
              }}
              sx={{
                color: isDarkMode ? "#e2e8f0" : "#1e293b",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: isDarkMode ? "#34d399" : "#10b981",
                },
              }}
            >
              <MenuItem value="groq">⚡ Groq — LLaMA 3.3 (Active, 14k req/day free)</MenuItem>
              <MenuItem value="gemini">🔍 Gemini — Flash (Quota may be limited)</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel sx={{ color: isDarkMode ? "#34d399" : "#10b981" }}>Model</InputLabel>
            <Select
              value={currentModel}
              label="Model"
              onChange={(e) => setCurrentModel(e.target.value)}
              sx={{
                color: isDarkMode ? "#e2e8f0" : "#1e293b",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: isDarkMode ? "#34d399" : "#10b981",
                },
              }}
            >
              {currentProvider === "groq" && (
                <>
                  <MenuItem value="llama-3.3-70b-versatile">LLaMA 3.3 70B (Best quality)</MenuItem>
                  <MenuItem value="llama3-8b-8192">LLaMA 3 8B (Fastest)</MenuItem>
                  <MenuItem value="mixtral-8x7b-32768">Mixtral 8x7B (Long context)</MenuItem>
                </>
              )}
              {currentProvider === "gemini" && (
                <MenuItem value="gemini-2.0-flash">Gemini 2.0 Flash</MenuItem>
              )}
            </Select>
          </FormControl>

          <Typography variant="caption" sx={{ display: "block", mt: 2, color: isDarkMode ? "#cbd5e1" : "#64748b" }}>
            💡 <strong>Note:</strong> Provider is set in the backend .env file.
            This selection is saved as your preference only.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ background: isDarkMode ? "#051c12" : "#f0fdfa" }}>
          <Button onClick={() => setShowModelDialog(false)} sx={{ color: isDarkMode ? "#cbd5e1" : "#475569" }}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              localStorage.setItem("ai_model_settings", JSON.stringify({ provider: currentProvider, model: currentModel }));
              setShowModelDialog(false);
            }}
            variant="contained"
            sx={{ background: isDarkMode ? "#34d399" : "#10b981", color: "#051c12", fontWeight: "bold" }}
          >
            Save & Switch
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default FlashcardWidget;
