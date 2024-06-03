// routes/sensor.js
const express = require('express');
const router = express.Router();
const db = require('../db');

//update parameter values (MIN -MAX)
// Route to update parameter values
router.post('/update-parameters', async (req, res) => {
    const parameters = Array.isArray(req.body) ? req.body : [req.body];

    try {
        for (const parameter of parameters) {
            const { parameterType, max_val, min_val } = parameter;

            if (!parameterType) {
                return res.status(400).send('Missing required field: parameterType is required');
            }

            if (max_val !== undefined && min_val !== undefined && max_val < min_val) {
                return res.status(400).send('max_val cannot be less than min_val');
            }

            // Check if the parameter exists
            const [rows] = await db.execute('SELECT * FROM MaxMinSetParameters WHERE parameter = ?', [parameterType]);

            if (rows.length > 0) {
                // Update the existing parameter's values
                const currentMaxVal = rows[0].max_val;
                const currentMinVal = rows[0].min_val;

                await db.execute(
                    'UPDATE MaxMinSetParameters SET max_val = COALESCE(?, max_val), min_val = COALESCE(?, min_val), dateTime = CURRENT_TIMESTAMP WHERE parameter = ?',
                    [
                        max_val !== undefined ? max_val : currentMaxVal,
                        min_val !== undefined ? min_val : currentMinVal,
                        parameterType
                    ]
                );
            } else {
                // Insert a new parameter entry, using default values if max_val or min_val is not provided
                await db.execute(
                    'INSERT INTO MaxMinSetParameters (parameter, max_val, min_val) VALUES (?, ?, ?)',
                    [
                        parameterType,
                        max_val !== undefined ? max_val : null,
                        min_val !== undefined ? min_val : null
                    ]
                );
            }
        }
        res.status(200).send('Parameter values updated successfully');
    } catch (error) {
        res.status(500).send('Error updating parameter values: ' + error.message);
    }
});

// Route to retrieve set parameter values
router.get('/get-parameters', async (req, res) => {
    const { parameterTypes } = req.query; // Expecting a comma-separated list of parameter types
    let query = 'SELECT * FROM MaxMinSetParameters';
    let params = [];

    if (parameterTypes) {
        const types = parameterTypes.split(',');
        const placeholders = types.map(() => '?').join(',');
        query += ` WHERE parameter IN (${placeholders})`;
        params = types;
    }

    try {
        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).send('Error retrieving parameter values: ' + error.message);
    }
});

module.exports = router;
