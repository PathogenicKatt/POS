const express = require('express');
const { executeQuery } = require('../oracle');
const router = express.Router();

router.get('/reports', async (req, res) => {
  try {
    const [topProducts, deptSales, dailySummary] = await Promise.all([
      executeQuery(`
        SELECT 
          p.ProductName AS PRODUCTNAME, 
          SUM(sd.QuantitySold) AS TOTAL,
          AVG(sd.PriceAtSale) AS PRICE
        FROM SaleDetail sd
        JOIN Product p ON sd.ProductID = p.ProductID
        GROUP BY p.ProductName 
        ORDER BY TOTAL DESC 
        FETCH FIRST 5 ROWS ONLY`
      ),
      executeQuery(`
        SELECT 
          pc.CategoryName AS DEPARTMENT,
          SUM(sd.QuantitySold * sd.PriceAtSale) AS REVENUE
        FROM SaleDetail sd
        JOIN Product p ON sd.ProductID = p.ProductID
        JOIN ProductCategory pc ON p.CategoryID = pc.CategoryID
        GROUP BY pc.CategoryName`
      ),
      executeQuery(`
        SELECT 
          NVL(COUNT(DISTINCT s.SaleID), 0) AS TRANSACTIONS,
          NVL(SUM(s.TotalAmount), 0) AS TOTAL_SALES
        FROM Sale s
        WHERE TRUNC(s.SaleDate) = TRUNC(SYSDATE)`
      )
    ]);
    
    res.json({ 
      success: true,
      topProducts,
      deptSales,
      dailySummary: dailySummary[0]
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