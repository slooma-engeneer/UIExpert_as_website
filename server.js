const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000;
const path = require('path')

app.use(express.static(path.join(__dirname, "public")));
app.get('/UIExpert',(req,res)=>{
    res.sendFile(path.join(__dirname,'views','main.html'))
})
app.get('/code',(req,res)=>{
    res.sendFile(path.join(__dirname,'views','code.html'))
})
app.get('/analyze',(req,res)=>{
    res.sendFile(path.join(__dirname,'views','analyze.html'))
})

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});