"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
// Routes
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const templateRoutes_1 = __importDefault(require("./routes/templateRoutes"));
const designRoutes_1 = __importDefault(require("./routes/designRoutes"));
const furnitureRoutes_1 = __importDefault(require("./routes/furnitureRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
// Configurations
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:3000',
    ],
    credentials: true,
}));
// Home route (test)
app.get("/", (_, res) => {
    res.send("This is home route");
});
app.use("/users", userRoutes_1.default);
app.use("/templates", templateRoutes_1.default);
app.use("/designs", designRoutes_1.default);
app.use("/furniture", furnitureRoutes_1.default);
app.use("/categories", categoryRoutes_1.default);
// Server
const port = Number(process.env.PORT) || 3002;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
//# sourceMappingURL=index.js.map