const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion,} = require("mongodb");
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.sbw5eqf.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();--

    const dataCollection = client.db("brandShopDB").collection("data");
    const cartCollection = client.db("brandShopDB").collection("cart");
    
    // Get details for a specific item by ID
    app.get("/details/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await dataCollection.findOne(query);
        if (result) {
          res.json(result);
        } else {
          res.status(404).json({ error: "Item not found" });
        }
      } catch (error) {
        console.error("Error fetching item details:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    
    // Get data for a specific brand
    app.get("/data/:id", async (req, res) => {
      try {
        const brandName = req.params.id;
        const query = { brandName: brandName };
        const cursor = dataCollection.find(query);
        const result = await cursor.toArray();
        res.json(result);
      } catch (error) {
        console.error("Error fetching brand data:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    
    // Get all data
    app.get("/data", async (req, res) => {
      try {
        const query = dataCollection.find();
        const result = await query.toArray();
        res.json(result);
      } catch (error) {
        console.error("Error fetching all data:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    
    // Update a cart item by ID
    app.put("/updateCart/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const {
          brandName,
          description,
          name,
          photo,
          price,
          rating,
          selectedOption,
        } = req.body;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            name: name,
            description: description,
            photo: photo,
            price: price,
            selectedOption: selectedOption,
            brandName: brandName,
            rating: rating,
          },
        };
        const result = await dataCollection.updateOne(filter, updateDoc);
        res.json(result);
      } catch (error) {
        console.error("Error updating cart item:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    
    // Get cart items by email
    app.get("/carts/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const query = { email: email };
        const result = await cartCollection.find(query).toArray();
        res.json(result);
      } catch (error) {
        console.error("Error fetching cart items:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    
    // Delete a cart item by ID
    app.delete("/carts/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await cartCollection.deleteOne(query);
        res.json(result);
      } catch (error) {
        console.error("Error deleting cart item:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    
    // Add a new item to the cart
    app.post("/carts", async (req, res) => {
      try {
        const cartData = req.body;
        const result = await cartCollection.insertOne(cartData);
        res.json(result);
      } catch (error) {
        console.error("Error adding item to cart:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    
    // Add a new data item
    app.post("/data", async (req, res) => {
      try {
        const data = req.body;
        const result = await dataCollection.insertOne(data);
        res.json(result);
      } catch (error) {
        console.error("Error adding data item:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // Ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error: " + error.message);
  } finally {
    // Ensure that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.error);

app.get("/", (req, res) => {
  res.send("BrandShop server is running");
});

app.listen(port, () => {
  console.log(`BrandShop app listening on port ${port}`);
});