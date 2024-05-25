const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// maidware //fff
app.use(cors());

app.use(express.json());

//MongoDB Connection 


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.octeyq5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // await client.connect();

        const productsCollection = client.db('ProductReviewTask1').collection('productCollection');
        const usersCollection = client.db('ProductReviewTask1').collection('usersCollection');
        const reviewCollection = client.db('ProductReviewTask1').collection('reviewCollection');


        //userData saving in DB
        app.post("/userdata", async (req, res) => {
            const userAll = req.body;
                const result = await usersCollection.insertOne(userAll);
             res.send(result);
        });
       

        //allProduct show data 
        app.get("/allproductsdata", async (req, res) => {
            const result = await productsCollection.find().toArray();
            res.send(result);
        });

        //Searching ApI
        app.get('/allproductsdata/:search', async (req, res) => {
            console.log("text");
            let query = {};
            if (req.query?.name) {
                query ={name:req.query.name}
            }
            const result = await productsCollection.find(query).toArray();
            res.send(result);
        });
     

        //allProduct show all data & Pagination
        app.get("/allproducts", async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            console.log("pagination quary ",req.query); 
            const result = await productsCollection.find()
            .skip(size * page)
            .limit(size)
            .toArray();
            res.send(result);
        });

        //single data detalis show
        app.get('/allproducts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productsCollection.findOne(query);
            res.send(result)
        });

        //sorting api
        app.get('/sortingproduct', async (req, res) => {
            const sortField = req.query.sortField;
            const sortOrder = parseFloat(req.query.sortOrder);
            let sortObj = {};
            if (sortField && sortOrder) {
                sortObj[sortField] = sortOrder;
            }
            // console.log(sortField,sortOrder)
            const cursor = productsCollection.find().sort(sortObj)
            const result = await cursor.toArray();
            res.send(result)
        });

        //Filter Api
        app.get('/filterproduct', async (req, res) => {
            let query = {};
            if (req.query?.category) {
                query ={category:req.query.category}
            }
            const result = await productsCollection.find(query).toArray();
            res.send(result);
        });

        //pagination Api
        app.get("/productpagination", async (req,res) =>{
            const total = await productsCollection.estimatedDocumentCount();
            // console.log("total Product : ",total);
            res.send({total})
        });

        //add Review
        app.post("/review",async(req,res)=>{
            const data= req.body;
            const result = await reviewCollection.insertOne(data);
            res.send(result);

        })
        app.get("/review",async(req,res)=>{
            const result = await reviewCollection.find().toArray();
            res.send(result);

        })


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Server Runing!')
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})