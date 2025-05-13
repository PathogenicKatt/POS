const API_BASE = 'http://localhost:3000';

export const API = {
    getReports: async () => {
        const response = await fetch(`${API_BASE}/api/sales/reports`);
        if (!response.ok) throw new Error('API request failed');
        return await response.json();
    }
};