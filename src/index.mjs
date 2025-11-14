import express from "express";
import routes from "./routes/users.mjs";
const PORT = process.env.PORT || 8000;
const app = express();
app.use(express.json());
app.use(routes);
app.listen(PORT, () => {
  console.log(`The server has begun at PORT number:${PORT}`);
});
app.get("/", (req, res) => {
  res.status(201).json({ msg: "The server has begun yeah bitchhh" });
});

