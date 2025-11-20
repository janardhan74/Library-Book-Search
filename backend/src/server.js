import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

// Load static books data
const books = JSON.parse(fs.readFileSync("books.json", "utf-8"));

// GET /books API with search + filter
app.get("/books", (req, res) => {
    let { q, author, year, category } = req.query;

    let result = books;

    // Helper for case-insensitive substring match
    const match = (value, keyword) =>
        value.toLowerCase().includes(keyword.toLowerCase());

    // Search by keyword in title & description
    if (q) {
        result = result.filter(
            book =>
                match(book.title, q) ||
                match(book.description, q)
        );
    }

    // Filter by author
    if (author) {
        result = result.filter(book => match(book.author, author));
    }

    // Filter by year (exact match)
    if (year) {
        result = result.filter(book => book.year == year);
    }

    // Filter by category
    if (category) {
        result = result.filter(book => match(book.category, category));
    }

    res.json(result);
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
