const express = require('express');
const router = express.Router();
const { executeQuery } = require('../oracle');

// For demo, return any single cashier
router.get('/current', async (req, res) => {
  try {
    const rows = await executeQuery(`
      SELECT e.FirstName || ' ' || e.LastName AS NAME, c.registerLocation AS LOCATION
      FROM Cashier c
      JOIN Employee e ON c.EmployeeID = e.EmployeeID
      FETCH FIRST 1 ROWS ONLY
    `);

    if (rows.length > 0) {
      res.json({ success: true, cashier: rows[0] });
    } else {
      res.json({ success: false, error: 'No cashier found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;



