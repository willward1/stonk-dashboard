# Stock Events Dashboard

A real-time stock monitoring dashboard that tracks stock prices and events using Yahoo Finance data.

## Features

- **Real-time Stock Monitoring**: Track multiple stocks simultaneously
- **Price Change Alerts**: Get notified of significant price movements
- **Stock Metrics**: View open, high, low, and volume data
- **Events Log**: Track all price changes and events in real-time
- **Persistent Watchlist**: Your watchlist is saved locally
- **Auto-refresh**: Data updates every 60 seconds

## Usage

1. Enter a stock symbol (e.g., AAPL, GOOGL, TSLA) in the search box
2. Click "Add Stock" to add it to your watchlist
3. View real-time price data and changes
4. Monitor the events log for significant price movements
5. Click the × button on any stock card to remove it from your watchlist

## Technologies

- Plain HTML/CSS/JavaScript
- Yahoo Finance API
- LocalStorage for data persistence

## Default Stocks

The dashboard comes pre-loaded with:
- AAPL (Apple)
- GOOGL (Google)
- MSFT (Microsoft)

## Deployment

This dashboard is designed to be deployed on GitHub Pages. The app runs entirely in the browser with no backend required.

## Data Source

Stock data is provided by Yahoo Finance via their public API. Data updates every 60 seconds during market hours.

## License

MIT
