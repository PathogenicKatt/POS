// js/api.js
const API_BASE = 'http://localhost:3000';

const API = {
  getProducts: async () => {
    try {
      const response = await fetch(`${API_BASE}/api/sales/products`);
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error('Product API Error:', error);
      return [];
    }
  },

  getReports: async () => {
    try {
      const response = await fetch(`${API_BASE}/api/sales/reports`);
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Invalid report data');
      return {
        topProducts: data.topProducts || [],
        deptSales: data.deptSales || [],
        dailySummary: data.dailySummary || {}
      };
    } catch (error) {
      console.error('Report API Error:', error);
      return { topProducts: [], deptSales: [], dailySummary: {} };
    }
  },

  getCurrentCashier: async () => {
    try {
      const response = await fetch(`${API_BASE}/api/cashiers/current`);
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'No cashier found');
      return data.cashier;
    } catch (error) {
      console.error('Cashier API Error:', error);
      return { fullName: 'Unavailable', RegisterLocation: 'Unknown' };
    }
  },

  createSale: async (saleData) => {
    try {
      const response = await fetch(`${API_BASE}/api/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      });
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Sale API Error:', error);
      return { success: false, error: error.message };
    }
  }
};

window.API = API;
