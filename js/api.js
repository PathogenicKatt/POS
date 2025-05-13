// js/api.js
const API_BASE = 'http://localhost:3000';

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

  getCurrentCashier: async () => {
    try {
      const response = await fetch(`${API_BASE}/api/cashiers/current`);
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Invalid cashier data');
      return data.cashier;
    } catch (error) {
      console.error('Cashier API Error:', error);
      return { fullName: 'Unavailable', RegisterLocation: 'N/A' };
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
},

};

window.API = API;
