const express = require('express');
const router = express.Router();
const { executeQuery } = require('../oracle');

// Get product list
router.get('/products', async (req, res) => {
  try {
    const rows = await executeQuery(`
      SELECT ProductID AS ID, ProductName AS NAME, PRICE, CategoryID AS CATEGORYID
      FROM Product
    `);
    res.json({ success: true, products: rows });
  } catch (err) {
    console.error('Product Fetch Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create sale
router.post('/', async (req, res) => {
  const { items, subtotal, vat, total, paymentMethod, employeeId } = req.body;

  const saleIdQuery = `SELECT NVL(MAX(SaleID), 0) + 1 AS NEXT_ID FROM Sale`;
  let connection;

  try {
    const result = await executeQuery(saleIdQuery);
    const newSaleID = result[0].NEXT_ID;

    await executeQuery(
      `INSERT INTO Sale (SaleID, SaleDate, TotalAmount) VALUES (:id, SYSDATE, :total)`,
      [newSaleID, total]
    );

    for (let i = 0; i < items.length; i++) {
      await executeQuery(
        `INSERT INTO SaleDetail (SaleID, ProductID, SaleLineNumber, QuantitySold, PriceAtSale)
         VALUES (:saleId, :prodId, :line, :qty, :price)`,
        [newSaleID, items[i].ID, i + 1, items[i].quantity, items[i].PRICE]
      );
    }

    await executeQuery(
      `INSERT INTO Payment (PaymentID, SaleID, PaymentMethod, AmountPaid)
       VALUES (PaymentID_value.NEXTVAL, :saleId, :method, :amount)`,
      [newSaleID, paymentMethod, total]
    );

    res.json({
      success: true,
      receipt: {
        cashier: employeeId,
        items: items.map(i => ({ name: i.NAME, quantity: i.quantity, price: i.PRICE })),
        subtotal,
        vat,
        total,
        paymentMethod
      }
    });
  } catch (err) {
    console.error('Create Sale Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

// ============================
// 📦 routes/cashiers.js
// ============================
const expressCashier = require('express');
const cashierRouter = expressCashier.Router();
const { executeQuery: execCashier } = require('../oracle');

cashierRouter.get('/current', async (req, res) => {
  try {
    const result = await execCashier(`
      SELECT c.EmployeeID, e.FirstName || ' ' || e.LastName AS NAME, c.registerLocation AS LOCATION
      FROM Cashier c JOIN Employee e ON c.EmployeeID = e.EmployeeID
      FETCH FIRST 1 ROWS ONLY
    `);

    if (result.length === 0) {
      return res.json({ success: false, error: 'No cashier found' });
    }

    res.json({ success: true, cashier: result[0] });
  } catch (err) {
    console.error('Cashier fetch error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = cashierRouter;

