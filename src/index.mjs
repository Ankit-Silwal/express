import express from "express";
import { query, validationResult, body, matchedData, checkSchema } from "express-validator";
import { createUserValidationSchema } from './utils/validationSchemas.mjs'
const PORT = process.env.PORT || 8000;
const app = express();
const loggingMiddleware = (req, res, next) => {
  console.log(`${req.method}-${req.url}`);
  next();
};
const resolveIndexByUserId = (req, res, next) => {
  const {
    params: { id },
  } = req;
  const parsedId = Number.parseInt(id, 10);
  if (Number.isNaN(parsedId)) return res.sendStatus(400);
  const findUserIndex = users.findIndex((user) => user.id === parsedId);
  if (findUserIndex === -1) return res.sendStatus(404);
  req.findUserIndex = findUserIndex;
  next();
};
const users = [
  { id: 1, username: "ankit", displayName: "Ankit" },
  { id: 2, username: "nandalal", displayName: "Nanadala" },
  { id: 3, username: "anish", displayName: "Anish" },
  { id: 4, username: "dipson", displayName: "Dipson" },
  { id: 5, username: "safal", displayName: "Safal" },
  { id: 6, username: "prabin", displayName: "Prabin" },
  { id: 7, username: "visam", displayName: "Visam" },
];
app.use(express.json());
app.get("/", (req, res) => {
  res.status(201).json({ msg: "The server has begun yeah bitchhh" });
});

app.get(
  "/api/users",
  query("filter")
    .isString()
    .notEmpty()
    .withMessage("Must not be empty")
    .isLength({ min: 3, max: 10 })
    .withMessage("Must be at least 3 to 10 characters"),
  (req, res) => {
    const { filter, value } = req.query;
    const result = validationResult(req);
    console.log(result);
    // when no filter/value provided -> return all users
    if (!filter && !value) {
      return res.json(users);
    }

    // when both filter and value provided -> filter safely
    if (filter && value) {
      const filtered = users.filter((u) =>
        String(u[filter] ?? "").includes(String(value))
      );
      return res.json(filtered);
    }

    // if only one of filter/value provided -> bad request
    return res.status(400).json({ msg: "Both filter and value are required" });
  }
);
app.get("/api/users/:id", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ msg: "Invalid ID" });
  }

  const user = users.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }

  return res.status(200).json(user);
});
app.put("/api/users/:id", resolveIndexByUserId, (req, res) => {
  const { body, findUserIndex } = req;
  users[findUserIndex] = { id: users[findUserIndex].id, ...body };
  return res.status(200).json(users[findUserIndex]);
});
app.patch("/api/users/:id", resolveIndexByUserId, (req, res) => {
  const { body, findUserIndex } = req;
  users[findUserIndex] = { ...users[findUserIndex], ...body };
  return res.status(200).json(users[findUserIndex]);
});
app.post(
  "/api/users"
  ,checkSchema(createUserValidationSchema),
  (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).send({ error: result.array() });
    }
    const data = matchedData(req);
    console.log(data);
    const last = users.at(-1);
    const nextId = last ? last.id + 1 : 1;
    const newUser = { id: nextId, ...data };
    users.push(newUser);
    return res.status(201).send(newUser);
  }
);
app.delete("/api/users/:id", resolveIndexByUserId, (req, res) => {
  const { findUserIndex } = req;
  users.splice(findUserIndex, 1);
  return res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`The server has begun at PORT number:${PORT}`);
});
