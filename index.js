const express = require("express");
const app = express();
var cors = require("cors");
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get("/data", async()=>{
  const myData = req.query;
  console.log(myData)
})

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
