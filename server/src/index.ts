import express from "express";

// Configurations
const app = express();
app.use(express.json());

// Server
app.listen(3002, () => {
    console.log(`Server running on port 3002`);
});