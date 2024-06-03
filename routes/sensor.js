// routes/sensor.js
const express = require('express');
const router = express.Router();
const db = require('../db');

//Update sensor data
router.post('/update', async (req, res) => {
    const sensorData = req.body;

    // If sensorData is not an array, wrap it in an array
    const sensors = Array.isArray(sensorData) ? sensorData : [sensorData];

    try {
        for (const sensor of sensors) {
            const { timestamp, id, temperature, humidity, lighting, co2 } = sensor;

            if (!timestamp || id === undefined) {
                return res.status(400).send('Missing required fields: timestamp and id are required');
            }

            // Check if at least one sensor reading is provided
            const hasAtLeastOneReading = [temperature, humidity, lighting, co2].some(value => value !== undefined);

            if (!hasAtLeastOneReading) {
                return res.status(400).send('At least one sensor reading (temperature, humidity, lighting, co2) must be provided');
            }

            await db.execute(
                'INSERT INTO SensorData (dateTime, id, temperature, humidity, lighting, co2) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE temperature = VALUES(temperature), humidity = VALUES(humidity), lighting = VALUES(lighting), co2 = VALUES(co2)',
                [
                    timestamp,
                    id,
                    temperature !== undefined ? temperature : null,
                    humidity !== undefined ? humidity : null,
                    lighting !== undefined ? lighting : null,
                    co2 !== undefined ? co2 : null
                ]
            );
        }
        res.status(200).send('Sensor data updated successfully');
    } catch (error) {
        res.status(500).send('Error updating sensor data: ' + error.message);
    }
});

//Read user filtered sensor data
router.get('/read', async (req, res) => {
    const period = req.query.period || 'all';
    let query = 'SELECT * FROM SensorData';
    let params = [];

    const now = new Date();
    let timeThreshold;

    switch (period) {
        case 'last_hour':
            timeThreshold = new Date(now.getTime() - 60 * 60 * 1000);
            break;
        case 'last_30_minutes':
            timeThreshold = new Date(now.getTime() - 30 * 60 * 1000);
            break;
        case 'last_24_hours':
            timeThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
        case 'last_2_weeks':
            timeThreshold = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
            break;
        default:
            timeThreshold = null; // Default to all data if period is not recognized
    }

    if (timeThreshold) {
        query += ' WHERE dateTime >= ?';
        params.push(timeThreshold);
    }

    try {
        const [rows] = await db.execute(query, params);

        const formattedData = rows.map(row => ({
            timestamp: row.dateTime,
            data: {
                temperature: row.temperature,
                humidity: row.humidity,
                lighting: row.lighting,
                co2: row.co2
            }
        }));

        res.json(formattedData);
    } catch (error) {
        res.status(500).send('Error reading sensor data: ' + error.message);
    }
});

//Retrieve last 2 sensor data
router.get('/last', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM SensorData ORDER BY dateTime DESC LIMIT 2');

        if (rows.length === 0) {
            return res.status(404).send('No sensor data found');
        }

        const formattedData = rows.map(row => ({
            timestamp: row.dateTime,
            data: {
                temperature: row.temperature,
                humidity: row.humidity,
                lighting: row.lighting,
                co2: row.co2
            }
        }));

        res.json(formattedData);
    } catch (error) {
        res.status(500).send('Error reading the last sensor data: ' + error.message);
    }
});

module.exports = router;
