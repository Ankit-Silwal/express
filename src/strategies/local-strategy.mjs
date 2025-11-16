import { users } from "../utils/constants.mjs";
import passport from "passport";
import { Strategy } from "passport-local";

passport.serializeUser((user,done)=>{
  console.log(`Inside  Serialize User`)
  console.log(user);
  done(null,user.id);
});
passport.deserializeUser((id,done)=>{
  console.log( `Inside Deserializer`);
  console.log(`Deserializing User ID:${id}`);
  try{
    const findUser=users.find(user=>user.id===id);
    if(!findUser) throw new Error("User want found");
    done(null,findUser);
  }catch(err){
    console.log(`Inside Deserialilzer`)
    done(err,null);
  }
})
export default passport.use(
  new Strategy((username,password,done)=>{
    console.log(`username:${username}\npassword:${password}`)
  try{
    const findUser=users.find((user)=>user.username===username);
    if(!findUser)
      throw new Error("User not found") ;
    if(findUser.password!==password)
      throw new Error("Invalid Credentials");
    done(null,findUser);
  } catch (err){
    done(err,null);
  }
  })
)