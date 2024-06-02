// routes/actuator.js
const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/update', async (req, res) => {
    const actuators = req.body;
    try {
        for (const actuator of actuators) {
            const { dateTime, id, actuatorType, state } = actuator;
            await db.execute(
                'INSERT INTO Actuators (dateTime, id, actuator, state) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE state = VALUES(state), dateTime = VALUES(dateTime)',
                [dateTime, id, actuatorType, state]
            );
        }
        res.status(200).send('Actuator states updated successfully');
    } catch (error) {
        res.status(500).send('Error updating actuator states: ' + error.message);
    }
});

router.get('/read', async (req, res) => {
    const { actuatorTypes } = req.query; // Expecting a comma-separated list
    let query = 'SELECT * FROM Actuators';
    let params = [];

    if (actuatorTypes) {
        const types = actuatorTypes.split(',');
        const placeholders = types.map(() => '?').join(',');
        query += ` WHERE actuator IN (${placeholders})`;
        params = types;
    }

    try {
        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).send('Error reading actuator states: ' + error.message);
    }
});

module.exports = router;
