// frontend/js/reports.js
document.addEventListener('DOMContentLoaded', async () => {
    const loadReports = async () => {
        try {
            if (!window.API) {
                throw new Error('API is not loaded');
            }
            
            const data = await window.API.getReports();
            console.log('Reports data:', data);
            
            // Render your reports here
            document.getElementById('daily-summary').innerHTML = `
                <p>Total Sales: R ${data.totalSales.toFixed(2)}</p>
                <p>Total Transactions: ${data.transactionCount}</p>
            `;
            
        } catch (error) {
            console.error('Failed to load reports:', error);
            alert('Error loading reports. See console for details.');
        }
    };

    document.getElementById('refresh-btn')?.addEventListener('click', loadReports);
    loadReports();
});