const express = require('express');
const { executeQuery } = require('../oracle');
const router = express.Router();

router.get('/reports', async (req, res) => {
  try {
    const [topProducts, deptSales, dailySummary] = await Promise.all([
      // Top products with prices
      executeQuery(`
        SELECT 
          p.ProductName, 
          SUM(sd.QuantitySold) as total,
          AVG(sd.PriceAtSale) as price
        FROM SaleDetail sd
        JOIN Product p ON sd.ProductID = p.ProductID
        GROUP BY p.ProductName 
        ORDER BY total DESC 
        FETCH FIRST 5 ROWS ONLY`
      ),
      
      // Department sales
      executeQuery(`
        SELECT 
          pc.CategoryName AS Department,
          SUM(sd.QuantitySold * sd.PriceAtSale) AS revenue
        FROM SaleDetail sd
        JOIN Product p ON sd.ProductID = p.ProductID
        JOIN ProductCategory pc ON p.CategoryID = pc.CategoryID
        GROUP BY pc.CategoryName`
      ),
      
      // Daily summary
      executeQuery(`
        SELECT 
          COUNT(DISTINCT s.SaleID) as transactions,
          SUM(s.TotalAmount) as total_sales
        FROM Sale s
        WHERE TRUNC(s.SaleDate) = TRUNC(SYSDATE)`
      )
    ]);
    
    res.json({ 
      success: true,
      topProducts,
      deptSales,
      dailySummary: dailySummary[0] // Get first row
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