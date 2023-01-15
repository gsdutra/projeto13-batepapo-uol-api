import express from "express";
import { MongoClient } from "mongodb";

import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

const PORT = 5000;

const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

mongoClient.connect().then(() => {
	db = mongoClient.db("meu_banco_de_dados");
});


//GET routes
app.get("/participants", (req, res) => {
	res.sendStatus(201)
});

app.get("/messages", (req, res) => {
	res.sendStatus(201)
});


//POST routes
app.post("/participants", (req, res) => {
	res.sendStatus(201)
});

app.post("/messages", (req, res) => {
	res.sendStatus(201)
});

app.post("/status", (req, res) => {
	res.sendStatus(201)
});




app.listen(PORT, ()=>console.log(`Server running on port ${PORT}`));