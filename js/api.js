const API_BASE = 'http://localhost:3000'; // Change to your backend IP if remote

const API = {
  getProducts: async () => {
    try {
      const response = await fetch(`${API_BASE}/api/sales/products`);
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Invalid product data');
      return data.products;
    } catch (error) {
      console.error('Product API Error:', error);
      return [];
    }
  },

  getCurrentCashier: async () => {
    try {
      const response = await fetch(`${API_BASE}/api/cashiers/current`);
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.cashier;
    } catch (err) {
      console.error('Cashier API Error:', err);
      return null;
    }
  },

  createSale: async (saleData) => {
    try {
      const response = await fetch(`${API_BASE}/api/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Sale failed');
      return data;
    } catch (err) {
      console.error('Create Sale Error:', err);
      return { success: false };
    }
  }
};

window.API = API;

