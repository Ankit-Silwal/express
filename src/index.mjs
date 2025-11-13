import express from 'express';
const PORT=process.env.PORT || 8000;
const app=express();
const users=[
    {id:1,username:"ankit",displayName:"Ankit"},
    {id:2,username:"nandalal",displayName:"Nanadala"},
    {id:3,username:"anish",displayName:"Anish"},
    {id:4,username:"dipson",displayName:"Dipson"},
  ]
app.get('/',(req,res)=>{
  res.status(201).json({msg:"The server has begun yeah bitchhh"})
})

app.get('/api/users',(req,res)=>{
  res.json(users);
})
app.get('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ msg: 'Invalid ID' });
  }

  const user = users.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ msg: 'User not found' });
  }

  return res.status(200).json(user);
});
app.get('/api/products',(req,res)=>{
  res.json([
    {id:123,name:"chicken breast",price:12.99}
  ]);
})
app.listen(PORT,()=>{
  console.log(`The server has begun at PORT number:${PORT}`);
})