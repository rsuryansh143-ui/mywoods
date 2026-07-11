import express from "express";
import Wood from "../models/Wood.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// @desc    Get all woods
// @route   GET /api/woods
// @access  Public
router.get("/", async (req, res) => {
  try {
    const woods = await Wood.find({}).sort({ createdAt: -1 });
    res.json(woods);
  } catch (error) {
    res.status(500).json({ message: "Error fetching woods" });
  }
});

// @desc    Get single wood
// @route   GET /api/woods/:id
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const wood = await Wood.findById(req.params.id);
    if (!wood) {
      return res.status(404).json({ message: "Wood not found" });
    }
    res.json(wood);
  } catch (error) {
    res.status(500).json({ message: "Error fetching wood details" });
  }
});

// @desc    Create a wood
// @route   POST /api/woods
// @access  Private (Admin only conceptually, protected by token here)
router.post("/", protect, async (req, res) => {
  try {
    const wood = await Wood.create(req.body);
    res.status(201).json(wood);
  } catch (error) {
    console.error("Create Wood Error:", error);
    res.status(400).json({ message: "Invalid wood data", error: error.message });
  }
});

// @desc    Update a wood
// @route   PUT /api/woods/:id
// @access  Private
router.put("/:id", protect, async (req, res) => {
  try {
    const wood = await Wood.findById(req.params.id);

    if (!wood) {
      return res.status(404).json({ message: "Wood not found" });
    }

    const updatedWood = await Wood.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(updatedWood);
  } catch (error) {
    res.status(400).json({ message: "Error updating wood", error: error.message });
  }
});

// @desc    Delete a wood
// @route   DELETE /api/woods/:id
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const wood = await Wood.findById(req.params.id);

    if (!wood) {
      return res.status(404).json({ message: "Wood not found" });
    }

    await wood.deleteOne();
    res.json({ message: "Wood removed" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting wood", error: error.message });
  }
});

export default router;
