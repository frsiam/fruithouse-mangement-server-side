const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');

require('dotenv').config()

const app = express();
const port = process.env.PORT || 4000;

// use midleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ihinm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const fruitCollection = client.db("fruitExpress").collection("fruit");

        // Add new Item / Insert item
        // Data received for store database from UI and send to UI
        app.post('/fruit', async (req, res) => {
            const newfruit = req.body;
            console.log('from client side', newfruit);
            const result = await fruitCollection.insertOne(newfruit);
            res.send(result);
        })

        // Find or Get All item from database
        app.get('/fruits', async (req, res) => {
            const query = {};
            const cursor = fruitCollection.find(query);
            const fruits = await cursor.toArray();
            res.send(fruits);
        })
    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Hello....Assalamualaikum')
})


app.listen(port, () => {
    console.log('listening from', port)
})