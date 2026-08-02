import express from "express";
import dotenv from "dotenv";
dotenv.config();
import morgan from "morgan";
import path from "path";
import shopRoutes from "./routes/shopRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import homeRoute from "./routes/homeRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import AppError from "./utils/appError.js";
import globalErrorHandler from "./middleware/globalErrorHandler.js";
const app = express();
import cors from "cors";

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(
  cors({
    origin: "http://localhost:8081",
    credentials: true,
  }),
);

app.use(express.json());
app.use("/images", express.static(path.join(process.cwd(), "data", "images")));

app.use("/api/v1/shop", shopRoutes);
app.use("/api/v1/review", reviewRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/home", homeRoute);
app.use("/api/v1/item", itemRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/search", searchRoutes);

app.use((req, res, next) => {
  return next(
    new AppError(`Cannot find ${req.originalUrl} on this server!`, 404),
  );
});

app.use(globalErrorHandler);

export default app;
