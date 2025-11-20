import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import Book from "./models/book.js";
import { connectDatabase } from "./config/database.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SAMPLE_DATA_PATH = path.resolve(__dirname, "../data/books.json");

// GET /books API backed by MongoDB
app.get("/books", async (req, res) => {
  const { q, author, year, category } = req.query;

  const filters = {};

  if (author) {
    filters.author = { $regex: author, $options: "i" };
  }

  if (category) {
    filters.category = { $regex: category, $options: "i" };
  }

  if (year) {
    const parsedYear = Number(year);
    if (!Number.isNaN(parsedYear)) {
      filters.year = parsedYear;
    }
  }

  const orConditions = [];
  if (q) {
    orConditions.push(
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } }
    );
  }

  try {
    const query = orConditions.length
      ? { ...filters, $or: orConditions }
      : filters;

    const books = await Book.find(query).sort({ year: -1 }).lean();

    res.json(books);
  } catch (error) {
    console.error("Failed to fetch books:", error);
    res.status(500).json({ message: "Unable to fetch books right now." });
  }
});

// POST /books/seed - load sample dataset into MongoDB
app.post("/books/seed", async (_req, res) => {
  try {
    const fileContent = await readFile(SAMPLE_DATA_PATH, "utf-8");
    const records = JSON.parse(fileContent);

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        message: "Sample data file is empty or invalid.",
      });
    }

    const sanitizeBook = (book) => {
      const parsedYear =
        book.year === undefined || book.year === null
          ? undefined
          : Number(book.year);

      return {
        ...book,
        year: Number.isFinite(parsedYear) ? parsedYear : undefined,
      };
    };

    await Book.deleteMany({});
    const inserted = await Book.insertMany(
      records.map((record) => sanitizeBook(record)),
      { ordered: false }
    );

    res.status(201).json({
      message: "Sample books inserted successfully.",
      count: inserted.length,
    });
  } catch (error) {
    console.error("Failed to seed books:", error);
    res.status(500).json({
      message: "Unable to seed books at the moment.",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;

const bootstrap = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
};

bootstrap();
