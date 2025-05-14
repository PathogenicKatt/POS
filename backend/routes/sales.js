const express = require('express');
const router = express.Router();
const { executeQuery } = require('../oracle');

// 🔍 GET reports for top products, revenue per department, and daily summary
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
        FETCH FIRST 5 ROWS ONLY
      `),
      executeQuery(`
        SELECT 
          pc.CategoryName AS DEPARTMENT,
          SUM(sd.QuantitySold * sd.PriceAtSale) AS REVENUE
        FROM SaleDetail sd
        JOIN Product p ON sd.ProductID = p.ProductID
        JOIN ProductCategory pc ON p.CategoryID = pc.CategoryID
        GROUP BY pc.CategoryName
      `),
      executeQuery(`
        SELECT 
          NVL(COUNT(DISTINCT s.SaleID), 0) AS TRANSACTIONS,
          NVL(SUM(s.TotalAmount), 0) AS TOTAL_SALES
        FROM Sale s
        WHERE TRUNC(s.SaleDate) = TRUNC(SYSDATE)
      `)
    ]);

    res.json({
      success: true,
      topProducts,
      deptSales,
      dailySummary: dailySummary[0]
    });
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🛍️ GET all products for the POS product grid
router.get('/products', async (req, res) => {
  try {
    const rows = await executeQuery(`
      SELECT 
        ProductID AS ID,
        ProductName AS NAME,
        Price AS PRICE,
        Quantity AS QUANTITY,
        CategoryID AS CATEGORYID
      FROM Product
    `);
    res.json({ success: true, products: rows });
  } catch (err) {
    console.error('Products error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 💳 POST a new sale
router.post('/', async (req, res) => {
  const connection = await require('oracledb').getConnection();

  try {
    const { items, subtotal, vat, total, timestamp, paymentMethod, employeeId } = req.body;

    await connection.execute('BEGIN', [], { autoCommit: false });

    // Get new SaleID
    const saleIdResult = await connection.execute(
      `SELECT NVL(MAX(SaleID), 0) + 1 AS ID FROM Sale`
    );
    const saleId = saleIdResult.rows[0].ID;

    // Insert into Sale table
    await connection.execute(
      `INSERT INTO Sale (SaleID, SaleDate, TotalAmount) VALUES (:id, TO_DATE(:date, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"'), :amount)`,
      [saleId, timestamp, total]
    );

    // Insert items into SaleDetail
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await connection.execute(
        `INSERT INTO SaleDetail (SaleID, ProductID, SaleLineNumber, QuantitySold, PriceAtSale) 
         VALUES (:saleId, :productId, :lineNumber, :qty, :price)`,
        {
          saleId,
          productId: item.id,
          lineNumber: i + 1,
          qty: item.quantity,
          price: item.price
        }
      );

      // Reduce stock
      await connection.execute(
        `UPDATE Product SET Quantity = Quantity - :qty WHERE ProductID = :id`,
        { qty: item.quantity, id: item.id }
      );
    }

    // Add to Payment table (optional)
    await connection.execute(
      `INSERT INTO Payment (PaymentID, SaleID, PaymentMethod, AmountPaid)
       VALUES (PaymentID_value.NEXTVAL, :saleId, :method, :amount)`,
      { saleId, method: paymentMethod, amount: total }
    );

    await connection.commit();

    res.json({
      success: true,
      receipt: {
        items,
        subtotal,
        vat,
        total,
        vatNumber: '4534567879',
        paymentMethod,
        cashier: 'Cashier X',
        date: new Date(timestamp).toLocaleString()
      }
    });

  } catch (err) {
    console.error('Sale error:', err);
    await connection.rollback();
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await connection.close();
  }
});

module.exports = router;
