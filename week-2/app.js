import express from "express";
import routes from "./routes/index.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/", routes);

// Add a friendly root route
app.get("/", (req, res) => {
  res.send("Welcome to the Contacts API! Use /contacts to get all contacts or /contacts/:id to get a single contact.");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});