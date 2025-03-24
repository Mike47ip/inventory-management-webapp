import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
/* ROUTE IMPORTS */
import dashboardRoutes from "./routes/dashboardRoutes";
import productRoutes from "./routes/productRoutes";
import userRoutes from "./routes/userRoutes";
import expenseRoutes from "./routes/expenseRoutes";

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));

// Set the payload size limit to 10MB for JSON and URL-encoded data
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

/* CONFIGURATIONS */
dotenv.config(); // Load environment variables from .env file

// Log the DATABASE_URL to ensure it is loaded correctly
console.log("Database URL: ", process.env.DATABASE_URL);


// CORS configuration to allow requests from your frontend (localhost:3000)
app.use(cors({
  origin: "http://localhost:3000", // Allow requests from the frontend URL
  credentials: true // Allow cookies and other credentials to be sent in the requests
}));


/* ROUTES */
app.get("/hello", (req, res) => {
  res.send("Hello world");
});
app.use("/dashboard", dashboardRoutes); // http://localhost:8000/dashboard
app.use("/products", productRoutes);    // http://localhost:8000/products
app.use("/users", userRoutes);          // http://localhost:8000/users
app.use("/expenses", expenseRoutes);    // http://localhost:8000/expenses

/* SERVER */
const port = Number(process.env.PORT) || 8000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
