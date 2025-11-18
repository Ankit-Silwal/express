import { Router } from "express";
const router = Router();
import { users } from "../utils/constants.mjs";
import {
  validationResult,
  checkSchema,
  matchedData,
} from "express-validator";
import {
  createQueryValidationSchema,
  createUserValidationSchema,
} from "../utils/validationSchemas.mjs";
import { User } from "../mongoose/schemas/user.mjs";
import { resolveIndexByUserId } from "../utils/middlewares.mjs";
import { hashPassword } from "../utils/helpers.mjs";
router.get(
  "/api/users",
  checkSchema(createQueryValidationSchema),
  (req, res) => {
    console.log(req.session);
    console.log(req.session.id);
    req.sessionStore.get(req.session.id, (err, sessionData) => {
      if (err) {
        throw err;
      }
      console.log(sessionData);
    });
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
  }
);
router.post(
  "/api/users",
  checkSchema(createUserValidationSchema),
  async (req, res) => {
    const result = validationResult(req);
    if(!result.isEmpty()){
      return res.send(result.array())
    }
    const data=matchedData(req);
    console.log(data);
    try {
      data.password = await hashPassword(data.password);
    } catch (err) {
      console.log('Password hashing failed:', err);
      return res.status(400).json({ msg: err.message ?? 'Invalid password' });
    }
    console.log(data);
    const newUser = new User(data);
    try {
      const savedUser = await newUser.save();
      return res.status(201).send(savedUser);
    } catch (err) {
      console.log(err);
      return res.sendStatus(400);
    }
  }
);
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
