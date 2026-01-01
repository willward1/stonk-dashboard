// RKLB 1-Year Stock Chart
const symbol = 'RKLB';
let chart;

async function fetchStockData() {
    try {
        // Fetch 1 year of data from Yahoo Finance
        const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1y`);

        if (!response.ok) {
            throw new Error('Failed to fetch stock data');
        }

        const data = await response.json();

        if (data.chart.error) {
            throw new Error(data.chart.error.description);
        }

        const result = data.chart.result[0];
        const timestamps = result.timestamp;
        const prices = result.indicators.quote[0].close;

        // Convert timestamps to dates
        const dates = timestamps.map(ts => {
            const date = new Date(ts * 1000);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        });

        // Filter out null prices
        const cleanedData = dates.map((date, index) => ({
            date,
            price: prices[index]
        })).filter(item => item.price !== null);

        const labels = cleanedData.map(item => item.date);
        const priceData = cleanedData.map(item => item.price);

        createChart(labels, priceData);

    } catch (error) {
        console.error('Error fetching stock data:', error);
        document.querySelector('.chart-container').innerHTML = `
            <div style="text-align: center; padding: 100px 20px;">
                <h2 style="color: #ef4444; margin-bottom: 10px;">Failed to Load Chart</h2>
                <p style="color: #666;">${error.message}</p>
                <button onclick="location.reload()" style="margin-top: 20px; padding: 12px 24px; background: #333; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem;">
                    Retry
                </button>
            </div>
        `;
    }
}

function createChart(labels, data) {
    const ctx = document.getElementById('stockChart').getContext('2d');

    // Calculate gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)');
    gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'RKLB Price (USD)',
                data: data,
                borderColor: '#22c55e',
                backgroundColor: gradient,
                borderWidth: 2,
                fill: true,
                tension: 0.1,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#22c55e',
                pointHoverBorderColor: 'white',
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 14,
                            weight: '600'
                        },
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            return 'Price: $' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        font: {
                            size: 11
                        },
                        maxTicksLimit: 12
                    }
                },
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(2);
                        },
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

// Initialize chart on page load
fetchStockData();
