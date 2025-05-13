const express = require('express');
const { executeQuery } = require('../oracle');
const router = express.Router();

router.get('/reports', async (req, res) => {
  try {
    const [topProducts, deptSales] = await Promise.all([
      executeQuery(`
        SELECT p.ProductName, SUM(sd.QuantitySold) as total 
        FROM SaleDetail sd
        JOIN Product p ON sd.ProductID = p.ProductID
        GROUP BY p.ProductName 
        ORDER BY total DESC 
        FETCH FIRST 5 ROWS ONLY`
      ),
      executeQuery(`
        SELECT d.Department, SUM(s.TotalAmount) as revenue
        FROM Sale s
        JOIN Employee e ON s.EmployeeID = e.EmployeeID
        JOIN Department d ON e.DepartmentID = d.DepartmentID
        GROUP BY d.Department`
      )
    ]);
    
    res.json({ 
      success: true,
      topProducts,
      deptSales,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

module.exports = router;