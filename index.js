const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

require('dotenv').config()

const app = express();
const port = process.env.PORT || 4000;

// use midleware
app.use(cors())
app.use(express.json())

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ meassase: 'Unauthorized Access' })
    }
    const myToken = authHeader.split(' ')[1];
    jwt.verify(myToken, process.env.SECRET_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        req.decoded = decoded;
        next();
    })
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ihinm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const fruitCollection = client.db("fruitExpress").collection("fruit");

        //AUTH
        app.post('/login', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.SECRET_TOKEN, {
                expiresIn: '1d'
            });
            res.send(token);
        })

        // Add new Item / Insert item
        // Data received for store database from UI and send to UI
        app.post('/fruit', async (req, res) => {
            const newfruit = req.body;
            const result = await fruitCollection.insertOne(newfruit);
            res.send(result);
        })

        // Find all item or Get All item from database
        app.get('/fruits', async (req, res) => {
            const query = {};
            const cursor = fruitCollection.find(query);
            const fruits = await cursor.toArray();
            res.send(fruits);
        })

        // My Items api
        app.get('/myitems', verifyToken, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = fruitCollection.find(query);
                const myitems = await cursor.toArray();
                res.send(myitems);
            }
            else {
                res.status(403).send({ message: 'Forbidden access' });
            }
        })

        // Find a item or Get a item from database
        app.get('/fruit/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await fruitCollection.findOne(query);
            res.send(result);
        })

        //Update Item Quantity
        app.put('/fruit/:id', async (req, res) => {
            const id = req.params.id;
            const updatedUser = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: updatedUser,
            };
            const result = await fruitCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        //Delete a user
        app.delete('/fruit/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await fruitCollection.deleteOne(query);
            res.send(result);
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