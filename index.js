// index.js
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const sensorRoutes = require('./routes/sensor');
const actuatorRoutes = require('./routes/actuator');
const parameterRoutes = require('./routes/parameter');
const userRoutes = require('./routes/user');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use('/sensor', sensorRoutes);
app.use('/actuator', actuatorRoutes);
app.use('/parameter', parameterRoutes);
app.use('/user', userRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
