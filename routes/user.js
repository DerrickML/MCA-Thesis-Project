// routes/user.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

// Create user
router.post('/create', async (req, res) => {
    const { firstName, lastName, otherName, email, phone, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute(
            'INSERT INTO Users (firstName, lastName, otherName, email, phone, password) VALUES (?, ?, ?, ?, ?, ?)',
            [firstName, lastName, otherName, email, phone, hashedPassword]
        );
        res.status(201).send('User created successfully');
    } catch (error) {
        res.status(500).send('Error creating user: ' + error.message);
    }
});

// Update user
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const fields = [];
    const values = [];

    for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
            fields.push(`${key} = ?`);
            values.push(key === 'password' ? await bcrypt.hash(updates[key], 10) : updates[key]);
        }
    }

    values.push(id);

    const query = `UPDATE Users SET ${fields.join(', ')} WHERE userId = ?`;

    try {
        await db.execute(query, values);
        res.status(200).send('User updated successfully');
    } catch (error) {
        res.status(500).send('Error updating user: ' + error.message);
    }
});

module.exports = router;
