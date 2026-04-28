import React, { useState } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const SearchFilter = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [level, setLevel] = useState("");
  const [minCompletion, setMinCompletion] = useState(0);

  const handleSearch = () => {
    onSearch({
      q: searchQuery,
      level: level,
      min_completion: minCompletion,
    });
  };

  const handleClear = () => {
    setSearchQuery("");
    setLevel("");
    setMinCompletion(0);
    onSearch({ q: "", level: "", min_completion: 0 });
  };

  return (
    <Card sx={{ 
      mb: 3, 
      boxShadow: "0 8px 24px rgba(15, 118, 110, 0.12)",
      borderRadius: 4, 
      border: "1px solid rgba(15, 118, 110, 0.1)",
      background: "linear-gradient(135deg, rgba(240, 249, 255, 0.5) 0%, rgba(240, 253, 244, 0.5) 100%)",
      backdropFilter: "blur(8px)",
    }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ 
          mb: 3, 
          fontWeight: 800, 
          background: "linear-gradient(90deg, #0F766E, #06B6D4)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontSize: "1.1rem",
          letterSpacing: "0.5px"
        }}>
          🔍 Search & Filter Plans
        </Typography>

        <Stack spacing={2.5}>
          <TextField
            fullWidth
            label="Search by subject"
            placeholder="e.g., DSA, Python, Web Dev"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.9)",
                transition: "all 0.3s ease",
                "& fieldset": {
                  borderColor: "#CBD5E1",
                  borderWidth: "1px",
                },
                "&:hover fieldset": {
                  borderColor: "#06B6D4",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#0F766E",
                  borderWidth: "2px",
                  boxShadow: "0 0 0 3px rgba(15, 118, 110, 0.1)",
                },
                "&.Mui-focused": {
                  background: "rgba(240, 249, 255, 0.5)",
                }
              },
              "& .MuiInputBase-input::placeholder": {
                color: "#94A3B8",
                opacity: 0.7,
              }
            }}
          />

          <FormControl fullWidth>
            <InputLabel sx={{ fontWeight: 600 }}>Level</InputLabel>
            <Select
              value={level}
              label="Level"
              onChange={(e) => setLevel(e.target.value)}
              sx={{
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.9)",
                transition: "all 0.3s ease",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#CBD5E1",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#06B6D4",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#0F766E",
                  borderWidth: "2px",
                  boxShadow: "0 0 0 3px rgba(15, 118, 110, 0.1)",
                },
                "&.Mui-focused": {
                  background: "rgba(240, 249, 255, 0.5)",
                }
              }}
            >
              <MenuItem value="">All Levels</MenuItem>
              <MenuItem value="Beginner">🌱 Beginner</MenuItem>
              <MenuItem value="Intermediate">🌿 Intermediate</MenuItem>
              <MenuItem value="Advanced">🚀 Advanced</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel sx={{ fontWeight: 600 }}>Min. Completion %</InputLabel>
            <Select
              value={minCompletion}
              label="Min. Completion %"
              onChange={(e) => setMinCompletion(e.target.value)}
              sx={{
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.9)",
                transition: "all 0.3s ease",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#CBD5E1",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#06B6D4",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#0F766E",
                  borderWidth: "2px",
                  boxShadow: "0 0 0 3px rgba(15, 118, 110, 0.1)",
                },
                "&.Mui-focused": {
                  background: "rgba(240, 249, 255, 0.5)",
                }
              }}
            >
              <MenuItem value={0}>All (0%+)</MenuItem>
              <MenuItem value={25}>Started (25%+)</MenuItem>
              <MenuItem value={50}>Halfway (50%+)</MenuItem>
              <MenuItem value={75}>Nearly Done (75%+)</MenuItem>
              <MenuItem value={100}>Completed (100%)</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              startIcon={<SearchIcon />}
              sx={{
                background: "linear-gradient(90deg, #0F766E, #06B6D4)",
                color: "white",
                fontWeight: 700,
                borderRadius: "10px",
                padding: "10px 20px",
                textTransform: "none",
                fontSize: "1rem",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(15, 118, 110, 0.25)",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(15, 118, 110, 0.35)",
                  background: "linear-gradient(90deg, #0D6B62, #04A5C1)",
                }
              }}
            >
              🔍 Search
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleClear}
              sx={{
                borderColor: "#06B6D4",
                color: "#0F766E",
                fontWeight: 700,
                borderRadius: "10px",
                padding: "10px 20px",
                textTransform: "none",
                fontSize: "1rem",
                transition: "all 0.3s ease",
                border: "2px solid #06B6D4",
                "&:hover": {
                  background: "rgba(6, 182, 212, 0.08)",
                  borderColor: "#0F766E",
                  transform: "translateY(-2px)",
                }
              }}
            >
              ✨ Clear
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default SearchFilter;
