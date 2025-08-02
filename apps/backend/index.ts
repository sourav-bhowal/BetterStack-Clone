import express, { type Application } from "express";
import cors from "cors";
import websitesRoutes from "./routes/websites.routes.js";
import usersRoutes from "./routes/users.routes.js";

const app: Application = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use("/website", websitesRoutes);
app.use("/user", usersRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
