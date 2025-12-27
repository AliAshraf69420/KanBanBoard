import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import syncRoutes from "./routes/sync.js";
import stateRoutes from "./routes/state.js";
import migrateRoutes from "./routes/migrate.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/sync", syncRoutes);
app.use("/state", stateRoutes);
app.use("/migrate", migrateRoutes);
connectDB();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
