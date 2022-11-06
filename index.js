const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
var jwt = require('jsonwebtoken');
require('dotenv').config();

//Middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.z9hjm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});

const verifyJWT = (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.status(401).send({ message: 'Unauthorized Access' });
	}
	const token = authHeader.split(' ')[1];
	jwt.verify(token, process.env.JWT_ACCESS_TOKEN, (err, decoded) => {
		if (err) {
			return res.status(401).send({ message: 'Unauthorized Access' });
		}
		req.decoded = decoded;
	});
	next();
};

const run = async () => {
	const database = client.db('volunteerNetworkDB');
	const eventsCollection = database.collection('events');
	const joinedCollection = database.collection('joined');

	//JWT TOKEN GENERATOR
	app.post('/jwt', (req, res) => {
		const user = req.body;
		jwt.sign(user, process.env.JWT_ACCESS_TOKEN, (err, token) => {
			res.send({ token });
		});
	});

	app.get('/events', async (req, res) => {
		const page = parseInt(req.query.page);
		const size = parseInt(req.query.size);
		const query = {};
		const cursor = eventsCollection.find(query);
		const events = await cursor
			.skip(page * size)
			.limit(size)
			.toArray();
		const count = await eventsCollection.estimatedDocumentCount();
		res.send({ count, events });
	});

	app.get('/events/:id', async (req, res) => {
		const id = req.params.id;
		const query = { _id: ObjectId(id) };
		const event = await eventsCollection.findOne(query);
		res.send(event);
	});

	//Find All Joined List
	app.get('/joined', verifyJWT, async (req, res) => {
		const decoded = req.decoded;
		const uid = req.query.uid;
		if (decoded.uid !== uid) {
			return res.status(403).send({ message: 'Forbidden Access' });
		}
		const query = { user_uid: uid };
		const cursor = joinedCollection.find(query);
		const data = await cursor.toArray();
		res.send(data);
	});

	//Insert Joined List
	app.post('/joined', async (req, res) => {
		const joinedPerson = req.body;
		const result = await joinedCollection.insertOne(joinedPerson);
		res.send(result);
	});
};

run().catch((err) => console.log(err));

app.get('/', (req, res) => {
	res.send('Volunteer Server Running');
});

app.listen(port, () => {
	console.log('Volunteer Server Running');
});
