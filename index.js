const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.686iy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
 
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();
        const database = client.db('allCars');
        const carCollection = database.collection('cars');
        const bookingCollection = database.collection('bookings');
        const usersCollection = database.collection('users');
        //GET API FOR CAR
        app.get('/cars', async(req,res) =>{
            const cursor = carCollection.find({});
            const cars = await cursor.toArray();
            res.send(cars);
        })
        //GET BOOKING DETAILS
       app.get('/cars/:id', async(req, res) =>{
           const id = req.params.id;
           const query = {_id:ObjectId(id)};
           const car = await carCollection.findOne(query);
           res.json(car);
       })

       //GET API Bookings
        app.get('/bookings',async(req,res)=>{
            const email = req.query.email;
            const query = {email:email}
            const cursor = bookingCollection.find(query);
            const bookings = await cursor.toArray();
            res.json(bookings);
        })


        //POST API Bookings
        app.post('/bookings', async(req,res) =>{
            const bookings = req.body;
            const result = await bookingCollection.insertOne(bookings);
            console.log(result);
            res.json(result);
        });

        app.get('/users/:email', async(req, res) =>{
            const email = req.params.email;
            const query = {email:email};
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin = true;
            }
            res.json({admin: isAdmin});
        })
        
        app.post('/users', async(req,res) =>{
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        app.put('/users',async(req,res) =>{
            const user = req.body;
            const filter = {email: user.email};
            const options = {upsert :true};
            const updateDoc = {$set: user};
            const result =await usersCollection.updateOne(filter,updateDoc,options);
            res.json(result);

        });
        app.put('/users/admin', async(req,res) =>{
            const user = req.body;
            console.log('put',user);
            const filter = {email: user.email};
            const updateDoc = {$set:{role: 'admin'}};
            const result = await usersCollection.updateOne(filter,updateDoc);
            res.json(result);

        })
    }
    finally{

    }

}

run().catch(console.dir);


app.get('/', (req, res) =>{
    res.send('Hello World');
})

app.listen(port, ()=>{
    console.log('Running Server Port',port);
})