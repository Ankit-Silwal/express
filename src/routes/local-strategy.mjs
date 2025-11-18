import { users } from "../utils/constants.mjs";
import passport from "passport";
import { Strategy } from "passport-local";
import { User } from "../mongoose/schemas/user.mjs";
import { comparePassword } from "../utils/helpers.mjs";
passport.serializeUser((user,done)=>{
  console.log(`Inside  Serialize User`)
  console.log(user);
  done(null,user.id);
});
passport.deserializeUser(async (id,done)=>{
  
  try{
    const findUser=users.findById(id);
    if(!findUser) throw new Error("User want found");
    done(null,findUser);
  }catch(err){
    console.log(`Inside Deserialilzer`)
    done(err,null);
  }
})
export default passport.use(
  new Strategy(async (username,password,done)=>{
    console.log(`username:${username}\npassword:${password}`)
  try{
    const findUser=await User.findOne({username:username});
    if(!findUser) throw new Error("User not found");
  if(!comparePassword(password,findUser.password)) throw new Error("Bad Credentials")
    done(null,findUser);
  } catch (err){
    done(err,null);
  }
  })
)