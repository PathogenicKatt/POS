// frontend/js/api.js
const API_BASE = 'http://localhost:3000'; // Replace with your deployed URL if needed

const API = {
  getReports: async () => {
    try {
      const response = await fetch(`${API_BASE}/api/sales/reports`);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Validate response structure
      if (!data.success) {
        throw new Error(data.error || 'Invalid report data');
      }

      // Ensure all required fields exist with fallbacks
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
      
      // Return safe empty data structure
      return {
        topProducts: [],
        deptSales: [],
        dailySummary: { TOTAL_SALES: 0, TRANSACTIONS: 0 }
      };
    }
  }
};

// For non-module compatibility (if needed)
if (typeof window !== 'undefined') {
  window.API = API;
}

// For module compatibility (if needed)
export { API };