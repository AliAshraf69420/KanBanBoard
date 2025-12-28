import express from "express";
import Board from "../models/Board.js";
import { applyAction } from "../services/applyAction.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const action = req.body;

    if (!action || !action.type) {
      return res.status(400).json({ error: "Invalid action format" });
    }

    let board = await Board.findOne();

    if (!board) {
      board = await Board.create({
        lists: {},
        cards: {},
        version: 0,
      });
    }

    if (action.clientVersion !== undefined && action.clientVersion < board.version) {
      return res.status(409).json({
        message: "Version conflict",
        serverVersion: board.version,
        clientVersion: action.clientVersion,
      });
    }

    board = applyAction(board, action);
    await board.save();

    res.json({ success: true, version: board.version });
  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({ error: "Failed to sync action", message: error.message });
  }
});

export default router;
