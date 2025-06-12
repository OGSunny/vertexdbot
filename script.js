const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API to save Lua script
app.post('/api/save-script', async (req, res) => {
    const { script } = req.body;
    if (!script || typeof script !== 'string') {
        return res.status(400).json({ message: 'Invalid or missing script' });
    }

    try {
        await fs.writeFile(path.join(__dirname, 'public', 'loader.lua'), script);
        res.status(200).json({ message: 'Script saved successfully' });
    } catch (error) {
        console.error('Error saving script:', error);
        res.status(500).json({ message: 'Failed to save script' });
    }
});

// Serve raw Lua script
app.get('/loader.lua', async (req, res) => {
    try {
        const script = await fs.readFile(path.join(__dirname, 'public', 'loader.lua'), 'utf8');
        res.set('Content-Type', 'text/plain');
        res.send(script);
    } catch (error) {
        res.status(404).send('Script not found');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
