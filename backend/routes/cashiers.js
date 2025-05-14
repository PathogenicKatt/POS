const express = require('express');
const router = express.Router();
const { executeQuery } = require('../oracle');

router.get('/current', async (req, res) => {
  try {
    const cashier = await executeQuery(`
      SELECT 
        e.FirstName || ' ' || e.LastName AS NAME,
        c.registerLocation AS LOCATION
      FROM Cashier c
      JOIN Employee e ON c.EmployeeID = e.EmployeeID
      WHERE ROWNUM = 1
    `);

    if (cashier.length === 0) {
      return res.status(404).json({ success: false, error: 'No cashier found' });
    }

    res.json({ success: true, cashier: cashier[0] });

  } catch (err) {
    console.error('Cashier error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;


