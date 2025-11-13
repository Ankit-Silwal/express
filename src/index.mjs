import express from 'express';
const PORT=process.env.PORT || 8000;
const app=express();
const users=[
    {id:1,username:"ankit",displayName:"Ankit"},
    {id:2,username:"nandalal",displayName:"Nanadala"},
    {id:3,username:"anish",displayName:"Anish"},
    {id:4,username:"dipson",displayName:"Dipson"},
    {id:5,username:"safal",displayName:"Safal"},
  {id:6,username:"prabin",displayName:"Prabin"},
  {id:7,username:"visam",displayName:"Visam"},
  ]
app.get('/',(req,res)=>{
  res.status(201).json({msg:"The server has begun yeah bitchhh"})
})

app.get('/api/users', (req, res) => {
  const { filter, value } = req.query;

  // when no filter/value provided -> return all users
  if (!filter && !value) {
    return res.json(users);
  }

  // when both filter and value provided -> filter safely
  if (filter && value) {
    const filtered = users.filter((user)=>user[filter].includes(value));
    return res.json(filtered);
  }

  // if only one of filter/value provided -> bad request
  return res.status(400).json({ msg: 'Both filter and value are required' });
});
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