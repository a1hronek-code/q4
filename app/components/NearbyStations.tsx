"use client";

import { useState } from "react";

type Station = {
  id: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
};

type NearbyResult = {
  stations: Station[];
  latitude: number;
  longitude: number;
};

function distanceInMeters(
  fromLatitude: number,
  fromLongitude: number,
  toLatitude: number,
  toLongitude: number,
) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(toLatitude - fromLatitude);
  const longitudeDelta = toRadians(toLongitude - fromLongitude);
  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(fromLatitude)) *
      Math.cos(toRadians(toLatitude)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function formatDistance(meters: number) {
  return meters < 1000
    ? `${Math.round(meters)} m`
    : `${new Intl.NumberFormat("sk-SK", { maximumFractionDigits: 1 }).format(meters / 1000)} km`;
}

function locationErrorMessage(code: number) {
  if (code === 1) return "Povolenie na zdieľanie polohy bolo zamietnuté.";
  if (code === 2) return "Vašu polohu sa nepodarilo zistiť.";
  if (code === 3) return "Zisťovanie polohy trvalo príliš dlho.";
  return "Poloha nie je dostupná.";
}

export function NearbyStations() {
  const [result, setResult] = useState<NearbyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const findNearbyStations = () => {
    if (!navigator.geolocation) {
      setError("Tento prehliadač nepodporuje zisťovanie polohy.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const params = new URLSearchParams({
            lat: String(coords.latitude),
            lon: String(coords.longitude),
          });
          const response = await fetch(`/api/market/stations?${params}`, {
            signal: AbortSignal.timeout(30_000),
          });
          const body = await response.json() as {
            stations?: Station[];
            error?: string;
          };
          if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`);
          setResult({
            stations: body.stations ?? [],
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
        } catch (cause) {
          console.error("Nearby fuel-station lookup failed", cause);
          setError(cause instanceof Error && cause.name === "TimeoutError"
            ? "Vyhľadávanie staníc trvalo príliš dlho."
            : "Stanice v okolí sa nepodarilo načítať. Skúste to znova.");
        } finally {
          setLoading(false);
        }
      },
      (positionError) => {
        setError(locationErrorMessage(positionError.code));
        setLoading(false);
      },
      { enableHighAccuracy: false, maximumAge: 300_000, timeout: 15_000 },
    );
  };

  const stations = result
    ? result.stations
      .map((station) => ({
        ...station,
        distance: distanceInMeters(
          result.latitude,
          result.longitude,
          station.latitude,
          station.longitude,
        ),
      }))
      .sort((left, right) => left.distance - right.distance)
      .slice(0, 5)
    : [];

  return (
    <>
      <p className="station-intro">
        Nájdite najbližšie stanice podľa aktuálnej polohy. Zoznam neobsahuje ceny palív.
      </p>
      <button
        className="station-search-button"
        type="button"
        onClick={findNearbyStations}
        disabled={loading}
      >
        {loading ? "Hľadám stanice…" : result ? "Obnoviť polohu" : "Nájsť stanice v okolí"}
      </button>
      {error ? <p className="market-error station-error" role="alert">{error}</p> : null}
      {result && stations.length === 0 ? (
        <p className="station-empty" role="status">V okruhu 5 km sa nenašli žiadne stanice.</p>
      ) : null}
      {stations.length > 0 ? (
        <ul className="nearby-station-list">
          {stations.map((station) => {
            const mapUrl = new URL("https://www.openstreetmap.org/");
            mapUrl.searchParams.set("mlat", String(station.latitude));
            mapUrl.searchParams.set("mlon", String(station.longitude));
            mapUrl.hash = `map=17/${station.latitude}/${station.longitude}`;
            return (
              <li key={station.id}>
                <a href={mapUrl.toString()} target="_blank" rel="noreferrer">
                  <span>
                    <strong>{station.name}</strong>
                    {station.address ? <small>{station.address}</small> : null}
                  </span>
                  <small>{formatDistance(station.distance)}</small>
                </a>
              </li>
            );
          })}
        </ul>
      ) : null}
      <p className="market-source station-attribution">
        Stanice z OpenStreetMap · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">prispievatelia OSM</a>.
      </p>
    </>
  );
}
