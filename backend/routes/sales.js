// routes/sales.js
const express = require('express');
const { pool, executeQuery } = require('../oracle');
const oracledb = require('oracledb');
const router = express.Router();

router.get('/products', async (req, res) => {
  try {
    const products = await executeQuery(`
      SELECT ProductID AS id, ProductName AS name, Price, Quantity, CategoryID AS category
      FROM Product
    `);
    res.json({ success: true, products });
  } catch (err) {
    console.error('Product fetch error:', err);
    res.status(500).json({ success: false, error: 'Failed to load products' });
  }
});

router.get('/reports', async (req, res) => {
  try {
    const [topProducts, deptSales, dailySummary] = await Promise.all([
      executeQuery(`
        SELECT p.ProductName AS PRODUCTNAME, 
               SUM(sd.QuantitySold) AS TOTAL,
               AVG(sd.PriceAtSale) AS PRICE
        FROM SaleDetail sd
        JOIN Product p ON sd.ProductID = p.ProductID
        GROUP BY p.ProductName 
        ORDER BY TOTAL DESC 
        FETCH FIRST 5 ROWS ONLY`),
      executeQuery(`
        SELECT pc.CategoryName AS DEPARTMENT,
               SUM(sd.QuantitySold * sd.PriceAtSale) AS REVENUE
        FROM SaleDetail sd
        JOIN Product p ON sd.ProductID = p.ProductID
        JOIN ProductCategory pc ON p.CategoryID = pc.CategoryID
        GROUP BY pc.CategoryName`),
      executeQuery(`
        SELECT NVL(COUNT(DISTINCT s.SaleID), 0) AS TRANSACTIONS,
               NVL(SUM(s.TotalAmount), 0) AS TOTAL_SALES
        FROM Sale s
        WHERE TRUNC(s.SaleDate) = TRUNC(SYSDATE)`)
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

router.post('/', async (req, res) => {
  const { items, subtotal, vat, total, timestamp, paymentMethod, employeeId } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, error: 'No items in sale' });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    const saleIdResult = await connection.execute(`SELECT SaleID_value.NEXTVAL AS saleId FROM dual`);
    const saleId = saleIdResult.rows[0].SALEID;

    await connection.execute(
      `INSERT INTO Sale (SaleID, SaleDate, TotalAmount)
       VALUES (:saleId, TO_DATE(:timestamp, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"'), :total)`,
      { saleId, timestamp, total }
    );

    let lineNumber = 1;
    for (const item of items) {
      await connection.execute(
        `INSERT INTO SaleDetail (SaleID, ProductID, SaleLineNumber, QuantitySold, PriceAtSale)
         VALUES (:saleId, :productId, :lineNumber, :quantity, :price)`,
        {
          saleId,
          productId: item.id,
          lineNumber,
          quantity: item.quantity,
          price: item.price
        }
      );

      await connection.execute(
        `UPDATE Product SET Quantity = Quantity - :qty WHERE ProductID = :productId`,
        { qty: item.quantity, productId: item.id }
      );

      lineNumber++;
    }

    const paymentIdResult = await connection.execute(`SELECT PaymentID_value.NEXTVAL AS paymentId FROM dual`);
    const paymentId = paymentIdResult.rows[0].PAYMENTID;

    await connection.execute(
      `INSERT INTO Payment (PaymentID, SaleID, PaymentMethod, AmountPaid)
       VALUES (:paymentId, :saleId, :method, :amount)`,
      { paymentId, saleId, method: paymentMethod, amount: total }
    );

    await connection.commit();

    res.json({
      success: true,
      receipt: {
        vatNumber: "1234567890",
        date: new Date().toLocaleString(),
        cashier: "Employee", // You can personalize this later
        paymentMethod,
        items,
        subtotal,
        vat,
        total
      }
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error recording sale:', err);
    res.status(500).json({ success: false, error: 'Sale failed' });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;


