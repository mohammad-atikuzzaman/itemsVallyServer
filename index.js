const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
var cors = require("cors");
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const uri =
  "mongodb+srv://itemsVally:akash123@cluster0.tyigyp7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// _____________________________________________________________________

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const db = client.db("itemsVally");
    const itemsCollection = db.collection("itemsCollection");

    //  for adding data to db
    app.post("/items", async (req, res) => {
      const {
        productName,
        productImage,
        brandName,
        description,
        price,
        category,
        // creationTime,
      } = await req.body;

      const data = {
        productName,
        productImage,
        brandName,
        description,
        price: parseInt(price),
        category,
        creationTime: new Date(),
      };

      const result = await itemsCollection.insertOne(data);
      res.send(result);
    });

    app.get("/sort", async (req, res) => {
      const { system } = req.query;

      const queryObj = {};
      if (system === "lowToHigh") {
        const result = await itemsCollection
          .find()
          .sort({ price: 1 })
          .toArray();
        res.send(result);
      }
      if (system === "highToLow") {
        const result = await itemsCollection
          .find()
          .sort({ price: -1 })
          .toArray();
        res.send(result);
      }

      if (system === "latest") {
        const result = await itemsCollection
          .find()
          .sort({ creationTime: -1 })
          .toArray();
        res.send(result);
      }
    });

    app.get("/countNumberOfData", async (req, res) => {
      const { category, brand } = req.query;
      let query = {};

      if (category) {
        query.category = category;
      }
      if (brand) {
        query.brandName = brand;
      }

      const result = await itemsCollection.countDocuments(query);
      res.send({ counts: result });
    });

    app.get("/search-data", async (req, res) => {
      const prodName = req.query.name;
      console.log(prodName);
      const query = { name: { $regex: prodName } };
      const result = await itemsCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/filters", async (req, res) => {
      const result = await itemsCollection.find().toArray();
      const categories = [...new Set(await result.map((res) => res.category))];
      const brands = [...new Set(await result.map((res) => res.brandName))];
      res.send({ categories, brands });
    });

    app.get("/items", async (req, res) => {
      const { category, brand, page, size } = req.query;
      const numPage = parseInt(page);
      const numSize = parseInt(size);

      // console.log(numPage, numSize)
      let query = {};

      if (category) {
        query.category = category;
      }
      if (brand) {
        query.brandName = brand;
      }

      const result = await itemsCollection
        .find(query)
        .skip(numPage * numSize)
        .limit(numSize)
        .toArray();
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// ____________________________________________________________________

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
