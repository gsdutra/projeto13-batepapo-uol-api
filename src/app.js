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

setInterval(removeOldUsers, 15000)

function getCurrentTime(){
	//format: HH:MM:SS
	return `${dayjs().hour().toLocaleString('en-US', {
		minimumIntegerDigits: 2,
		useGrouping: false
	  })}:${dayjs().minute().toLocaleString('en-US', {
		minimumIntegerDigits: 2,
		useGrouping: false
	  })}:${dayjs().second().toLocaleString('en-US', {
		minimumIntegerDigits: 2,
		useGrouping: false
	  })}`
}

async function removeOldUsers(){
	const participants = await db.collection("participants").find().toArray()

	for (let index = 0; index < participants.length; index++) {
		if ((Date.now() - participants[index].lastStatus) > 10000){

			db.collection("participants").deleteOne({__id: participants[index].__id});

			db.collection("messages").insertOne({
				from: participants[index].name,
				to: 'Todos',
				text: 'sai da sala...',
				type: 'status',
				time: getCurrentTime()
			})

		}
	}
}

//GET routes
app.get("/participants", async (req, res) => {
	const participants = await db.collection("participants").find().toArray();
	res.status(200).send(participants)
});

app.get("/messages", async (req, res) => {
	const limit = req.query.limit;
	const user = req.headers.user;
	let messagesArray = await db.collection("messages").find().toArray();

	if (parseInt(limit) && parseInt(limit) > 0 && Number(limit)){
		messagesArray = messagesArray.slice(-1*(Number(limit)))
	}else{
		return res.sendStatus(422);
	}

	messagesArray = messagesArray.filter((elem)=>(
		elem.to === "Todos" ||
		elem.to === user ||
		elem.from === user
	))

	res.status(200).send(messagesArray);
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

	await db.collection("participants").insertOne({
		name: name.name,
		lastStatus: Date.now()
	})

	await db.collection("messages").insertOne({
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

app.post("/status", async (req, res) => {

	const user = req.headers.user

	const doesUserExists = await db.collection("participants").findOne({name: user})

	if (!doesUserExists){
		return res.status(404).send("Usuário não registrado");
	}

	db.collection("participants").updateOne({name: user}, {$set: {lastStatus: Date.now()}})

	res.sendStatus(200)
});



app.listen(PORT, ()=>console.log(`Server running on port ${PORT}`));