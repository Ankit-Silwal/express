import { Router} from "express";
const router=Router();
router.get("/api/products",(req,res)=>{
  console.log(req.headers.cookie);
  console.log(req.cookies)
  if(req.signedCookies.hello&&req.signedCookies.hello==='world'){
    return res.send([{
    id:123,
    name:"Chicken Breast",
    price:12.99,
  }]);
  }
  return res.send({msg:"Sorry you need the correct cookie"});
})
export default router;