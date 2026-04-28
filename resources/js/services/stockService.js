/**
 * Stock Market Service — DSE/CSE
 * API: GET /api/stocks → { data: StockData }
 */

export async function getDSEData() {
  try {
    const res = await fetch('/api/stocks');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Error fetching stock market data', err);
  }
  return { data: null };
}
