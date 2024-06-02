// routes/sensor.js
const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/update', async (req, res) => {
    const sensors = req.body;
    try {
        for (const sensor of sensors) {
            const { dateTime, id, temperature, humidity, lighting, co2 } = sensor;
            await db.execute(
                'INSERT INTO SensorData (dateTime, id, temperature, humidity, lighting, co2) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE temperature = VALUES(temperature), humidity = VALUES(humidity), lighting = VALUES(lighting), co2 = VALUES(co2)',
                [dateTime, id, temperature || null, humidity || null, lighting || null, co2 || null]
            );
        }
        res.status(200).send('Sensor data updated successfully');
    } catch (error) {
        res.status(500).send('Error updating sensor data: ' + error.message);
    }
});

router.get('/read', async (req, res) => {
    const period = req.query.period || 'all';
    try {
        const [rows] = await db.execute('SELECT * FROM SensorData');
        const filteredData = filterDataByPeriod(rows, period);
        res.json(filteredData);
    } catch (error) {
        res.status(500).send('Error reading sensor data: ' + error.message);
    }
});

const filterDataByPeriod = (data, period) => {
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
            timeThreshold = new Date(0); // Default to all data if period is not recognized
    }

    return data.filter(entry => new Date(entry.dateTime) >= timeThreshold);
};

module.exports = router;
