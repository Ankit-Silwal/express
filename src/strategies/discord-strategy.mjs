import passport from "passport";
import { Strategy } from "passport-discord";
import dotenv from "dotenv";
import { DiscordUser } from "../mongoose/schemas/discord-user.mjs";
dotenv.config();
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
  new Strategy({
    clientID:process.env.clientID,
    clientSecret:process.env.clientSecret,
    callbackURL:process.env.Redirect_URL,
    scope:['identify'],
  },
  async (accessToken,refreshToken,profile,done)=>{
    let findUser;
    try{
      findUser=await DiscordUser.findOne({discordId:profile.id});
    }catch(err){
      return done(err,null);
    }
    try{
      if(!findUser){
        const newUser=new DiscordUser({username:profile.username,discordId:profile.id})
        const newSavedUser=await newUser.save();
        return done(null,newSavedUser);
      }
      return done(null,findUser);
    }catch(err){
      console.log(err);
      return done(err,null)
    }
  })
)