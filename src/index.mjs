import express, { response } from "express";
import routes from "./routes/index.mjs";
import cookieParser from "cookie-parser";
import session from "express-session";
import { users } from "./utils/constants.mjs";
import passport from "passport";
import './strategies/local-strategy.mjs'
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
app.use(passport.initialize());
app.use(passport.session());

app.use(routes);
app.post('/api/auth',passport.authenticate('local'),(req,res)=>{
  res.send(200);
})
app.listen(PORT, () => {
  console.log(`The server has begun at PORT number:${PORT}`);
});

app.get("/", (req, res) => {
  console.log(req.session);
  console.log(req.sessionID);
  req.session.visited=true;
  res.cookie('hello','world',{maxAge:30000,signed:true})
  res.status(201).json({ msg: "The server has begun yeah bitchhh" });
});

app.post('/api/auth',(req,res)=>{
  const {body:{
    username,password
  }}=req;
  const findUser=users.find(
    user=> user.username===username
  );
  if(!findUser || findUser.password!==password){
    return res.status(401).send({msg:"Bad Credentials"})
  }
  req.session.user = findUser;
  return res.status(200).send(findUser);
})
app.get('/api/auth/status',(req,res)=>{
  console.log(`Inside auth status endpoint`)
  console.log(req.user);
  console.log(req.session);
  return req.user?res.send(req.user):res.sendStatus(401);
})
app.get('/api/auth/status',(req,res)=>{
  req.sessionStore.get(req.sessionID,(err,session)=>{
    if(err){
      throw err;  
    }
    console.log(session);
  })
  return req.session.user
  ?res.status(200).send(req.session.user)
  :res.status(401).send({msg:"Not authenticated"})
})
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
app.post('api/auth/logouot',(req,res)=>{
  if(!req.user) return res.sendStatus(401);
  req.logout((err)=>{
    res.sendStatus(400);
  })
  res.sendStatus(200)
})
app.get('/api/cart',(req,res)=>{
  if(!req.session.user) return res.sendStatus(401);
    return res.send(req.session.cart??[]);
})