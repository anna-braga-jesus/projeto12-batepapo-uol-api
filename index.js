import express from 'express';
import dayjs from 'dayjs'
import dotenv from 'dotenv';
//('dotenv').config();
import Joi from 'joi';

//let port = process.env.PORT 
//http://localhost:5000/
const app = express();

const participantes = [];
const mensagens = [];

//POST/participants
app.post("/participants", (req,res)=>{
    const {name} = req.body;

    //As validações deverão ser feitas com a biblioteca joi
    if(!name){
        res.status(422);
        return;
    }else{
        res.status(201);
    }
    
})


//GET/participants
app.get("/participants", (req, res)=> {
    res.send(participantes);
})


//POST /messages
app.post("/messages",()=>{
    const { to, text, type} = req.body;

    res.status(201);
})



//GET /messages
app.get("/messages", (req, res)=>{
    
    res.status(201).send(mensagens);


})



//POST /status
app.post("/status", (req, res)=>{


    res.status(200);
})



//Remoção automática de usuário inativos
//setInterval(displayHello, 15000);



app.listen(5000,() => console.log("Rodando na porta 5000..."));