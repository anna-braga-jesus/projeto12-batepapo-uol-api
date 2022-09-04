import express from "express";
import dayjs from "dayjs";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import Joi from "joi";
const app = express();
app.use([cors(), express.json()]);

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect().then(() => {
  console.log("Rodando database...");
  db = mongoClient.db("test");
});

//MODELOS IDEAIS
const participanteSchema = Joi.object({ name: Joi.string().min(1).required() });
const mensagemSchema = Joi.object().keys({
  from: Joi.string().min(1).required(),
  to: Joi.string().min(1).required(),
  text: Joi.string().min(1).required(),
  type: Joi.string().valid("private_message", "message").required(),
  time: Joi.any(),
});

//POST/participants
app.post("/participants", async (req, res) => {
  const { name } = req.body;
  console.log(name, "entrou na sala")
  const validation = participanteSchema.validate(req.body, {
    abortEarly: false,
  });

  if (validation.error) {
    res.status(422);
    return;
  }
  const participanteProcurado = await db
    .collection("participants")
    .findOne({ name: name }, (a, b) => {
      let isUserExists = (b===null) ? false : true;
      if (isUserExists) {
        res.status(409).send({ error: "Esse usuário já existe!" });
        return;
      }
      let novoParticipante = {
        name,
        lastStatus: Date.now(),
      };
      let novaMensagem = {
        from: name,
        to: "Todos",
        text: "entra na sala...",
        type: "status",
        time: dayjs().format("HH:mm:ss"),
      };
    
      if (!participanteSchema) {
        res.status(422);
        return;
      }
    
      try {
        const response = db.collection("participants").insertOne(novoParticipante);
        db.collection("messages").insertOne(novaMensagem);
        res.status(201);
      } catch (error) {
        res.sendStatus(500);
      }
      res.sendStatus(201);
    });
});

//GET/participants LISTAR OS PARTICIPANTES QUE VEM DO MONGO
app.get("/participants", async (req, res) => {
  const usuarioLogado = await db.collection("participants").find().toArray();
  console.log("")
  res.send(usuarioLogado);
});

//POST /messages
app.post("/messages", async (req,res) => {
  const { to, text, type } = req.body;
  const User  = req.headers.user;

  const message = {
    from: User,
    to,
    text,
    type,
    time: dayjs().format("HH:mm:ss")
  };
  
  try {
    console.log(User,"mandou mensagem" )
    await mensagemSchema.validateAsync(message, {
      abortEarly: false, // Retornar mais erros
    });
    await db.collection("messages").insertOne(message);
    res.status(201).send("Mensagem enviada com sucesso!");
  } catch (error) {
    res.status(422).send(error.details.map((detail) => detail.message));
  }

  /*if (User === "lele") {
    res.send("sai daquiiii").status(404);
  }*/
});

//GET /messages LISTAR AS MENSAGENS QUE VEM DO MONGO
app.get("/messages", async (req, res) => {
  const { limit } = req.query;

  const mensagens = await db.collection("messages").find().toArray();
 
  try {
    if (!limit) {
      console.log("100 mensagens");
      res.send(mensagens.slice(-100)).status(201);
      return;
    } else {
      console.log("Mensagens com limite");
      res.send(mensagens.slice(Number(-limit))).status(201);
      return;
    }
  } catch (error) {
    console.error(error);
    res.send("Deu ruimm");
  }
  //http://localhost:5000/messages?limit=100
});

//POST /status
app.post("/status", async (req, res) => {
  const  User  = req.headers.user;
  console.log(User,"requisitou presença")
  try {
    await db
      .collection("participants")
      .updateOne({ name: User }, { $set: { lastStatus: Date.now() } });
      console.log("Testado")
    res.status(200);
  } catch (error) {
    res.status(404);
  }
});

//Remoção automática de usuário inativos
setInterval( async () => {
  const statusCode = Date.now();
  const participants = await db.collection("participants").find().toArray();
  
  participants.forEach(async (element) => {
    const sairDaSala = {
      from: element.name,
      to: "Todos",
      text:"sai da sala",
      type: "status",
      time:  dayjs().format("HH:mm:ss")
    }

    if(statusCode - element.lastStatus > 10000){
      await db.collection("participants").deleteOne({
        _id: element["_id"]
      })
      await db.collection("messages").insertOne(sairDaSala);
    }
  })
}, 15000);

//BONUS PUT, RESPONSAVEL POR ATUALIZAR AS MENSAGENS
app.put("/messages/:id", async (req, res) => {
  const idMensagem = req.params.id;
  const { to, text, type } = req.body;
  const { User } = req.headers;
console.log(idMensagem)
  try {
    //1º Pegar o documento na coleção e verificar se ele existe, é um getById
    const message = await db
      .collection("messages")
      .findOne({ _id: ObjectId(idMensagem) });

    if (!message) {
      res.status(400).send("Essa mensagem não existe");
      return;
    }

    //2º Com o id recebido, atualize o documento , através do que o user preencher no
    //formulario (vulgo: req.body)

    await db
      .collection("messages")
      .updateOne({ _id: ObjectId(idMensagem) }, { $set: req.body });

    res.status(200);
  } catch (error) {
    res.status(500).send(error.message);
  }
  
});
//BONUS DELETE
app.delete("/messages/:id", async(req,res) => {
  const idMensagem = req.params.id;
  const { User } = req.headers;
  try {
    //1º Pegar o documento na coleção e verificar se ele existe, é um getById
    const message = await db
      .collection("messages")
      .findOne({ _id: ObjectId(idMensagem) }, function(a,b){
        console.log(b, "alien");
      });

    if (!message) {
      res.status(404).send("Essa mensagem não existe");
      return;
    }
    /*if(UserDaMensagem !== User){
      res.status(401);
    }*/
    //Remover a mensagem da coleção messages

    //await db
     // .collection("messages")
      //.delete({ _id: ObjectId(idMensagem) }, { $set: req.body });

    res.status(200);
  } catch (error) {
    res.status(500).send(error.message);
  }
})
app.listen(5000, () => console.log("Rodando na porta 5000..."));