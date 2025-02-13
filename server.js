require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// Rota para iniciar o login via GitHub
app.get("/login/github", (req, res) => {
    const redirect_uri = "http://git-board-ai-6dce65bdb713.herokuapp.com/callback";
    const redirectUri = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=read:org,read:project,project&redirect_uri=${redirect_uri}`;
    res.redirect(redirectUri);
});

// Callback do GitHub OAuth
app.get("/callback", async (req, res) => {
    const code = req.query.code;
    if (!code) {
        return res.status(400).json({ error: "Código de autorização ausente" });
    }

    try {
        // Troca o código de autorização pelo token de acesso
        const tokenResponse = await axios.post(
            "https://github.com/login/oauth/access_token",
            {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code,
            },
            { headers: { Accept: "application/json" } }
        );

        const accessToken = tokenResponse.data.access_token;

        return res.redirect(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?token=${accessToken}`);
    } catch (error) {
        return res.status(500).json({ error: "Falha na autenticação" });
    }
});

app.listen(PORT, () => console.log("Servidor rodando na porta 3000"));