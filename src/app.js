import express from "express";
import { MongoClient } from "mongodb";
import cors from 'cors';
import joi from 'joi';
import dayjs from "dayjs";

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

function getCurrentTime(){
	//format: HH:MM:SS
	return `${dayjs().hour()}:${dayjs().minute()}:${dayjs().second()}`
}


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

	db.collection("messages").insertOne({
		from: name.name,
		to: 'Todos',
		text: "entra na sala...",
		type: "status",
		time: getCurrentTime()
	})
	res.sendStatus(201)
});

app.post("/messages", async (req, res) => {

	const user = req.headers.user
	const message = req.body
	const msgSchema = joi.object({
		to: joi.string().required(),
		text: joi.string().required(),
		type: joi.string().required()
	})
	const validation = msgSchema.validate(message);

	if (validation.error){
		return res.status(422).send(validation.error.details)
	}

	if (message.type !== "message" && message.type !== "private_message"){
		return res.sendStatus(422)
	}

	const doesUserExists = await db.collection("participants").findOne({name: user})

	console.log(doesUserExists)

	if (!doesUserExists){
		return res.status(422).send("Usuário não registrado");
	}

	db.collection("messages").insertOne({
		from: user,
		to: message.to,
		text: message.text,
		type: message.type,
		time: getCurrentTime()
	})
	res.sendStatus(201)
});

app.post("/status", (req, res) => {
	res.sendStatus(201)
});



app.listen(PORT, ()=>console.log(`Server running on port ${PORT}`));