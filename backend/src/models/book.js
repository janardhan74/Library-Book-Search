import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, trim: true },
    description: { type: String, trim: true },
    year: { type: Number },
    category: { type: String, trim: true },
    isbn: { type: String, trim: true },
    coverImage: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

bookSchema.index({
  title: "text",
  description: "text",
  author: "text",
});

const Book = mongoose.models.Book || mongoose.model("Book", bookSchema);

export default Book;
