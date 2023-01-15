import express from "express";
import { MongoClient } from "mongodb";
import cors from 'cors';
import joi from 'joi';

import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5000;

const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

mongoClient.connect().then(() => {
	db = mongoClient.db();
});


//GET routes
app.get("/participants", async (req, res) => {
	const participants = await db.collection("participants").find().toArray();
	res.status(200).send(participants)
});

app.get("/messages", (req, res) => {
	res.sendStatus(200)
});


//POST routes
app.post("/participants", async (req, res) => {
	const name = req.body;
	const nameSchema = joi.object({
		name: joi.string().required()
	})
	const validation = nameSchema.validate(name);

	if (validation.error){
		return res.status(422).send(validation.error.details)
	}

	const alreadyExists = await db.collection("participants").findOne(name)

	if (alreadyExists){

		return res.sendStatus(409)
	}
	db.collection("participants").insertOne({
		name: name.name,
		lastStatus: Date.now()
	})
	res.sendStatus(201)
});

app.post("/messages", (req, res) => {
	res.sendStatus(201)
});

app.post("/status", (req, res) => {
	res.sendStatus(201)
});




app.listen(PORT, ()=>console.log(`Server running on port ${PORT}`));