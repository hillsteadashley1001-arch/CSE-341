import express from "express";
import routes from "./week-2/routes/index.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/", routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});