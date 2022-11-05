const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
var jwt = require('jsonwebtoken');
require('dotenv').config();

//Middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.z9hjm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});

const run = async() => {
    const database = client.db('volunteerNetworkDB');
    const eventsCollection = database.collection('events');

    app.get('/events',async (req, res) => {
        const query = {};
        const cursor = eventsCollection.find(query);
        const events = await cursor.toArray();
        res.send(events)
    })
}

run().catch(err => console.log(err))

app.get('/', (req, res) => {
    res.send('Volunteer Server Running')
})

app.listen(port, () => {
    console.log('Volunteer Server Running');
})
