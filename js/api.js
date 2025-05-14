const API_BASE = 'http//localhost:3000'; // update with your Render URL

const API = {
  getReports: async () => {
    try {
      const response = await fetch(`${API_BASE}/api/sales/reports`);
      if (!response.ok) throw new Error(`Server returned ${response.status}`);

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Invalid report data');

      return {
        topProducts: data.topProducts?.map(p => ({
          PRODUCTNAME: p.PRODUCTNAME || 'Unknown',
          TOTAL: Number(p.TOTAL) || 0,
          PRICE: Number(p.PRICE) || 0
        })) || [],
        
        deptSales: data.deptSales?.map(d => ({
          DEPARTMENT: d.DEPARTMENT || 'General',
          REVENUE: Number(d.REVENUE) || 0
        })) || [],
        
        dailySummary: {
          TOTAL_SALES: Number(data.dailySummary?.TOTAL_SALES) || 0,
          TRANSACTIONS: Number(data.dailySummary?.TRANSACTIONS) || 0
        }
      };

    } catch (error) {
      console.error('API Error:', error);
      return {
        topProducts: [],
        deptSales: [],
        dailySummary: { TOTAL_SALES: 0, TRANSACTIONS: 0 }
      };
    }
  },

  getProducts: async () => {
    try {
      const response = await fetch(`${API_BASE}/api/sales/products`);
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const data = await response.json();

      if (!Array.isArray(data.products)) throw new Error('Invalid product array');

      // 🔁 Convert UPPERCASE keys to expected frontend keys
      return data.products.map(p => ({
        id: p.ID,
        name: p.NAME,
        price: p.PRICE,
        quantity: p.QUANTITY,
        category: p.CATEGORYID
      }));

    } catch (error) {
      console.error('Product API Error:', error);
      return [];
    }
  },

  createSale: async (saleData) => {
    try {
      const response = await fetch(`${API_BASE}/api/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Create Sale Error:', error);
      return { success: false };
    }
  },

  getCurrentCashier: async () => {
    try {
      const response = await fetch(`${API_BASE}/api/cashiers/current`);
      const data = await response.json();
      return data.success ? data.cashier : null;
    } catch (error) {
      console.error('Cashier API Error:', error);
      return null;
    }
  }
};

// Make available globally
window.API = API;

