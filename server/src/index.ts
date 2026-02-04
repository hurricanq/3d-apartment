import express from "express";
import "dotenv/config";
import cors from "cors";

// Routes
import userRoutes from "./routes/userRoutes";
import templateRoutes from "./routes/templateRoutes";
import designRoutes from "./routes/designRoutes";
import furnitureRoutes from "./routes/furnitureRoutes";
import categoryRoutes from "./routes/categoryRoutes";

// Configurations
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["https://3d-apartment-silk.vercel.app", "http://localhost:3000"],
    credentials: true,
  }),
);

// Home route (test)
app.get("/", (_, res) => {
  res.send("This is home route");
});

app.use("/users", userRoutes);
app.use("/templates", templateRoutes);
app.use("/designs", designRoutes);
app.use("/furniture", furnitureRoutes);
app.use("/categories", categoryRoutes);

// Server
const port = Number(process.env.PORT) || 3002;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
