import express from "express";
import Board from "../models/Board.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const board = await Board.findOne();

    if (!board) {
      return res.json({
        exists: false,
        version: 0,
      });
    }

    res.json({
      exists: true,
      version: board.version || 0,
    });
  } catch (error) {
    console.error("Error fetching board state:", error);
    res.status(500).json({ error: "Failed to fetch board state" });
  }
});

export default router;
