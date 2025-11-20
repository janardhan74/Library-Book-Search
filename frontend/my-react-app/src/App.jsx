import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import "./App.css";

const initialFormValues = {
  q: "",
  author: "",
  year: "",
  category: "",
};

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const booksEndpoint = apiBaseUrl ? `${apiBaseUrl}/books` : "/books";

function App() {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setHasSearched(true);

    const params = new URLSearchParams();
    Object.entries(formValues).forEach(([key, value]) => {
      const trimmed = value.trim();
      if (trimmed) {
        params.append(key, trimmed);
      }
    });

    try {
      const queryString = params.toString();
      const response = await fetch(
        `${booksEndpoint}${queryString ? `?${queryString}` : ""}`
      );

      if (!response.ok) {
        throw new Error("Unable to search books right now. Please try again.");
      }

      const payload = await response.json();
      const nextBooks = Array.isArray(payload) ? payload : payload?.books ?? [];
      setBooks(nextBooks);
    } catch (err) {
      setError(err.message ?? "Unexpected error occurred.");
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFormValues(initialFormValues);
    setBooks([]);
    setError("");
    setHasSearched(false);
  };

  const renderResults = () => {
    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      );
    }

    if (isLoading) {
      return (
        <Stack alignItems="center" sx={{ mt: 4 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Searching books...
          </Typography>
        </Stack>
      );
    }

    if (!hasSearched) {
      return (
        <Typography variant="body2" color="text.secondary">
          Use the form above to find books by keyword, author, year, or
          category.
        </Typography>
      );
    }

    if (books.length === 0) {
      return (
        <Typography variant="body1" sx={{ mt: 3 }} color="text.secondary">
          No results found.
        </Typography>
      );
    }

    return (
      <Stack spacing={2} sx={{ mt: 3 }}>
        {books.map((book, index) => (
          <Card key={book.id ?? `${book.title ?? "book"}-${index}`}>
            <CardContent>
              <Typography variant="h6" component="h2">
                {book.title ?? "Untitled"}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {book.author ?? "Unknown author"} •{" "}
                {book.year ?? "Year unknown"}
              </Typography>
              {book.description && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {book.description}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Library Book Search
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter any combination of fields below. All fields are optional.
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Keyword"
                name="q"
                value={formValues.q}
                onChange={handleChange}
                placeholder="Title, description, or ISBN"
                fullWidth
              />
              <TextField
                label="Author"
                name="author"
                value={formValues.author}
                onChange={handleChange}
                fullWidth
                helperText="Optional"
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Year"
                  name="year"
                  type="number"
                  value={formValues.year}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ min: 0 }}
                  helperText="Optional"
                />
                <TextField
                  label="Category"
                  name="category"
                  value={formValues.category}
                  onChange={handleChange}
                  fullWidth
                  helperText="Optional"
                />
              </Stack>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="flex-end"
              >
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleClear}
                  disabled={isLoading}
                >
                  Clear
                </Button>
                <Button type="submit" variant="contained" disabled={isLoading}>
                  {isLoading ? "Searching..." : "Search"}
                </Button>
              </Stack>
            </Stack>
          </Box>

          <Divider />

          {renderResults()}
        </Stack>
      </Paper>
    </Container>
  );
}

export default App;
