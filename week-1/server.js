import express from "express";
import router from "./routes/index.js";

const app = express();
app.use(express.json());
app.use("/", router);

// Use Render's PORT when deployed
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

