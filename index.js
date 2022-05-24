const express = require('express');

const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;

const app = express();



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ukprd.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
      if (err) {
        return res.status(403).send({ message: 'Forbidden access' })
      }
      req.decoded = decoded;
      next();
    });
  }



async function run() {
    try {
        await client.connect();
        const productCollection = client.db('akm').collection('product');
        const purchasingCollection = client.db('akm').collection('purchasing')
        const  userCollection = client.db('akm').collection('users')
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
           

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
              $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET)
            res.send({result,token});
          })
 

        // add review
        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        })
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result)
        })

        // admin section 
        app.get('/users', verifyJWT, async (req,res) =>{
            const query = {};
            const cursor = userCollection.find(query);
            const users = await cursor.toArray();
            res.send(users)
        })
        app.get('/admin/:email', async(req, res) =>{
            const email = req.params.email;
            const user = await userCollection.findOne({email: email});
            const isAdmin = user.role === 'admin';
            res.send({admin: isAdmin})
          })
      
        app.put('/user/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const requester = req.decoded.email;
            const requesterAccount = await userCollection.findOne({ email: requester });
            if (requesterAccount.role === 'admin') {
              const filter = { email: email };
              const updateDoc = {
                $set: { role: 'admin' },
              };
              const result = await userCollection.updateOne(filter, updateDoc);
              res.send(result);
            }
            else{
              res.status(403).send({message: 'forbidden'});
            }
      
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