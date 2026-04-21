import React, { useState } from "react";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import FlipIcon from "@mui/icons-material/FlipToBack";

const FlashcardWidget = ({ planId, flashcards = [], onAddFlashcard, onDeleteFlashcard }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [topic, setTopic] = useState("");

  const handleAddFlashcard = () => {
    if (!question.trim()) {
      alert("Please enter a question");
      return;
    }
    if (!answer.trim()) {
      alert("Please enter an answer");
      return;
    }
    if (!topic.trim()) {
      alert("Please enter a topic");
      return;
    }
    
    onAddFlashcard({
      plan_id: planId,
      question: question.trim(),
      answer: answer.trim(),
      topic: topic.trim(),
    });

    // Clear form
    setQuestion("");
    setAnswer("");
    setTopic("");
    setOpenDialog(false);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const currentCard = flashcards[currentIndex];

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          📇 Flashcards
        </Typography>

        {flashcards.length > 0 ? (
          <Grid container spacing={2} sx={{ mb: 2, flexGrow: 1 }}>
            {/* Main Flashcard Display */}
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
                    ? "linear-gradient(135deg, #10B981 0%, #047857 100%)"
                    : "linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)",
                  color: "white",
                  borderRadius: 3,
                  boxShadow: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ textAlign: "center", width: "100%", p: 2 }}>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                    {isFlipped ? "Answer" : "Question"}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      minHeight: 60,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isFlipped ? currentCard?.answer : currentCard?.question}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                    Topic: {currentCard?.topic}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Navigation */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Button size="small" onClick={handlePrev} disabled={flashcards.length <= 1}>
                  &larr; Prev
                </Button>
                <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                  {currentIndex + 1} / {flashcards.length}
                </Typography>
                <Button size="small" onClick={handleNext} disabled={flashcards.length <= 1}>
                  Next &rarr;
                </Button>
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, textAlign: 'center' }}>
              No flashcards yet. Create one to test your knowledge!
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Add
          </Button>
          {flashcards.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => onDeleteFlashcard(currentCard.id)}
            >
              <DeleteIcon />
            </Button>
          )}
        </Box>
      </CardContent>

      {/* Add Flashcard Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Flashcard</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Topic"
              placeholder="e.g., Binary Search"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              variant="outlined"
              size="small"
            />
            <TextField
              fullWidth
              label="Question"
              placeholder="What is binary search?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              variant="outlined"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Answer"
              placeholder="Binary search is an algorithm that searches a sorted array..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              variant="outlined"
              multiline
              rows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddFlashcard} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default FlashcardWidget;
