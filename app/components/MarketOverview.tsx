"use client";

import { useCallback, useEffect, useState } from "react";
import { NearbyStations } from "./NearbyStations";

type MarketData = {
  exchangeRates: {
    data: { date: string; rates: Record<string, number> } | null;
    error: string | null;
  };
  fuelPrices: {
    data: { week: string; petrol: number; diesel: number } | null;
    error: string | null;
  };
};

const currencyNames: Record<string, string> = {
  USD: "Americký dolár",
  CZK: "Česká koruna",
  GBP: "Britská libra",
  CHF: "Švajčiarsky frank",
  PLN: "Poľský zlotý",
  HUF: "Maďarský forint",
};

const periods = {
  "1m": { label: "1 mesiac", days: 31 },
  "3m": { label: "3 mesiace", days: 92 },
  "1y": { label: "1 rok", days: 366 },
} as const;

type Period = keyof typeof periods;
type CurrencyHistory = {
  currency: string;
  name: string;
  period: Period;
  points: Array<{ date: string; rate: number }>;
  forecast: Array<{ date: string; rate: number }>;
  changePercent: number;
  low: number;
  high: number;
  source: string;
};

const dateFormatter = new Intl.DateTimeFormat("sk-SK", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("sk-SK", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const numberFormatter = new Intl.NumberFormat("sk-SK", {
  maximumFractionDigits: 4,
});

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date);
}

function formatShortDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("sk-SK", { day: "numeric", month: "short", timeZone: "UTC" }).format(date);
}

export function MarketOverview() {
  const [market, setMarket] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("3m");
  const [history, setHistory] = useState<CurrencyHistory | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/market");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = (await response.json()) as MarketData;
      setMarket(result);
      setUpdatedAt(new Date().toISOString());
    } catch (cause) {
      console.error("Market overview request failed", cause);
      setError("Trhový prehľad sa nepodarilo obnoviť. Skúste to znova.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async (
    currency: string,
    period: Period,
    signal?: AbortSignal,
  ) => {
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const url = new URL("/api/market/history", window.location.origin);
      url.searchParams.set("currency", currency);
      url.searchParams.set("period", period);
      const response = await fetch(url, { signal });
      const result = await response.json() as CurrencyHistory & { error?: string };
      if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`);
      setHistory(result);
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") return;
      console.error("Exchange-rate history request failed", cause);
      setHistory(null);
      setHistoryError("Históriu kurzu sa nepodarilo načítať. Skúste to znova.");
    } finally {
      if (!signal?.aborted) setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (market?.exchangeRates.data?.rates[selectedCurrency]) {
      const controller = new AbortController();
      const timer = window.setTimeout(
        () => void loadHistory(selectedCurrency, selectedPeriod, controller.signal),
        0,
      );
      return () => {
        window.clearTimeout(timer);
        controller.abort();
      };
    }
    return undefined;
  }, [loadHistory, market?.exchangeRates.data, selectedCurrency, selectedPeriod]);

  useEffect(() => {
    const initialRequest = window.setTimeout(() => void refresh(), 0);
    const interval = window.setInterval(() => void refresh(), 30 * 60 * 1000);
    return () => {
      window.clearTimeout(initialRequest);
      window.clearInterval(interval);
    };
  }, [refresh]);

  return (
    <section className="market-section" id="trhy" aria-labelledby="market-title">
      <div className="section-heading market-heading">
        <div>
          <span className="eyebrow">Prehľad trhu</span>
          <h2 id="market-title">Kurzy mien a ceny palív</h2>
          <p className="directory-intro">
            Referenčné kurzy NBS/ECB s históriou, priemerné ceny palív a najbližšie čerpacie stanice.
          </p>
        </div>
        <div className="market-refresh">
          {updatedAt ? <span>Obnovené {formatDateTime(updatedAt)}</span> : null}
          <button type="button" onClick={() => void refresh()} disabled={loading}>
            {loading ? "Načítavam…" : "Obnoviť"}
          </button>
        </div>
      </div>

      {error ? <p className="market-error" role="alert">{error}</p> : null}

      <div className="market-grid" aria-busy={loading}>
        <article className="market-card exchange-card">
          <div className="market-card-heading">
            <span className="market-icon">€</span>
            <div>
              <h3>Kurzy mien</h3>
              <span>1 EUR voči cudzej mene</span>
            </div>
          </div>
          {market?.exchangeRates.data ? (
            <>
              <div className="exchange-content-grid">
                <ul className="exchange-list">
                  {Object.entries(market.exchangeRates.data.rates).map(([code, value]) => (
                    <li key={code}>
                      <button
                        type="button"
                        className={`currency-select${selectedCurrency === code ? " is-selected" : ""}`}
                        aria-pressed={selectedCurrency === code}
                        onClick={() => setSelectedCurrency(code)}
                      >
                        <span className="currency-code">{code}</span>
                        <span className="currency-name">{currencyNames[code] ?? code}</span>
                        <strong>{numberFormatter.format(value)}</strong>
                      </button>
                    </li>
                  ))}
                </ul>
                {history || historyLoading || historyError ? (
                  <div className="currency-detail" aria-live="polite">
                    <div className="currency-detail-heading">
                      <div>
                        <span>{selectedCurrency} · {currencyNames[selectedCurrency]}</span>
                        {history ? (
                          <>
                            <strong>{numberFormatter.format(history.points.at(-1)?.rate ?? 0)} {selectedCurrency}</strong>
                            <small className={history.changePercent >= 0 ? "rate-change positive" : "rate-change negative"}>
                              {history.changePercent >= 0 ? "+" : ""}{numberFormatter.format(history.changePercent)} % za obdobie
                            </small>
                          </>
                        ) : null}
                      </div>
                      <div className="period-switch" aria-label="Obdobie histórie kurzu">
                        {(Object.keys(periods) as Period[]).map((period) => (
                          <button
                            key={period}
                            type="button"
                            aria-pressed={selectedPeriod === period}
                            className={selectedPeriod === period ? "is-selected" : ""}
                            onClick={() => setSelectedPeriod(period)}
                          >
                            {period.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    {historyLoading ? (
                      <p className="market-loading history-loading">Načítavam históriu kurzu…</p>
                    ) : historyError ? (
                      <p className="market-error history-error" role="alert">{historyError}</p>
                    ) : history ? (
                      <>
                        <RateHistoryChart history={history} />
                        <div className="history-summary">
                          <span>Minimum <strong>{numberFormatter.format(history.low)}</strong></span>
                          <span>Maximum <strong>{numberFormatter.format(history.high)}</strong></span>
                          <span>Predikcia <strong>{numberFormatter.format(history.forecast.at(-1)?.rate ?? 0)}</strong></span>
                        </div>
                        <p className="forecast-note">
                          Predikcia na 5 pracovných dní je jednoduché predĺženie trendu posledných 20 kurzov,
                          nie prognóza ECB ani investičné odporúčanie.
                        </p>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <p className="market-source">
                Referenčný kurz k {formatDate(market.exchangeRates.data.date)} ·{" "}
                <a
                  href="https://nbs.sk/export/en/exchange-rate/latest/xml"
                  target="_blank"
                  rel="noreferrer"
                >
                  NBS / ECB
                </a>
              </p>
            </>
          ) : (
            <p className={loading ? "market-loading" : "market-error"} role={loading ? undefined : "status"}>
              {loading ? "Načítavam kurzy…" : market?.exchangeRates.error ?? "Kurzy nie sú dostupné."}
            </p>
          )}
        </article>

        <article className="market-card fuel-card">
          <div className="market-card-heading">
            <span className="market-icon">⛽</span>
            <div>
              <h3>Benzín a nafta</h3>
              <span>Priemerné ceny na Slovensku</span>
            </div>
          </div>
          {market?.fuelPrices.data ? (
            <>
              <ul className="fuel-list">
                <li><span>Benzín 95</span><strong>{numberFormatter.format(market.fuelPrices.data.petrol)} €/l</strong></li>
                <li><span>Motorová nafta</span><strong>{numberFormatter.format(market.fuelPrices.data.diesel)} €/l</strong></li>
              </ul>
              <p className="market-source">
                Týždenný priemer k {formatDate(market.fuelPrices.data.week)} ·{" "}
                <a href="https://energy.ec.europa.eu/data-and-analysis/weekly-oil-bulletin_en" target="_blank" rel="noreferrer">
                  Európska komisia
                </a>
                {" "}· agregácia{" "}
                <a href="https://www.fuel-prices.eu/Slovakia/" target="_blank" rel="noreferrer">
                  fuel-prices.eu
                </a>
              </p>
            </>
          ) : (
            <p className={loading ? "market-loading" : "market-error"} role={loading ? undefined : "status"}>
              {loading ? "Načítavam priemerné ceny…" : market?.fuelPrices.error ?? "Ceny palív nie sú dostupné."}
            </p>
          )}
        </article>

        <article className="market-card stations-card">
          <div className="market-card-heading">
            <span className="market-icon">⌖</span>
            <div>
              <h3>Čerpacie stanice</h3>
              <span>Najbližšie podľa vašej polohy</span>
            </div>
          </div>
          <NearbyStations />
        </article>

      </div>
    </section>
  );
}

function RateHistoryChart({ history }: { history: CurrencyHistory }) {
  const width = 640;
  const height = 148;
  const padding = { top: 18, right: 12, bottom: 25, left: 12 };
  const values = [
    ...history.points.map((point) => point.rate),
    ...history.forecast.map((point) => point.rate),
  ];
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const spread = maximum - minimum || maximum * 0.01 || 1;
  const x = (index: number) =>
    padding.left + index * ((width - padding.left - padding.right) / Math.max(values.length - 1, 1));
  const y = (value: number) =>
    padding.top + ((maximum - value) / spread) * (height - padding.top - padding.bottom);
  const historyPath = history.points
    .map((point, index) => `${index ? "L" : "M"} ${x(index)} ${y(point.rate)}`)
    .join(" ");
  const forecastPath = history.forecast
    .map((point, index) => {
      const pointIndex = history.points.length - 1 + index;
      return `${index ? "L" : "M"} ${x(pointIndex)} ${y(index === 0 ? history.points.at(-1)!.rate : point.rate)}`;
    })
    .join(" ");
  const firstDate = history.points[0]?.date;
  const lastDate = history.points.at(-1)?.date;
  const forecastDate = history.forecast.at(-1)?.date;

  return (
    <div className="rate-chart-wrap">
      <svg
        className="rate-chart"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Historický kurz eura voči ${history.currency} za ${periods[history.period].label} a orientačný trend na päť pracovných dní`}
      >
        {[0, 0.5, 1].map((fraction) => {
          const lineY = padding.top + fraction * (height - padding.top - padding.bottom);
          return <line key={fraction} x1={padding.left} x2={width - padding.right} y1={lineY} y2={lineY} className="chart-gridline" />;
        })}
        <path d={historyPath} className="rate-history-line" />
        <path d={forecastPath} className="rate-forecast-line" />
      </svg>
      <div className="chart-dates">
        <span>{firstDate ? formatShortDate(firstDate) : ""}</span>
        <span>{lastDate ? formatShortDate(lastDate) : ""}</span>
        <span>+5 dní: {forecastDate ? formatShortDate(forecastDate) : ""}</span>
      </div>
    </div>
  );
}
