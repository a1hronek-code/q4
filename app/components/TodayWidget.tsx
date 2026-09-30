"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getNameDayNames } from "../lib/nameday";

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

const numberFormatter = new Intl.NumberFormat("sk-SK", { maximumFractionDigits: 0 });

const todayLabelFormatter = new Intl.DateTimeFormat("sk-SK", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function tomorrowDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date;
}

export function TodayWidget() {
  const [weather, setWeather] = useState<WeatherData>(null);
  const [weatherError, setWeatherError] = useState("");
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setNow(new Date());
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetch("/api/market")
        .then(async (response) => {
          const result = (await response.json()) as MarketData;
          if (!response.ok) throw new Error("HTTP error");
          setWeather(result.weather.data);
          if (!result.weather.data) setWeatherError(result.weather.error ?? "Počasie nie je dostupné.");
        })
        .catch((cause: unknown) => {
          console.error("Today widget weather request failed", cause);
          setWeatherError("Počasie sa momentálne nepodarilo načítať.");
        })
        .finally(() => setLoading(false));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const todayNames = now ? getNameDayNames(now) : [];
  const tomorrow = now ? tomorrowDate() : null;
  const tomorrowNames = tomorrow ? getNameDayNames(tomorrow) : [];

  return (
    <div className="today-widget" aria-label="Počasie a meniny">
      <div className="today-widget-column">
        <span className="today-widget-label">Dnes</span>
        <strong className="today-widget-date">{now ? todayLabelFormatter.format(now) : "\u00A0"}</strong>
        {loading ? (
          <p className="market-loading">Načítavam počasie…</p>
        ) : weather ? (
          <div className="today-widget-weather">
            <strong>{numberFormatter.format(weather.temperature)}°C</strong>
            <span>{weather.description}</span>
            <small>Pocitovo {numberFormatter.format(weather.feelsLike)}°C · Vietor {numberFormatter.format(weather.windSpeed)} km/h</small>
          </div>
        ) : (
          <p className="market-error" role="status">{weatherError}</p>
        )}
        <p className="today-widget-nameday">
          Meniny: <strong>{todayNames.length > 0 ? todayNames.join(", ") : "štátny sviatok"}</strong>
        </p>
      </div>

      <div className="today-widget-divider" aria-hidden="true" />

      <div className="today-widget-column">
        <span className="today-widget-label">Zajtra</span>
        <strong className="today-widget-date">
          {tomorrow ? todayLabelFormatter.format(tomorrow) : "\u00A0"}
        </strong>
        {loading ? (
          <p className="market-loading">Načítavam predpoveď…</p>
        ) : weather?.tomorrow ? (
          <div className="today-widget-weather">
            <strong>
              {numberFormatter.format(weather.tomorrow.minTemperature)}° / {numberFormatter.format(weather.tomorrow.maxTemperature)}°C
            </strong>
            <span>{weather.tomorrow.description}</span>
          </div>
        ) : (
          <p className="market-error" role="status">Predpoveď na zajtra nie je dostupná.</p>
        )}
        <p className="today-widget-nameday">
          Meniny: <strong>{tomorrowNames.length > 0 ? tomorrowNames.join(", ") : "štátny sviatok"}</strong>
        </p>
      </div>

      <div className="today-widget-links">
        <Link href="/pocasie">Podrobné počasie →</Link>
        <Link href="/meniny">Meninový kalendár →</Link>
        <a href="https://predpovedpocasia.sk/" target="_blank" rel="noreferrer">
          predpovedpocasia.sk ↗
        </a>
      </div>
    </div>
  );
}
