import express from "express";
import Board from "../models/Board.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const board = await Board.findOne();

  if (!board) {
    return res.json({
      exists: false,
      version: 0,
    });
  }

  res.json({
    exists: true,
    version: board.version,
  });
});

export default router;
