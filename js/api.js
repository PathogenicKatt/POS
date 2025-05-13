// frontend/js/api.js
const API_BASE = 'http://localhost:3000'; // Change to your backend URL if deployed

const API = {
    getReports: async () => {
        try {
            const response = await fetch(`${API_BASE}/api/sales/reports`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
};

// Make API globally available for non-module scripts
if (typeof window !== 'undefined') {
    window.API = API;
}

export { API };