"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
/* ROUTE IMPORTS */
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const expenseRoutes_1 = __importDefault(require("./routes/expenseRoutes"));
/* CONFIGURATIONS */
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, helmet_1.default)());
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use((0, morgan_1.default)("common"));
// Set the payload size limit to 10MB for JSON and URL-encoded data
app.use(body_parser_1.default.json({ limit: '100mb' }));
app.use(body_parser_1.default.urlencoded({ limit: '100mb', extended: true }));
/* CONFIGURATIONS */
dotenv_1.default.config(); // Load environment variables from .env file
// Log the DATABASE_URL to ensure it is loaded correctly
console.log("Database URL: ", process.env.DATABASE_URL);
// CORS configuration to allow requests from your frontend (localhost:3000)
app.use((0, cors_1.default)({
    origin: "http://localhost:3000", // Allow requests from the frontend URL
    credentials: true // Allow cookies and other credentials to be sent in the requests
}));
/* ROUTES */
app.get("/hello", (req, res) => {
    res.send("Hello world");
});
app.use("/dashboard", dashboardRoutes_1.default); // http://localhost:8000/dashboard
app.use("/products", productRoutes_1.default); // http://localhost:8000/products
app.use("/users", userRoutes_1.default); // http://localhost:8000/users
app.use("/expenses", expenseRoutes_1.default); // http://localhost:8000/expenses
/* SERVER */
const port = Number(process.env.PORT) || 8000;
app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
});
