import express, { response } from "express";
import routes from "./routes/index.mjs";
import cookieParser from "cookie-parser";
import session from "express-session";
import './strategies/discord-strategy.mjs'
import passport from "passport";
import mongoose from 'mongoose';
import MongoStore from "connect-mongo";
import { User } from './mongoose/schemas/user.mjs';
import { DiscordUser } from './mongoose/schemas/discord-user.mjs';
import bcrypt from 'bcrypt';
import { hashPassword } from './utils/helpers.mjs';
const PORT = process.env.PORT || 8000;
const app = express();
mongoose.connect('mongodb://localhost/express')
.then(()=>console.log("connected to the database"))
.catch((err)=>console.log(`Error:${err}`))
app.use(express.json());
app.use(cookieParser('helloworld'));
app.use(session({
  secret:"ankit the dev",
  saveUninitialized:false,
  resave:false,
  cookie:{
    maxAge:60000*60,
  },
  store:MongoStore.create({
    client:mongoose.connection.getClient(),
  })
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  try{
    const id = user?._id?.toString?.() ?? user?.id ?? user;
    done(null, id);
  }catch(err){
    done(err,null);
  }
});
passport.deserializeUser(async (id, done) => {
  try{
    let found = null;
    if (!id) return done(null, null);
    found = await DiscordUser.findById(id).lean();
    if(!found) found = await User.findById(id).lean();
    done(null, found);
  }catch(err){
    done(err,null);
  }
});

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/expressdb';
app.use(routes);

app.get("/", (req, res) => {
  console.log(req.session);
  console.log(req.sessionID);
  req.session.visited=true;
  res.cookie('hello','world',{maxAge:30000,signed:true})
  res.status(201).json({ msg: "The server has begun yeah bitchhh" });
});

app.post('/api/auth', async (req, res) => {
  const { body: { username, password } } = req;
  if (!username || !password) return res.status(400).send({ msg: 'username and password required' });
  try {
    const dbUser = await User.findOne({ username }).lean();
    if (!dbUser) return res.status(401).send({ msg: 'Bad Credentials' });
    const match = bcrypt.compareSync(password, dbUser.password);
    if (!match) return res.status(401).send({ msg: 'Bad Credentials' });
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
app.get('/api/auth/discord', passport.authenticate("discord"));
app.get('/api/auth/discord/redirect',
  passport.authenticate('discord', { failureRedirect: '/api/auth/discord/failure' }),
  (req, res) => {
    // Successful authentication, `req.user` should be set by passport
    return res.status(200).json({ msg: 'You are authorized!', user: req.user });
  }
);
app.get('/api/auth/discord/failure', (req, res) => {
  return res.status(401).json({ msg: 'Discord authentication failed' });
});
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

app.listen(8000, () => {
  console.log('Server listening on port 8000');
});

