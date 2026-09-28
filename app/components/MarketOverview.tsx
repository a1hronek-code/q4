"use client";

import { useCallback, useEffect, useState } from "react";

type MarketData = {
  exchangeRates: {
    data: { date: string; rates: Record<string, number> } | null;
    error: string | null;
  };
  weather: {
    data: {
      time: string;
      temperature: number;
      feelsLike: number;
      description: string;
      windSpeed: number;
    } | null;
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

export function MarketOverview() {
  const [market, setMarket] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");

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
          <h2 id="market-title">Ekonomika na jednom mieste</h2>
          <p className="directory-intro">
            Referenčné kurzy, aktuálne počasie v Bratislave a priemerné týždenné ceny
            pohonných látok na Slovensku.
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
              <ul className="exchange-list">
                {Object.entries(market.exchangeRates.data.rates).map(([code, value]) => (
                  <li key={code}>
                    <span className="currency-code">{code}</span>
                    <span className="currency-name">{currencyNames[code] ?? code}</span>
                    <strong>{numberFormatter.format(value)}</strong>
                  </li>
                ))}
              </ul>
              <p className="market-source">
                Referenčný kurz k {formatDate(market.exchangeRates.data.date)} ·{" "}
                <a
                  href="https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  ECB
                </a>
              </p>
            </>
          ) : (
            <p className={loading ? "market-loading" : "market-error"} role={loading ? undefined : "status"}>
              {loading ? "Načítavam kurzy…" : market?.exchangeRates.error ?? "Kurzy nie sú dostupné."}
            </p>
          )}
        </article>

        <article className="market-card weather-card">
          <div className="market-card-heading">
            <span className="market-icon">☀</span>
            <div>
              <h3>Počasie</h3>
              <span>Bratislava · teraz</span>
            </div>
          </div>
          {market?.weather.data ? (
            <>
              <div className="weather-reading">
                <strong>{numberFormatter.format(market.weather.data.temperature)}°</strong>
                <span>{market.weather.data.description}</span>
              </div>
              <div className="weather-details">
                <span>Pocitovo {numberFormatter.format(market.weather.data.feelsLike)}°C</span>
                <span>Vietor {numberFormatter.format(market.weather.data.windSpeed)} km/h</span>
              </div>
              <p className="market-source">
                {formatDateTime(market.weather.data.time)} ·{" "}
                <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a>
              </p>
            </>
          ) : (
            <p className={loading ? "market-loading" : "market-error"} role={loading ? undefined : "status"}>
              {loading ? "Načítavam počasie…" : market?.weather.error ?? "Počasie nie je dostupné."}
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
      </div>
    </section>
  );
}
