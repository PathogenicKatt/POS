const API = {
  getReports: async () => {
    const response = await fetch('http://localhost:3000/api/sales/reports');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  }
};