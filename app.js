// Stock Events Dashboard
const stockInput = document.getElementById('stockInput');
const addStockBtn = document.getElementById('addStockBtn');
const stockCards = document.getElementById('stockCards');
const eventsLog = document.getElementById('eventsLog');

let watchlist = [];
let previousPrices = {};
let updateInterval;

// Load watchlist from localStorage
function loadWatchlist() {
    const saved = localStorage.getItem('stockWatchlist');
    if (saved) {
        watchlist = JSON.parse(saved);
        watchlist.forEach(symbol => fetchStockData(symbol));
    } else {
        // Add some default stocks
        watchlist = ['AAPL', 'GOOGL', 'MSFT'];
        saveWatchlist();
        watchlist.forEach(symbol => fetchStockData(symbol));
    }
}

// Save watchlist to localStorage
function saveWatchlist() {
    localStorage.setItem('stockWatchlist', JSON.stringify(watchlist));
}

// Add stock to watchlist
function addStock() {
    const symbol = stockInput.value.trim().toUpperCase();
    if (!symbol) return;

    if (watchlist.includes(symbol)) {
        addEvent(`${symbol} is already in your watchlist`, 'info');
        stockInput.value = '';
        return;
    }

    watchlist.push(symbol);
    saveWatchlist();
    fetchStockData(symbol);
    stockInput.value = '';
    addEvent(`Added ${symbol} to watchlist`, 'info');
}

// Remove stock from watchlist
function removeStock(symbol) {
    watchlist = watchlist.filter(s => s !== symbol);
    saveWatchlist();
    delete previousPrices[symbol];
    updateStockCards();
    addEvent(`Removed ${symbol} from watchlist`, 'info');
}

// Fetch stock data using Yahoo Finance API
async function fetchStockData(symbol) {
    try {
        // Using a free Yahoo Finance API proxy
        const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`);

        if (!response.ok) {
            throw new Error('Failed to fetch stock data');
        }

        const data = await response.json();

        if (data.chart.error) {
            throw new Error(data.chart.error.description);
        }

        const result = data.chart.result[0];
        const quote = result.meta;
        const indicators = result.indicators.quote[0];

        const stockData = {
            symbol: symbol,
            name: quote.shortName || symbol,
            price: quote.regularMarketPrice,
            change: quote.regularMarketPrice - quote.previousClose,
            changePercent: ((quote.regularMarketPrice - quote.previousClose) / quote.previousClose) * 100,
            open: indicators.open[0],
            high: Math.max(...indicators.high.filter(h => h !== null)),
            low: Math.min(...indicators.low.filter(l => l !== null)),
            volume: indicators.volume[indicators.volume.length - 1],
            marketCap: quote.marketCap
        };

        checkPriceEvents(stockData);
        updateStockCard(stockData);

    } catch (error) {
        console.error(`Error fetching ${symbol}:`, error);
        addEvent(`Failed to fetch data for ${symbol}: ${error.message}`, 'error');

        // Show error in card
        updateStockCard({
            symbol: symbol,
            error: error.message
        });
    }
}

// Check for significant price events
function checkPriceEvents(stockData) {
    const { symbol, price, changePercent } = stockData;

    if (previousPrices[symbol]) {
        const priceDiff = ((price - previousPrices[symbol]) / previousPrices[symbol]) * 100;

        if (Math.abs(priceDiff) > 1) {
            const eventType = priceDiff > 0 ? 'price-jump' : 'price-drop';
            const direction = priceDiff > 0 ? 'jumped' : 'dropped';
            addEvent(
                `${symbol} ${direction} ${Math.abs(priceDiff).toFixed(2)}% to $${price.toFixed(2)}`,
                eventType
            );
        }
    }

    // Alert on significant daily changes
    if (Math.abs(changePercent) > 5) {
        const eventType = changePercent > 0 ? 'price-jump' : 'price-drop';
        addEvent(
            `${symbol} is ${changePercent > 0 ? 'up' : 'down'} ${Math.abs(changePercent).toFixed(2)}% today!`,
            eventType
        );
    }

    previousPrices[symbol] = price;
}

// Add event to events log
function addEvent(message, type = 'info') {
    const now = new Date();
    const timeString = now.toLocaleTimeString();

    const eventItem = document.createElement('div');
    eventItem.className = `event-item ${type}`;
    eventItem.innerHTML = `
        <div class="event-time">${timeString}</div>
        <div class="event-message">${message}</div>
    `;

    eventsLog.insertBefore(eventItem, eventsLog.firstChild);

    // Keep only last 20 events
    while (eventsLog.children.length > 20) {
        eventsLog.removeChild(eventsLog.lastChild);
    }
}

// Update stock card display
function updateStockCard(stockData) {
    const existingCard = document.querySelector(`[data-symbol="${stockData.symbol}"]`);

    if (stockData.error) {
        if (existingCard) {
            existingCard.innerHTML = `
                <button class="remove-btn" onclick="removeStock('${stockData.symbol}')">×</button>
                <div class="stock-symbol">${stockData.symbol}</div>
                <div class="error">Failed to load: ${stockData.error}</div>
            `;
        }
        return;
    }

    const isPositive = stockData.change >= 0;
    const cardClass = isPositive ? 'positive' : 'negative';
    const changeClass = isPositive ? 'positive' : 'negative';
    const changeSymbol = isPositive ? '+' : '';

    const cardHTML = `
        <button class="remove-btn" onclick="removeStock('${stockData.symbol}')">×</button>
        <div class="stock-symbol">${stockData.symbol}</div>
        <div class="stock-name">${stockData.name}</div>
        <div class="stock-price">$${stockData.price.toFixed(2)}</div>
        <div class="stock-change ${changeClass}">
            ${changeSymbol}${stockData.change.toFixed(2)} (${changeSymbol}${stockData.changePercent.toFixed(2)}%)
        </div>
        <div class="stock-metrics">
            <div class="metric">
                <div class="metric-label">Open</div>
                <div class="metric-value">$${stockData.open?.toFixed(2) || 'N/A'}</div>
            </div>
            <div class="metric">
                <div class="metric-label">High</div>
                <div class="metric-value">$${stockData.high?.toFixed(2) || 'N/A'}</div>
            </div>
            <div class="metric">
                <div class="metric-label">Low</div>
                <div class="metric-value">$${stockData.low?.toFixed(2) || 'N/A'}</div>
            </div>
            <div class="metric">
                <div class="metric-label">Volume</div>
                <div class="metric-value">${formatVolume(stockData.volume)}</div>
            </div>
        </div>
    `;

    if (existingCard) {
        existingCard.className = `stock-card ${cardClass}`;
        existingCard.innerHTML = cardHTML;
    } else {
        const card = document.createElement('div');
        card.className = `stock-card ${cardClass}`;
        card.setAttribute('data-symbol', stockData.symbol);
        card.innerHTML = cardHTML;
        stockCards.appendChild(card);
    }
}

// Update all stock cards
function updateStockCards() {
    stockCards.innerHTML = '';
    watchlist.forEach(symbol => fetchStockData(symbol));
}

// Format volume for display
function formatVolume(volume) {
    if (!volume) return 'N/A';
    if (volume >= 1e9) return (volume / 1e9).toFixed(2) + 'B';
    if (volume >= 1e6) return (volume / 1e6).toFixed(2) + 'M';
    if (volume >= 1e3) return (volume / 1e3).toFixed(2) + 'K';
    return volume.toString();
}

// Event listeners
addStockBtn.addEventListener('click', addStock);
stockInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addStock();
});

// Initialize
loadWatchlist();
addEvent('Dashboard initialized - monitoring stocks', 'info');

// Auto-refresh every 60 seconds
updateInterval = setInterval(() => {
    watchlist.forEach(symbol => fetchStockData(symbol));
    addEvent('Stock data refreshed', 'info');
}, 60000);
