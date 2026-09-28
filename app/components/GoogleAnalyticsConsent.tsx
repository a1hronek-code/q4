"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

const measurementId = "G-7265T1HV9S";
const consentStorageKey = "q4-analytics-consent";
type ConsentChoice = "accepted" | "rejected";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

function initializeGoogleAnalytics() {
  if (window.gtag) return;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function (...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.gtag("js", new Date());
  window.gtag("config", measurementId);
}

function updateGoogleAnalyticsConsent(choice: ConsentChoice) {
  const allowed = choice === "accepted";
  window[`ga-disable-${measurementId}`] = !allowed;
  window.gtag?.("consent", "update", {
    analytics_storage: allowed ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });

  if (!allowed) {
    const names = document.cookie
      .split(";")
      .map((cookie) => cookie.split("=", 1)[0].trim())
      .filter((name) => name === "_ga" || name.startsWith("_ga_"));
    for (const name of names) {
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
      if (window.location.hostname === "q4.sk" || window.location.hostname.endsWith(".q4.sk")) {
        document.cookie = `${name}=; Max-Age=0; Path=/; Domain=.q4.sk; SameSite=Lax`;
      }
    }
  }
}

export function GoogleAnalyticsConsent() {
  const consentRef = useRef<ConsentChoice | null>(null);
  const [choice, setChoice] = useState<ConsentChoice | null>(null);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [analyticsStarted, setAnalyticsStarted] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [storageWarning, setStorageWarning] = useState("");
  const [scriptError, setScriptError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(consentStorageKey);
        if (saved === "accepted" || saved === "rejected") {
          consentRef.current = saved;
          setChoice(saved);
          updateGoogleAnalyticsConsent(saved);
          if (saved === "accepted") {
            initializeGoogleAnalytics();
            setAnalyticsStarted(true);
          } else {
            setPreferencesOpen(false);
          }
        } else {
          setPreferencesOpen(true);
        }
      } catch {
        setPreferencesOpen(true);
        setStorageWarning("Nastavenie súhlasu sa v tomto prehliadači nedá uložiť.");
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function choose(choice: ConsentChoice) {
    const wasRevoked = consentRef.current === "rejected";
    consentRef.current = choice;
    setChoice(choice);
    setPreferencesOpen(false);
    try {
      window.localStorage.setItem(consentStorageKey, choice);
      setStorageWarning("");
    } catch {
      setStorageWarning("Vaša voľba platí do zatvorenia tejto karty.");
    }

    if (choice === "accepted") {
      initializeGoogleAnalytics();
      setAnalyticsStarted(true);
    }
    updateGoogleAnalyticsConsent(choice);
    if (choice === "accepted" && wasRevoked && scriptReady) {
      window.gtag?.("event", "page_view", {
        page_path: window.location.pathname,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }

  function handleScriptReady() {
    const currentChoice = consentRef.current;
    if (currentChoice) updateGoogleAnalyticsConsent(currentChoice);
    setScriptReady(true);
    setScriptError("");
  }

  return (
    <>
      {analyticsStarted ? (
        <Script
          id="q4-google-analytics"
          src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
          strategy="afterInteractive"
          onReady={handleScriptReady}
          onError={() => {
            console.error("Google Analytics script failed to load");
            setScriptError("Google Analytics sa nepodarilo načítať.");
          }}
        />
      ) : null}
      {preferencesOpen ? (
        <section className="analytics-consent" aria-labelledby="analytics-consent-title">
          <div className="analytics-consent-copy">
            <h2 id="analytics-consent-title">Pomôžte nám zlepšovať Q4.sk</h2>
            <p>
              Google Analytics meria návštevnosť. Analytický skript sa načíta iba
              po vašom súhlase; odmietnutie neobmedzí používanie webu.
            </p>
            {storageWarning ? <small role="status">{storageWarning}</small> : null}
          </div>
          <div className="analytics-consent-actions">
            <button type="button" onClick={() => choose("rejected")}>Odmietnuť</button>
            <button
              className="analytics-accept"
              type="button"
              onClick={() => choose("accepted")}
            >
              Povoliť analytiku
            </button>
          </div>
        </section>
      ) : choice ? (
        <button
          className="analytics-settings"
          type="button"
          onClick={() => setPreferencesOpen(true)}
        >
          Nastavenia cookies
        </button>
      ) : null}
      {scriptError ? <p className="analytics-error" role="alert">{scriptError}</p> : null}
    </>
  );
}
