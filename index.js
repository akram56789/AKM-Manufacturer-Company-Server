const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;

const app = express();



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ukprd.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('akm').collection('product');
        const purchasingCollection = client.db('akm').collection('purchasing')

        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products)
        });
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query)
            res.send(product)
        });
        app.get('/purchasing', async (req, res) => {
            const purchase = req.query.purchase;
            const query = { purchase: purchase };
            const purchasings = await purchasingCollection.find(query).toArray();
            res.send(purchasings);
        })

        app.post('/purchasing', async (req, res) => {
            const newProduct = req.body;
            const result = await purchasingCollection.insertOne(newProduct);
            res.send(result);
        });
        app.get('/myorders', async (req, res) => {
            const client = req.query.client
            console.log(client);
            const query = { client}
            const cursor = purchasingCollection.find(query);
            const purchasing = await cursor.toArray();
            res.send(purchasing)

        })


    }

    finally {

    }
}
run().catch(console.dir);













//middleware
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('running my assignment-12 server')
});

app.listen(port, () => {
    console.log('port is running', port);
})