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
        // const  userCollection = client.db('akm').collection('users')
        const reviewCollection = client.db('akm').collection('review')

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
            const email = req.query.email
            // console.log(client);
            const query = { email }
            const cursor = purchasingCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders)

        })

        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await purchasingCollection.deleteOne(query);
            res.send(result);
        })

        // app.put('/user/email', async(req, res)=>{
        //     const email = req.params.email;
        //     const user = req.body;
        //     const filter = {email: email};
        //     const options = {upsert: true};
        //     const updateDoc = {
        //         $ser: user,  
        //     }
        //     const result = await userCollection.updateOne(filter, updateDoc, options );
        //     res.send(result)
        // })

        // add review
        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
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