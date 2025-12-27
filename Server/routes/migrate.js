import express from "express";
import Board from "../models/Board.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { lists, cards, version } = req.body;

  const existing = await Board.findOne();

  if (existing) {
    return res.status(409).json({
      message: "Board already exists",
    });
  }

  const board = await Board.create({
    lists,
    cards,
    version,
  });

  res.json({
    success: true,
    version: board.version,
  });
});

export default router;
