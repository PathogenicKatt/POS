const API_BASE = 'http://localhost:3000';

export const API = {
  createSale: async (cartItems, employeeId, paymentMethod) => {
    const response = await fetch(`${API_BASE}/api/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        products: cartItems.map(item => ({
          id: item.ProductID,
          price: item.Price,
          quantity: item.quantity
        })),
        employeeId,
        paymentMethod
      })
    });
    return await response.json();
  },

  getReports: async () => {
    const response = await fetch(`${API_BASE}/api/sales/reports`);
    return await response.json();
  }
};