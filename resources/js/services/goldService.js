/**
 * Gold & Currency Service
 * API: GET /api/stocks → { data: { prices: Price[] } }
 */

export async function getGoldPrice() {
  try {
    const res = await fetch('/api/stocks');
    if (res.ok) {
      const json = await res.json();
      const prices = json.data?.prices || [];
      
      // Map to old structure for compatibility
      const gold22k = prices.find(p => p.key === 'gold_22k');
      const gold24k = prices.find(p => p.key === 'gold_24k');
      const usdBdt = json.data?.ticker?.find(t => t.name === 'USD' || t.name === 'ডলার');

      return {
        data: {
          gold22k: gold22k ? { price: gold22k.value, unit: gold22k.unit, change: gold22k.change, trend: gold22k.up ? 'up' : 'down' } : null,
          gold24k: gold24k ? { price: gold24k.value, unit: gold24k.unit, change: gold24k.change, trend: gold24k.up ? 'up' : 'down' } : null,
          usdBdt: usdBdt ? { rate: usdBdt.value, trend: usdBdt.up ? 'up' : 'down' } : null,
          updatedAt: new Date().toISOString(),
        }
      };
    }
  } catch (err) {
    console.error('Error fetching gold price', err);
  }
  return { data: null };
}
