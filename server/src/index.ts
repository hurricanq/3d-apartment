import express from "express";
import "dotenv/config";
import cors from "cors";

// Routes
import furnitureRoutes from "./routes/furnitureRoutes";

// Configurations
const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.get("/", (_, res) => {
    res.send("This is home route");
});

app.use("/furniture", furnitureRoutes);

// Server
const port = Number(process.env.PORT) || 3002;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});