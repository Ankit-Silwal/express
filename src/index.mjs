import express, { response } from "express";
import routes from "./routes/index.mjs";
import cookieParser from "cookie-parser";
import session from "express-session";
// users array not used when DB enabled; keep constants file for other modules
import mongoose from 'mongoose';
import { User } from './mongoose/schemas/user.mjs';
// keep auth simple but back it with MongoDB `User` model when available
const PORT = process.env.PORT || 8000;
const app = express();
app.use(express.json());
app.use(cookieParser('helloworld'));
app.use(session({
  secret:"ankit the dev",
  saveUninitialized:false,
  resave:false,
  cookie:{
    maxAge:60000*60,
  }
}));
// connect to MongoDB (use MONGODB_URI env var if set)
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/expressdb';

// mount routes (they don't depend on DB)
app.use(routes);

async function start() {
  try {
    // connect to DB (if Mongo not running this will throw)
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // ensure at least one test user exists for local testing
    const seedUser = { username: 'ankit', password: 'ankit123', displayName: 'Ankit' };
    const existing = await User.findOne({ username: seedUser.username }).lean();
    if (!existing) {
      await User.create(seedUser);
      console.log('Seeded test user:', seedUser.username);
    }

    app.listen(PORT, () => {
      console.log(`The server has begun at PORT number:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start app (DB connection error):', err.message || err);
    console.error('If you do not want a DB, remove mongoose/User usage and run without MongoDB.');
    process.exit(1);
  }
}

start();

app.get("/", (req, res) => {
  console.log(req.session);
  console.log(req.sessionID);
  req.session.visited=true;
  res.cookie('hello','world',{maxAge:30000,signed:true})
  res.status(201).json({ msg: "The server has begun yeah bitchhh" });
});

app.post('/api/auth', async (req, res) => {
  const { body: { username, password } } = req;
  try {

    const dbUser = await User.findOne({ username }).lean();
    if (!dbUser) return res.status(401).send({ msg: 'Bad Credentials' });
    if (dbUser.password !== password) return res.status(401).send({ msg: 'Bad Credentials' });
    req.session.user = { id: dbUser._id.toString(), username: dbUser.username, displayName: dbUser.displayName };
    return res.status(200).send(req.session.user);
  } catch (err) {
    console.error('Auth error:', err);
    return res.sendStatus(500);
  }
});

app.get('/api/auth/status', (req, res) => {
  if (req.session?.user) {
    return res.status(200).send(req.session.user);
  }
  return res.status(401).send({ msg: 'Not authenticated' });
});
app.post('/api/cart',(req,res)=>{
  if(!req.session.user) return res.sendStatus(401);
  const {body:item}=req;
  const {cart}=req.session;
  if(cart){
    cart.push(item);
  }else{
    req.session.cart=[item];
  }
  return res.status(201).send(item);
})
app.post('/api/auth/logout', (req, res) => {
  if (!req.session?.user) return res.sendStatus(401);
  req.session.destroy((err) => {
    if (err) return res.sendStatus(500);
    res.clearCookie('connect.sid');
    return res.sendStatus(200);
  });
});
app.get('/api/cart', (req, res) => {
  if (!req.session?.user) return res.sendStatus(401);
  return res.send(req.session.cart ?? []);
});