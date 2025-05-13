// routes/cashiers.js
const express = require('express');
const { executeQuery } = require('../oracle');
const router = express.Router();

router.get('/current', async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT e.FirstName || ' ' || e.LastName AS fullName,
             c.RegisterLocation
      FROM Cashier c
      JOIN Employee e ON c.EmployeeID = e.EmployeeID
      WHERE ROWNUM = 1
    `);

    if (result.length === 0) {
      return res.status(404).json({ success: false, error: 'No cashier found' });
    }

    res.json({ success: true, cashier: result[0] });
  } catch (err) {
    console.error('Cashier API error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;

