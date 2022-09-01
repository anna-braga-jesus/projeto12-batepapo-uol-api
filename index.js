import express from 'express';
import dayjs from 'dayjs'
//import { MongoClient, ObjectId } from "mongodb";
import dotenv from 'dotenv';
import cors from 'cors'
import Joi from 'joi';
import { MongoClient } from 'mongodb';

dotenv.config();

const mongoClient = new MongoClient('mongodb://localhost:27017');
let db;

mongoClient.connect().then( ()=>{
    db = mongoClient.db('test');
})



//http://localhost:5000/
const app = express();
app.use(cors());
app.use(express.json());

const porta = process.env.PORT;
const participantes = [];
const mensagens = [];
const ParticipanteNaLista=[];

//https://joi.dev/api/?v=17.6.0#types

app.get('/contatos',function(req,res){
    console.log(db)
    res.send("Ok")
})


//POST/participants
app.post("/participants", (req,res)=>{
    const {name} = req.body;
    //const novoParticipante = Joi.object().keys({
       // [{name:Joi.string().required()}]  //name deve ser strings não vazio
    //})
         
    //}
    
    /*if(isUserExists){
        res.status(409).send( { error: "Esse usuário já existe!" });
      }*/
      

    const novaMensagem = Joi.object().keys({
        from: Joi.string().required(), 
        to: Joi.string().required(), 
        text: Joi.string().required(),
         type: Joi.string().required(), 
         time: Joi.any()
    })
    const mensagem_db = {from: 'xxx', 
    to: 'Todos', 
    text: 'entra na sala...', 
    type: 'status', 
    time: dayjs().format('HH:MM:SS')
    }
    if(nomeJaUsado){
        res.status(409);
    }
    if(!novoParticipante){   
        res.status(422);
        return;
    }else{
        res.status(201);
    }
    
    
    /*try{
        const value = await novoParticipante.validateAsync({name:'anna'});
    }
    catch(error) {}*/
})


//GET/participants
app.get("/participants", (req, res)=> {
    res.send(participantes);
})


//POST /messages
app.post("/messages",()=>{
    const { to, text, type} = req.body;
    const { from } = req.headers;
    //to e text devem ser strings não vazias
    //type só pode ser 'message' ou 'private_message'
    //from deve ser um participante existente na lista de participantes
    //As validações deverão ser feitas com a biblioteca joi, 
    //com exceção da validação de um participante existente na lista de participantes 
    //(use as funções do MongoDB para isso)
    //Ao salvar essa mensagem, deve ser acrescentado 
    //o atributo **time**, contendo a hora atual no formato HH:MM:SS (utilize a biblioteca `dayjs`)
    if(erro){
        res.status(422);
        return;
    }
    res.status(201);
})



//GET /messages
app.get("/messages", (req, res)=>{
    
    res.status(201).send(mensagens);

    //parâmetro via query string
//header User
//http://localhost:4000/messages?limit=100
//.slice(-100);
})



//POST /status
app.post("/status", (req, res)=>{
    const {User} = req.headers;

    if(!ParticipanteNaLista){
        res.status(404);
        return;
    }

    lastStatus:Date.now();

    res.status(200);
})



//Remoção automática de usuário inativos
setInterval(async () => {

}, 15000);
    
const time = Date.now();

function pegarFrom(){

}

//BONUS PUT
app.put("/messages/ID_DA_MENSAGEM", ()=>{
    const {to, text, type} = req.body;
    const {from} = req.headers //User
   if( erro){
    res.status(422);
   }
})


app.listen(5000,() => console.log("Rodando na porta 5000..."));