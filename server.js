require('dotenv').config(); // Carregar variáveis de ambiente
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const Joi = require('joi');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json()); // Para processar JSON no corpo da requisição

// Configuração do transporte de e-mail
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // Seu e-mail
        pass: process.env.EMAIL_PASS    // Cole a senha de aplicativo aqui
    }
});

// Validação de entrada
const emailSchema = Joi.object({
    to: Joi.string().email().required(),
    subject: Joi.string().required(),
    text: Joi.string().required(),
});

// Rota para enviar o e-mail
app.post("/send-email", async (req, res) => {
    const { error } = emailSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { to, subject, text } = req.body;

    // Gerar um token único
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // URL de verificação (substitua pela sua URL real)
    const verificationUrl = `http://localhost:3000/verify-email?token=${verificationToken}`;

    // Texto do e-mail de verificação
    const emailText = `${text}\n\nClique no link para verificar seu e-mail: ${verificationUrl}`;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text: emailText
        });

        res.status(200).json({ message: "E-mail de verificação enviado com sucesso!" });
    } catch (error) {
        console.error("Erro ao enviar o e-mail:", error);
        res.status(500).json({ message: "Erro ao enviar o e-mail", error: error.message });
    }
});

// Rota para verificar o e-mail
app.get("/verify-email", (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.status(400).send("Token não fornecido.");
    }

    // Aqui você pode adicionar lógica para verificar o token (armazenar no banco de dados, etc.)
    // Por simplicidade, estamos apenas enviando uma mensagem de sucesso
    res.send("E-mail verificado com sucesso!");
});

// Iniciar o servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
