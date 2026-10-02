require("dotenv").config()
const express = require("express")
const cors = require("cors")
const db = require("./config/database")

const jwt = require("jsonwebtoken")

const auth = require("./middleware/auth")

const app = express()

const PORT = 3001

app.use(express.json())
app.use(cors())

app.get("/",(req,res)=>{
    res.json({
        mensagem:"API do restaurante Sabor Eduardo funcionando"
    })
})

app.post("/login", async (req, res) => {
    const { email, senha } = req.body;

    try {
        const [usuarios] = await db.query(
            "SELECT * FROM usuario WHERE email = ? AND senha = ?",
            [email, senha]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({ 
                mensagem: "E-mail ou senha inválidos" 
            });
        }

        const usuario = usuarios[0];

        if(usuario.senha !== senha) {
            return res.status(401).json({ 
                mensagem: "E-mail ou senha inválidos" 
            });
        }

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: "Erro ao realizar login" });
    }
});

app.get("/produtos", auth, async (req,res)=>{
    try {
        const [produtos] = await db.query(
            "SELECT * from produto"
        )
        res.json(produtos)
    } catch (error) {
        console.log(error)
    }
})






app.post("/produto", async (req, res) => {
    try {
        const { descricao, categoria, preco, imagem } = req.body;

        const sql = `
            INSERT INTO produto (descricao, categoria, preco, imagem)
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await db.execute(sql, [
            descricao,
            categoria,
            preco,
            imagem
        ]);

        res.status(201).json({
            mensagem: "Produto cadastrado com sucesso",
            produto: {
                id: result.insertId,
                descricao,
                categoria,
                preco,
                imagem
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensagem: "Erro ao cadastrar produto"
        });
    }
});

app.listen(PORT, ()=>{
    console.log("Servidor rodando na porta 3001")
})