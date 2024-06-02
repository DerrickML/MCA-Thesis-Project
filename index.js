// index.js
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const sensorRoutes = require('./routes/sensor');
const actuatorRoutes = require('./routes/actuator');
const userRoutes = require('./routes/user');

dotenv.config();

const app = express();
app.use(bodyParser.json());

app.use('/sensor', sensorRoutes);
app.use('/actuator', actuatorRoutes);
app.use('/user', userRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
