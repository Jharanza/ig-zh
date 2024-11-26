const express = require('express');
const cors = require('cors');
const { ApifyClient } = require('apify-client');
require('dotenv').config();

const app = express();
app.use(cors({
    origin: '*', // Cambiar '*' por un dominio específico si es necesario
    credentials: true,
    methods: '*',
    allowedHeaders: '*',
}));

const API_TOKEN = process.env.API_TOKEN;

if (!API_TOKEN) {
    throw new Error('The token is not configured');
}

const client = new ApifyClient({ token: API_TOKEN });
const reelsStorage = {};

// Ruta raíz
app.get('/', (req, res) => {
    res.json({ message: "Cors correctly configured" });
});

// Iniciar el procesamiento de reels
app.post('/api/reels/:username/start', async (req, res) => {
    const username = req.params.username;
    try {
        const runInput = {
            username: [username],
            resultsLimit: 3,
        };

        const run = await client.actor('xMc5Ga1oCONPmWJIa').start({ input: runInput });
        const runId = run.id;

        res.json({ message: "Actor started", runId });
    } catch (error) {
        res.status(500).json({ detail: `Error starting actor: ${error.message}` });
    }
});

// Consultar el estado del procesamiento
app.get('/api/reels/:run_id/status', async (req, res) => {
    const runId = req.params.run_id;
    try {
        const run = await client.run(runId).get();

        if (run.status === 'SUCCEEDED') {
            const datasetId = run.defaultDatasetId;
            const reels = [];

            for await (const item of client.dataset(datasetId).iterateItems()) {
                reels.push({
                    type: item.type,
                    media_url: item.videoUrl || item.imageUrl,
                    post_url: item.url,
                });
            }
            reelsStorage[runId] = reels;

            return res.json(reels);
        }

        res.json({ status: run.status });
    } catch (error) {
        res.status(500).json({ detail: `Error fetching actor status: ${error.message}` });
    }
});

// Obtener todos los reels guardados
app.get('/api/reels', (req, res) => {
    try {
        if (Object.keys(reelsStorage).length === 0) {
            return res.status(404).json({ detail: "No reels data found." });
        }

        const allReels = Object.values(reelsStorage).flat();
        res.json(allReels);
    } catch (error) {
        res.status(500).json({ detail: `Error reading saved reels: ${error.message}` });
    }
});

// Obtener los últimos reels de un usuario y guardarlos
app.get('/api/reels/:username', async (req, res) => {
    const username = req.params.username;
    try {
        const runInput = {
            username: [username],
            resultsLimit: 3,
        };

        const run = await client.actor('xMc5Ga1oCONPmWJIa').call({ input: runInput });

        const latestReels = [];
        for await (const item of client.dataset(run.defaultDatasetId).iterateItems()) {
            latestReels.push({
                type: item.type,
                media_url: item.videoUrl || item.imageUrl,
                post_url: item.url,
            });
        }

        reelsStorage[username] = latestReels;

        res.json(latestReels);
    } catch (error) {
        res.status(500).json({ detail: `Error fetching reels: ${error.message}` });
    }
});

// Exportar el módulo para Vercel
module.exports = app;
