import express from "express";
import routes from "./routes/index.mjs";
import cookieParser from "cookie-parser";
const PORT = process.env.PORT || 8000;
const app = express();
app.use(express.json());
app.use(cookieParser('helloworld'));
app.use(routes);
app.listen(PORT, () => {
  console.log(`The server has begun at PORT number:${PORT}`);
});
app.get("/", (req, res) => {
  res.cookie('hello','world',{maxAge:30000,signed:true})
  res.status(201).json({ msg: "The server has begun yeah bitchhh" });
});

