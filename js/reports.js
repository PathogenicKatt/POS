import { API } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    async function loadReports() {
        try {
            const data = await API.getReports();
            console.log('Reports data:', data);
            // Your existing report rendering code here
        } catch (err) {
            console.error('Failed to load reports:', err);
            alert('Error loading reports. Check console.');
        }
    }

    document.getElementById('refresh-btn')?.addEventListener('click', loadReports);
    loadReports();
});