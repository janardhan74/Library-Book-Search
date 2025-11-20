import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import "./App.css";

const initialSearchValues = {
  q: "",
  author: "",
  year: "",
  category: "",
};

const initialFilterValues = {
  categories: [],
  yearFrom: "",
  yearTo: "",
};

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const booksEndpoint = apiBaseUrl ? `${apiBaseUrl}/books` : "/books";
const categoryOptions = [
  "Artificial Intelligence",
  "Business",
  "Computer Science",
  "Fiction",
  "Finance",
  "Philosophy",
  "Programming",
  "Psychology",
  "Self-Help",
];

function App() {
  const [searchValues, setSearchValues] = useState(initialSearchValues);
  const [filterValues, setFilterValues] = useState(initialFilterValues);
  const [rawBooks, setRawBooks] = useState([]);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearchChange = (event) => {
    const { name, value } = event.target;
    setSearchValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilterValues((prev) => ({
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
    Object.entries(searchValues).forEach(([key, value]) => {
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
      const nextBooks =
        (Array.isArray(payload) ? payload : payload?.books) ?? [];
      setRawBooks(nextBooks);
    } catch (err) {
      setError(err.message ?? "Unexpected error occurred.");
      setRawBooks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSearchValues(initialSearchValues);
    setFilterValues(initialFilterValues);
    setRawBooks([]);
    setBooks([]);
    setError("");
    setHasSearched(false);
  };

  const handleCategoriesChange = (event) => {
    const nextValue =
      typeof event.target.value === "string"
        ? event.target.value.split(",")
        : event.target.value;
    setFilterValues((prev) => ({
      ...prev,
      categories: nextValue,
    }));
  };

  const filteredBooks = useMemo(() => {
    if (!rawBooks.length) {
      return [];
    }

    const parsedFrom = Number(filterValues.yearFrom);
    const parsedTo = Number(filterValues.yearTo);
    const hasYearFrom =
      filterValues.yearFrom !== "" && !Number.isNaN(parsedFrom);
    const hasYearTo = filterValues.yearTo !== "" && !Number.isNaN(parsedTo);
    const selectedCategories = filterValues.categories.map((value) =>
      value.toLowerCase()
    );

    return rawBooks.filter((book) => {
      const bookYear = Number(book.year);
      const matchesCategories =
        selectedCategories.length === 0 ||
        (typeof book.category === "string" &&
          selectedCategories.includes(book.category.toLowerCase()));

      const matchesYearFrom = !hasYearFrom || bookYear >= parsedFrom;
      const matchesYearTo = !hasYearTo || bookYear <= parsedTo;

      return matchesCategories && matchesYearFrom && matchesYearTo;
    });
  }, [rawBooks, filterValues]);

  useEffect(() => {
    setBooks(filteredBooks);
  }, [filteredBooks]);

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
                value={searchValues.q}
                onChange={handleSearchChange}
                placeholder="Title, description, or ISBN"
                fullWidth
              />
              <TextField
                label="Author"
                name="author"
                value={searchValues.author}
                onChange={handleSearchChange}
                fullWidth
                helperText="Optional"
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Year"
                  name="year"
                  type="number"
                  value={searchValues.year}
                  onChange={handleSearchChange}
                  fullWidth
                  inputProps={{ min: 0 }}
                  helperText="Optional"
                />
                <TextField
                  label="Category"
                  name="category"
                  value={searchValues.category}
                  onChange={handleSearchChange}
                  fullWidth
                  helperText="Optional"
                />
              </Stack>
              <Divider flexItem />
              <Typography variant="subtitle1">Filter results</Typography>
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel id="category-filter-label">Categories</InputLabel>
                  <Select
                    labelId="category-filter-label"
                    multiple
                    name="categories"
                    value={filterValues.categories}
                    onChange={handleCategoriesChange}
                    label="Categories"
                    renderValue={(selected) => selected.join(", ")}
                  >
                    {categoryOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        <Checkbox
                          checked={filterValues.categories.includes(option)}
                        />
                        <ListItemText primary={option} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    label="Published from"
                    name="yearFrom"
                    type="number"
                    value={filterValues.yearFrom}
                    onChange={handleFilterChange}
                    fullWidth
                    inputProps={{ min: 0 }}
                    helperText="Optional"
                  />
                  <TextField
                    label="Published to"
                    name="yearTo"
                    type="number"
                    value={filterValues.yearTo}
                    onChange={handleFilterChange}
                    fullWidth
                    inputProps={{ min: 0 }}
                    helperText="Optional"
                  />
                </Stack>
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
