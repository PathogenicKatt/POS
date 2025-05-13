const express = require('express');
const { executeQuery } = require('../oracle');
const router = express.Router(); // This line was missing

// Reports endpoint
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
        SELECT 
          pc.CategoryName AS Department,
          SUM(sd.QuantitySold * sd.PriceAtSale) AS revenue
        FROM SaleDetail sd
        JOIN Product p ON sd.ProductID = p.ProductID
        JOIN ProductCategory pc ON p.CategoryID = pc.CategoryID
        GROUP BY pc.CategoryName`
      )
    ]);
    
    res.json({ 
      success: true,
      topProducts,
      deptSales
    });
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

module.exports = router; // Don't forget to export