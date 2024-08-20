const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
var cors = require("cors");
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://itemsvally.netlify.app"],
    credentials: true,
  })
);

const uri = `mongodb+srv://itemsVally:akash123@cluster0.tyigyp7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// const uri =
//   `mongodb+srv://${process.env.DBuser}:${process.env.DBpass}@cluster0.tyigyp7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );

    const db = client.db("itemsVally");
    const itemsCollection = db.collection("itemsCollection");

    //  for adding data to db
    app.post("/items", async (req, res) => {
      const {
        productName,
        productImage,
        rating,
        brandName,
        description,
        price,
        category,
      } = await req.body;

      const data = {
        productName,
        productImage,
        rating,
        brandName,
        description,
        price: parseInt(price),
        category,
        creationTime: new Date(),
      };

      const result = await itemsCollection.insertOne(data);
      res.send(result);
    });

    app.get("/countNumberOfData", async (req, res) => {
      const { category, brand, minPrice, maxPrice, searchQuery } = req.query;
      const minPr = parseInt(minPrice);
      const maxPr = parseInt(maxPrice);

      let query = {};
      // filter by category
      if (category) {
        query.category = category;
      }
      // filter by brand
      if (brand) {
        query.brandName = brand;
      }
      // filter by price range
      if (minPr && maxPr) {
        query.price = { $gte: Number(minPr), $lte: Number(maxPr) };
      } else if (minPr) {
        query.price = { $gte: Number(minPr) };
      } else if (maxPr) {
        query.price = { $lte: Number(maxPr) };
      }
      // filter by search value
      if (searchQuery) {
        query.productName = { $regex: searchQuery, $options: "i" };
      }

      const result = await itemsCollection.countDocuments(query);
      res.send({ counts: result });
    });

    app.get("/filters", async (req, res) => {
      const result = await itemsCollection.find().toArray();
      const categories = [...new Set(await result.map((res) => res.category))];
      const brands = [...new Set(await result.map((res) => res.brandName))];
      res.send({ categories, brands });
    });

    app.get("/items", async (req, res) => {
      const {
        category,
        brand,
        page,
        size,
        sort,
        minPrice,
        maxPrice,
        searchQuery,
      } = req.query;
      const numPage = parseInt(page);
      const numSize = parseInt(size);
      const minPr = parseInt(minPrice);
      const maxPr = parseInt(maxPrice);

      let sortQuery = {};
      let query = {};

      // for filter
      // filter data by category
      if (category) {
        query.category = category;
      }
      // filter data by brand name
      if (brand) {
        query.brandName = brand;
      }
      // filter for sort data by price range
      if (minPr && maxPr) {
        query.price = { $gte: Number(minPr), $lte: Number(maxPr) };
      } else if (minPr) {
        query.price = { $gte: Number(minPr) };
      } else if (maxPr) {
        query.price = { $lte: Number(maxPr) };
      }
      // filter for searching data
      if (searchQuery) {
        query.productName = { $regex: searchQuery, $options: "i" };
      }
      // for sorting
      if (sort === "lowToHigh") {
        sortQuery.price = 1;
      }
      if (sort === "highToLow") {
        sortQuery.price = -1;
      }
      if (sort === "latest") {
        sortQuery.creationTime = -1;
      }

      const result = await itemsCollection
        .find(query)
        .sort(sortQuery)
        .skip(numPage * numSize)
        .limit(numSize)
        .toArray();
      res.send(result);
    });

    app.get("/details/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await itemsCollection.findOne(query);
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
  res.send("Hello World! form itemsVally");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
