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
    <Card sx={{ mb: 3, boxShadow: 2, borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          🔍 Search & Filter Plans
        </Typography>

        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Search by subject"
            placeholder="e.g., DSA, Python, Web Dev"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />

          <FormControl fullWidth>
            <InputLabel>Level</InputLabel>
            <Select
              value={level}
              label="Level"
              onChange={(e) => setLevel(e.target.value)}
            >
              <MenuItem value="">All Levels</MenuItem>
              <MenuItem value="Beginner">Beginner</MenuItem>
              <MenuItem value="Intermediate">Intermediate</MenuItem>
              <MenuItem value="Advanced">Advanced</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Min. Completion %</InputLabel>
            <Select
              value={minCompletion}
              label="Min. Completion %"
              onChange={(e) => setMinCompletion(e.target.value)}
            >
              <MenuItem value={0}>All (0%+)</MenuItem>
              <MenuItem value={25}>Started (25%+)</MenuItem>
              <MenuItem value={50}>Halfway (50%+)</MenuItem>
              <MenuItem value={75}>Nearly Done (75%+)</MenuItem>
              <MenuItem value={100}>Completed (100%)</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleSearch}
              startIcon={<SearchIcon />}
            >
              Search
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              onClick={handleClear}
            >
              Clear
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default SearchFilter;
