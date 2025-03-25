import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

/* ROUTE IMPORTS */
import dashboardRoutes from "./routes/dashboardRoutes";
import productRoutes from "./routes/productRoutes";
import userRoutes from "./routes/userRoutes";
import expenseRoutes from "./routes/expenseRoutes";

/* CONFIGURATIONS */
dotenv.config();
const app = express();

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));
console.log('Serving static files from:', path.join(__dirname, '../uploads'));


app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));

// Increased payload size limit to accommodate file uploads
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ 
  limit: '100mb', 
  extended: true 
}));

// Log the DATABASE_URL to ensure it is loaded correctly
console.log("Database URL: ", process.env.DATABASE_URL);

// CORS configuration to allow requests from your frontend
app.use(cors({
  origin: "http://localhost:3000", // Allow requests from the frontend URL
  credentials: true // Allow cookies and other credentials to be sent in the requests
}));

/* ROUTES */
app.get("/hello", (req, res) => {
  res.send("Hello world");
});
app.use("/dashboard", dashboardRoutes);
app.use("/products", productRoutes);
app.use("/users", userRoutes);
app.use("/expenses", expenseRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send({
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

/* SERVER */
const port = Number(process.env.PORT) || 8000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});

export default app;
