router.get('/reports', async (req, res) => {
  try {
    const [topProducts, deptSales] = await Promise.all([
      // Top products query (unchanged)
      executeQuery(`
        SELECT p.ProductName, SUM(sd.QuantitySold) as total 
        FROM SaleDetail sd
        JOIN Product p ON sd.ProductID = p.ProductID
        GROUP BY p.ProductName 
        ORDER BY total DESC 
        FETCH FIRST 5 ROWS ONLY`
      ),
      
      // Department sales (updated)
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