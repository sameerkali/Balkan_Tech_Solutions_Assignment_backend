
export const normalizeSymbol = (exchange, symbol) => {
    switch (exchange) {
      case 'binance':
        return symbol.toUpperCase();
      case 'bybit':
        return symbol.toUpperCase();
      case 'mexc':
        return symbol.toUpperCase();
      case 'kucoin':
        return symbol.toUpperCase();
      default:
        return symbol;
    }
  };
  
  export const normalizeInterval = (exchange, interval) => {
    const intervalMap = {
      binance: {
        '1m': '1m',
        '5m': '5m',
        '15m': '15m',
        '1h': '1h',
        '4h': '4h',
        '1d': '1d'
      },
      bybit: {
        '1m': '1',
        '5m': '5',
        '15m': '15',
        '1h': '60',
        '4h': '240',
        '1d': 'D'
      },
    };
    
    return intervalMap[exchange]?.[interval] || interval;
  };
  