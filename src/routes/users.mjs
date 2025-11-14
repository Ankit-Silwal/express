import {Router} from 'express';
const router=Router();
import { users } from "../utils/constants.mjs"
import {
  validationResult,
  checkSchema,
  matchedData,
} from "express-validator";
import { createQueryValidationSchema,createUserValidationSchema } from '../utils/validationSchemas.mjs'
import { resolveIndexByUserId } from '../utils/middlewares.mjs';
router.get("/api/users",checkSchema(createQueryValidationSchema), (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({ errors: result.array() });
  }

  const { filter, value } = req.query;

  if (!filter && !value) {
    return res.json(users);
  }

  if (filter && value) {
    const filtered = users.filter((u) =>
      String(u[filter] ?? "").includes(String(value))
    );
    return res.json(filtered);
  }

  return res.status(400).json({ msg: "Both filter and value are required" });
});
router.post("/api/users", checkSchema(createUserValidationSchema), (req, res) => {
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
})
router.put("/api/users/:id", resolveIndexByUserId, (req, res) => {
  const { body, findUserIndex } = req;
  users[findUserIndex] = { id: users[findUserIndex].id, ...body };
  return res.status(200).json(users[findUserIndex]);
});
router.patch("/api/users/:id", resolveIndexByUserId, (req, res) => {
  const { body, findUserIndex } = req;
  users[findUserIndex] = { ...users[findUserIndex], ...body };
  return res.status(200).json(users[findUserIndex]);
});
router.delete("/api/users/:id", resolveIndexByUserId, (req, res) => {
  const { findUserIndex } = req;
  users.splice(findUserIndex, 1);
  return res.sendStatus(200);
});
router.get("/api/users/:id", (req, res) => {
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
export default router;