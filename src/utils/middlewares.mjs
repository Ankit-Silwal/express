import { users } from './constants.mjs';

export const resolveIndexByUserId = (req, res, next) => {
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