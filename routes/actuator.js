// routes/actuator.js
const express = require('express');
const router = express.Router();
const db = require('../db');

//Route to update actuator(s)
router.post('/update', async (req, res) => {
    const actuators = Array.isArray(req.body) ? req.body : [req.body];

    try {
        for (const actuator of actuators) {
            const { actuatorType, state } = actuator;

            if (!actuatorType) {
                return res.status(400).send('Missing required field: actuatorType is required');
            }

            const actuatorState = state !== undefined ? state : false;

            // Check if the actuator exists
            const [rows] = await db.execute('SELECT * FROM Actuators WHERE actuator = ?', [actuatorType]);

            if (rows.length > 0) {
                // Update the existing actuator's state
                await db.execute(
                    'UPDATE Actuators SET state = ?, dateTime = CURRENT_TIMESTAMP WHERE actuator = ?',
                    [actuatorState, actuatorType]
                );
            } else {
                // Insert a new actuator entry
                await db.execute(
                    'INSERT INTO Actuators (actuator, state) VALUES (?, ?)',
                    [actuatorType, actuatorState]
                );
            }
        }
        res.status(200).send('Actuator states updated successfully');
    } catch (error) {
        res.status(500).send('Error updating actuator states: ' + error.message);
    }
});

// Route to retrieve actuator states
router.get('/read', async (req, res) => {
    const { actuatorTypes } = req.query; // Expecting a comma-separated list of actuator types
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
        res.status(500).send('Error retrieving actuator states: ' + error.message);
    }
});

module.exports = router;
