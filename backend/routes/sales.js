// routes/sales.js (include with your GET /reports logic)
const express = require('express');
const { pool } = require('../oracle');
const oracledb = require('oracledb');

const router = express.Router();

router.post('/', async (req, res) => {
  const { items, subtotal, vat, total, timestamp, paymentMethod, employeeId } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, error: 'No items in sale' });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // 1. Generate new SaleID
    const saleIdResult = await connection.execute(
      `SELECT SaleID_value.NEXTVAL AS saleId FROM dual`
    );
    const saleId = saleIdResult.rows[0].SALEID;

    // 2. Insert into SALE
    await connection.execute(
      `INSERT INTO Sale (SaleID, SaleDate, TotalAmount)
       VALUES (:saleId, TO_DATE(:timestamp, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"'), :total)`,
      { saleId, timestamp, total }
    );

    // 3. Insert into SALEDETAIL
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

      // Update product stock
      await connection.execute(
        `UPDATE Product SET Quantity = Quantity - :qty WHERE ProductID = :productId`,
        { qty: item.quantity, productId: item.id }
      );

      lineNumber++;
    }

    // 4. Insert into PAYMENT
    const paymentIdResult = await connection.execute(
      `SELECT PaymentID_value.NEXTVAL AS paymentId FROM dual`
    );
    const paymentId = paymentIdResult.rows[0].PAYMENTID;

    await connection.execute(
      `INSERT INTO Payment (PaymentID, SaleID, PaymentMethod, AmountPaid)
       VALUES (:paymentId, :saleId, :method, :amount)`,
      { paymentId, saleId, method: paymentMethod, amount: total }
    );

    await connection.commit();

    // Return receipt
    res.json({
      success: true,
      receipt: {
        vatNumber: "1234567890",
        date: new Date().toLocaleString(),
        cashier: "Employee", // You can look up the actual name later if needed
        paymentMethod,
        items,
        subtotal,
        vat,
        total
      }
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error inserting sale:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;

