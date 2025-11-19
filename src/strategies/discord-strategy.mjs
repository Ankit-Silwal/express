import passport from "passport";
import { Strategy } from "passport-discord";
import dotenv from "dotenv";
import { DiscordUser } from "../mongoose/schemas/discord-user.mjs";
dotenv.config();
passport.serializeUser((user,done)=>{
  console.log(`Inside the seriealze User `);
  console.log(user);
  done(null,user.id);
});
passport.deserializeUser(async (id,done)=>{
  try{  
    const findUser=await DiscordUser.findById(id)
    return findUser ? done(null, findUser) : done(null, null)
  }catch(err){
    done(err, null)
  }
})
export default passport.use(
  new Strategy({
    clientID:process.env.clientID,
    clientSecret:process.env.clientSecret,
    callbackURL:process.env.Redirect_URL,
    scope:['identify'],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let findUser = await DiscordUser.findOne({ discordId: profile.id });

      if (!findUser) {
        const newUser = new DiscordUser({ username: profile.username, discordId: profile.id });
        const newSavedUser = await newUser.save();
        return done(null, newSavedUser);
      }

      // Update stored fields when Discord profile changes
      let needsSave = false;
      if (profile.username && findUser.username !== profile.username) {
        findUser.username = profile.username;
        needsSave = true;
      }

      if (needsSave) {
        const updated = await findUser.save();
        return done(null, updated);
      }

      return done(null, findUser);
    } catch (err) {
      console.log(err);
      return done(err, null);
    }
  })
)