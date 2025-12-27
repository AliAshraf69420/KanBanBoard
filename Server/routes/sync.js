import express from "express";
import Board from "../models/Board.js";
import { applyAction } from "../services/applyAction.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const action = req.body;

  let board = await Board.findOne();

  if (!board) {
    board = await Board.create({
      lists: {},
      cards: {},
      version: 0,
    });
  }

  if (action.clientVersion < board.version) {
    return res.status(409).json({
      message: "Version conflict",
      serverVersion: board.version,
    });
  }

  board = applyAction(board, action);
  await board.save();

  res.json({ success: true, version: board.version });
});

export default router;
