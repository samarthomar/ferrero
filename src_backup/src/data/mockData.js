export const mockData = {
  kpis: {
    price: { value: 6.85, trend: "up", percentChange: 2.4, history: [6.4, 6.5, 6.6, 6.7, 6.8, 6.85] },
    exposure: { value: 45.2, unit: "€M", trend: "up" },
    daysOfSupply: { value: 24, warning: true },
    activeContracts: { value: 12 },
    inventoryUtil: { value: 85, trend: "up" }
  },
  priceHistory: [
    { date: "Jan", turkey: 6.2, italy: 6.5, oregon: 6.1 },
    { date: "Feb", turkey: 6.3, italy: 6.6, oregon: 6.2 },
    { date: "Mar", turkey: 6.5, italy: 6.7, oregon: 6.3 },
    { date: "Apr", turkey: 6.4, italy: 6.6, oregon: 6.2 },
    { date: "May", turkey: 6.6, italy: 6.8, oregon: 6.4 },
    { date: "Jun", turkey: 6.85, italy: 7.1, oregon: 6.6 }
  ],
  riskRadar: [
    { subject: "Supply", A: 85, fullMark: 100 },
    { subject: "FX", A: 65, fullMark: 100 },
    { subject: "Tariff", A: 40, fullMark: 100 },
    { subject: "Weather", A: 75, fullMark: 100 },
    { subject: "Demand", A: 50, fullMark: 100 },
    { subject: "Logistics", A: 60, fullMark: 100 }
  ],
  suppliers: [
    { id: 1, name: "Oltan Gida", price: "6.85 €/kg", utilization: 90, status: "Active" },
    { id: 2, name: "Besana", price: "7.10 €/kg", utilization: 60, status: "Active" },
    { id: 3, name: "Hazelnut Growers Oregon", price: "6.60 €/kg", utilization: 45, status: "Active" }
  ],
  alerts: [
    { id: 1, severity: "critical", title: "Frost Warning in Ordu", desc: "Temperatures expected to drop below 0°C, risking early blooms.", time: "2h ago" },
    { id: 2, severity: "warning", title: "EUR/TRY Volatility", desc: "Lira depreciated 2% against Euro in last 24h.", time: "5h ago" },
    { id: 3, severity: "info", title: "Oregon Harvest Forecast", desc: "Yield expected to be 10% above 5-year average.", time: "1d ago" }
  ],
  recommendations: [
    {
      id: 1,
      action: "BUY",
      title: "Secure Turkish Supply Before Frost Impact",
      confidence: 85,
      reasoning: [
        "Frost warnings in Ordu have a high probability of reducing yield.",
        "Prices typically surge 15-20% following significant frost events.",
        "Current inventory utilization is high (85%) and days of supply are low (24)."
      ],
      sources: [
        { name: "Turkish Meteorological Service", relevance: 95 },
        { name: "Historical Price Data (2014 Frost Event)", relevance: 88 }
      ],
      riskFactors: [
        { risk: "FX Volatility (TRY)", severity: "medium" },
        { risk: "Storage Costs", severity: "low" }
      ],
      financialImpact: "Est. savings of €1.2M compared to post-frost prices.",
      timestamp: "2026-08-31 10:00"
    }
  ]
};
