const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// -----------------------------
// MongoDB Connection (Correct for Mongoose v7/v8)
// -----------------------------
mongoose
  .connect("mongodb://127.0.0.1:27017/research_publications")
  .then(() => console.log("✅ MongoDB (Compass) connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// -----------------------------
// Schema + Model
// -----------------------------
const PublicationSchema = new mongoose.Schema({
  title: String,
  authors: String,
  year: String,
  type: String,
  doi: String,
  summary: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Publication = mongoose.model("Publication", PublicationSchema);

// ================================
// APIs
// ================================

// Get All
app.get("/api/publications", async (req, res) => {
  const pubs = await Publication.find().sort({ createdAt: -1 });
  res.json(pubs);
});

// Add Pub
app.post("/api/publications", async (req, res) => {
  try {
    const pub = new Publication(req.body);
    await pub.save();
    res.json({ message: "Publication added", pub });
  } catch (err) {
    res.status(400).json({ error: "Failed to add publication" });
  }
});

// Delete Pub
app.delete("/api/publications/:id", async (req, res) => {
  try {
    await Publication.findByIdAndDelete(req.params.id);
    res.json({ message: "Publication deleted" });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete" });
  }
});

// Import by DOI
app.post("/api/publications/import-doi", async (req, res) => {
  const { doi } = req.body;

  if (!doi) return res.status(400).json({ error: "DOI required" });

  const sample = {
    title: `Imported publication for DOI: ${doi}`,
    authors: "Jane Researcher, John Scholar",
    year: new Date().getFullYear().toString(),
    type: "Journal",
    doi,
    summary: "Auto-generated metadata placeholder.",
  };

  const pub = new Publication(sample);
  await pub.save();

  res.json({ message: "Imported successfully", pub });
});

// -----------------------------
app.listen(5000, () => {
  console.log("🚀 Server running at http://localhost:5000");
});
