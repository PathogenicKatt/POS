const API_BASE = 'http://localhost:3000';

const API = {
  getReports: async () => {
    try {
      const response = await fetch(`${API_BASE}/api/sales/reports`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'API request failed');
      
      return {
        topProducts: data.topProducts || [],
        deptSales: data.deptSales || [],
        dailySummary: data.dailySummary || { TRANSACTIONS: 0, TOTAL_SALES: 0 }
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        topProducts: [],
        deptSales: [],
        dailySummary: { TRANSACTIONS: 0, TOTAL_SALES: 0 }
      };
    }
  }
};

// Make available globally
window.API = API;