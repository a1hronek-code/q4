"use client";

import { useEffect, useState } from "react";

type WeatherData = {
  time: string;
  temperature: number;
  feelsLike: number;
  description: string;
  windSpeed: number;
  tomorrow: {
    date: string;
    minTemperature: number;
    maxTemperature: number;
    description: string;
  } | null;
} | null;

type MarketData = {
  weather: { data: WeatherData; error: string | null };
};

const numberFormatter = new Intl.NumberFormat("sk-SK", {
  maximumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat("sk-SK", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat("sk-SK", {
  day: "numeric",
  month: "long",
});

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date);
}

function formatDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

export function PocasieClient() {
  const [weather, setWeather] = useState<WeatherData>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetch("/api/market")
        .then(async (response) => {
          const result = (await response.json()) as MarketData;
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          setWeather(result.weather.data);
          if (!result.weather.data) {
            setError(result.weather.error ?? "Počasie momentálne nie je dostupné.");
          }
        })
        .catch((cause: unknown) => {
          console.error("Weather page request failed", cause);
          setError("Počasie sa momentálne nepodarilo načítať.");
        })
        .finally(() => setLoading(false));
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="market-section" aria-labelledby="pocasie-panel-title">
      <div className="market-grid">
        <article className="market-card exchange-card">
          <div className="market-card-heading">
            <span className="market-icon">☁</span>
            <div>
              <h2 id="pocasie-panel-title">Počasie v Bratislave</h2>
              <span>Aktuálne údaje a predpoveď na zajtra</span>
            </div>
          </div>

          {loading ? (
            <p className="market-loading">Načítavam počasie…</p>
          ) : weather ? (
            <>
              <div className="result-box">
                <strong>{numberFormatter.format(weather.temperature)} °C</strong>
                <span>{weather.description}</span>
              </div>

              <div className="info-grid">
                <div className="info-card">
                  <span className="info-card-kicker">Pocitová teplota</span>
                  <strong>{numberFormatter.format(weather.feelsLike)} °C</strong>
                  <p>Ako teplotu aktuálne vníma ľudské telo.</p>
                </div>

                <div className="info-card">
                  <span className="info-card-kicker">Vietor</span>
                  <strong>{numberFormatter.format(weather.windSpeed)} km/h</strong>
                  <p>Rýchlosť vetra podľa najnovšieho merania.</p>
                </div>

                <div className="info-card">
                  <span className="info-card-kicker">Zajtra</span>
                  <strong>
                    {weather.tomorrow
                      ? `${numberFormatter.format(weather.tomorrow.minTemperature)} °C / ${numberFormatter.format(weather.tomorrow.maxTemperature)} °C`
                      : "Predpoveď nie je dostupná"}
                  </strong>
                  <p>
                    {weather.tomorrow
                      ? `${formatDate(weather.tomorrow.date)} · ${weather.tomorrow.description}`
                      : "API momentálne neposkytlo údaje na ďalší deň."}
                  </p>
                </div>
              </div>

              <p className="tool-hint">Posledná aktualizácia: {formatDateTime(weather.time)}</p>
            </>
          ) : (
            <p className="market-error" role="status">{error}</p>
          )}
        </article>

        <article className="market-card">
          <div className="market-card-heading">
            <span className="market-icon">↗</span>
            <div>
              <h3>Podrobnejšia predpoveď</h3>
              <span>Externý meteorologický zdroj</span>
            </div>
          </div>
          <p>
            Ak potrebujete radar, hodinovú predpoveď alebo výhľad pre ďalšie mestá, pokračujte na
            špecializovaný web s rozšíreným meteorologickým servisom.
          </p>
          <p className="info-card-meta">
            <a href="https://predpovedpocasia.sk/" target="_blank" rel="noreferrer">
              Otvoriť predpovedpocasia.sk ↗
            </a>
          </p>
        </article>
      </div>
    </section>
  );
}
