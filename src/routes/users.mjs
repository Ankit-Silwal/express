import { Router } from 'express';
import { validationResult, checkSchema, matchedData } from 'express-validator';
import { createQueryValidationSchema, createUserValidationSchema } from '../utils/validationSchemas.mjs';
import { User } from '../mongoose/schemas/user.mjs';
import { hashPassword } from '../utils/helpers.mjs';

const router = Router();

// GET /api/users
router.get('/api/users', checkSchema(createQueryValidationSchema), async (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) return res.status(400).json({ errors: result.array() });

  const { filter, value } = req.query;
  try {
    if (!filter && !value) {
      const all = await User.find({}, { password: 0 }).lean();
      return res.json(all);
    }

    if (filter && value) {
      const query = { [filter]: { $regex: String(value), $options: 'i' } };
      const filtered = await User.find(query, { password: 0 }).lean();
      return res.json(filtered);
    }

    return res.status(400).json({ msg: 'Both filter and value are required' });
  } catch (err) {
    console.error('Error fetching users:', err);
    return res.sendStatus(500);
  }
});

// POST /api/users
router.post('/api/users', checkSchema(createUserValidationSchema), async (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) return res.status(400).json({ errors: result.array() });

  const data = matchedData(req);
  try {
    data.password = hashPassword(data.password);
  } catch (err) {
    console.error('Password hashing failed:', err);
    return res.status(400).json({ msg: err.message ?? 'Invalid password' });
  }

  try {
    const newUser = new User(data);
    const savedUser = await newUser.save();
    const out = savedUser.toObject();
    delete out.password;
    return res.status(201).json(out);
  } catch (err) {
    console.error('Error creating user:', err);
    return res.sendStatus(400);
  }
});

// PUT /api/users/:id (replace)
router.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { body } = req;
  try {
    const update = {};
    if (body.username) update.username = body.username;
    if (body.displayName) update.displayName = body.displayName;
    if (body.password) update.password = hashPassword(body.password);

    const updated = await User.findByIdAndUpdate(id, update, { new: true, runValidators: true, projection: { password: 0 } });
    if (!updated) return res.status(404).json({ msg: 'User not found' });
    return res.status(200).json(updated);
  } catch (err) {
    console.error('PUT /api/users/:id error:', err);
    return res.sendStatus(500);
  }
});

// PATCH /api/users/:id (partial)
router.patch('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { body } = req;
  try {
    const update = { ...body };
    if (update.password) update.password = hashPassword(update.password);
    const updated = await User.findByIdAndUpdate(id, update, { new: true, runValidators: true, projection: { password: 0 } });
    if (!updated) return res.status(404).json({ msg: 'User not found' });
    return res.status(200).json(updated);
  } catch (err) {
    console.error('PATCH /api/users/:id error:', err);
    return res.sendStatus(500);
  }
});

// DELETE /api/users/:id
router.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ msg: 'User not found' });
    return res.sendStatus(200);
  } catch (err) {
    console.error('DELETE /api/users/:id error:', err);
    return res.sendStatus(500);
  }
});

// GET /api/users/:id
router.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id, { password: 0 }).lean();
    if (!user) return res.status(404).json({ msg: 'User not found' });
    return res.status(200).json(user);
  } catch (err) {
    console.error('GET /api/users/:id error:', err);
    return res.status(400).json({ msg: 'Invalid ID or request' });
  }
});

export default router;
