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
import AppError from "./utils/AppError.js";
import globalErrorHandler from "./middleware/globalErrorHandler.js";
import offerRoutes from "./routes/offerRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import meetingPlaceRoutes from "./routes/meetingPlaceRoutes.js";
import cors from "cors";
import helmet from "helmet";
import xss from "xss-clean";
import hpp from "hpp";
import rateLimit from "express-rate-limit";

const app = express();

app.use(helmet());
// app.use(xss());
app.use(hpp());

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use("/api/auth", authLimiter);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(
  cors({
    origin: "http://localhost:8081",
    credentials: true,
  }),
);

app.use(express.json({ type: ["application/json", "application/*+json"] }));
app.use((req, res, next) => {
  const contentType = req.headers["content-type"] || "";

  if (
    contentType.includes("application/json") &&
    typeof req.body === "string"
  ) {
    try {
      req.body = JSON.parse(req.body);
    } catch {}
  }

  next();
});
app.use("/images", express.static(path.join(process.cwd(), "data", "images")));

app.use("/api/v1/shop", shopRoutes);
app.use("/api/v1/review", reviewRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/home", homeRoute);
app.use("/api/v1/item", itemRoutes);
app.use("/api/v1/items", itemRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/offer", offerRoutes);
app.use("/api/v1/offers", offerRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/conversation", conversationRoutes);
app.use("/api/v1/meeting-places", meetingPlaceRoutes);

app.use((req, res, next) => {
  return next(
    new AppError(`Cannot find ${req.originalUrl} on this server!`, 404),
  );
});

app.use(globalErrorHandler);

export default app;
