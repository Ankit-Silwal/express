import {Router} from "express";
const router=Router();
router.get("/api/products",(req,res)=>{
  res.send([{
    id:123,
    name:"Chicken Breast",
    price:12.99,
  }]);
})
export default router;