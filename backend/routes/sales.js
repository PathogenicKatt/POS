const express = require('express');
const { executeQuery } = require('../oracle');
const router = express.Router();

// Insert into SALE and SaleDetail tables (transaction)
router.post('/', async (req, res) => {
  const { products, employeeId, paymentMethod } = req.body;
  
  try {
    // 1. Create SALE record
    const saleResult = await executeQuery(
      `INSERT INTO Sale (SaleID, SaleDate, TotalAmount) 
       VALUES (sale_seq.NEXTVAL, SYSDATE, :total)
       RETURNING SaleID INTO :id`,
      {
        total: products.reduce((sum, p) => sum + (p.price * p.quantity), 0),
        id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      }
    );
    
    const saleId = saleResult.outBinds.id[0];
    
    // 2. Insert SaleDetail records
    for (const [idx, product] of products.entries()) {
      await executeQuery(
        `INSERT INTO SaleDetail 
         (SaleID, ProductID, SaleLineNUmber, QuantitySold, PriceAtSale)
         VALUES (:saleId, :productId, :lineNum, :qty, :price)`,
        {
          saleId,
          productId: product.id,
          lineNum: idx + 1,
          qty: product.quantity,
          price: product.price
        }
      );
    }
    
    // 3. Record payment
    await executeQuery(
      `INSERT INTO Payment (PaymentID, SaleID, PaymentMethod, AmountPaid)
       VALUES (PaymentID_value.NEXTVAL, :saleId, :method, :amount)`,
      {
        saleId,
        method: paymentMethod,
        amount: products.reduce((sum, p) => sum + (p.price * p.quantity), 0)
      }
    );
    
    res.json({ 
      success: true, 
      saleId,
      message: `Sale #${saleId} recorded`
    });
    
  } catch (err) {
    console.error('Sale error:', err);
    res.status(500).json({ 
      error: 'Database error',
      details: err.message 
    });
  }
});

// Get sales report data
router.get('/reports', async (req, res) => {
  try {
    const [topProducts, deptSales] = await Promise.all([
      executeQuery(
        `SELECT p.ProductName, SUM(sd.QuantitySold) as total 
         FROM SaleDetail sd
         JOIN Product p ON sd.ProductID = p.ProductID
         GROUP BY p.ProductName 
         ORDER BY total DESC 
         FETCH FIRST 5 ROWS ONLY`
      ),
      executeQuery(
        `SELECT d.Department, SUM(s.TotalAmount) as revenue
         FROM Sale s
         JOIN Employee e ON s.EmployeeID = e.EmployeeID
         JOIN Department d ON e.DepartmentID = d.DepartmentID
         GROUP BY d.Department`
      )
    ]);
    
    res.json({ topProducts, deptSales });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;