// ==UserScript==
// @name         Vegvesen Oppkjøring Overvåker
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Overvåker ledige oppkjøringstimer på vegvesen.no og sender varsel til mobilen via ntfy.sh
// @author       Ditt Navn / Shad
// @match        https://www.vegvesen.no/dinside/dittforerkort/timebestilling/timer*
// @grant        GM_notification
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // ==========================================
    // --- KONFIGURASJON (Endre disse etter behov) ---
    const MIN_DATO = "2026-06-05";       // Sjekker kun datoer ETTER dette
    const MAKS_DATO = "2026-08-01";      // Sjekker kun datoer FØR dette
    const MIN_SEKUNDER = 15;             // Minimum ventetid mellom sjekk
    const MAKS_SEKUNDER = 35;            // Maksimum ventetid mellom sjekk
    const NTFY_TOPIC = "oppkjoring-kristiansand-shad-2026"; // Ditt hemmelige ord i ntfy-appen
    // ==========================================

    let lagredeHeaders = null;
    let sisteVarsledeTimer = "";
    let loopAktiv = false;

    // Funksjon for å lagre sikkerhets-headerne når vi fanger dem opp
    function lagreSikkerhetsData(headers) {
        if (headers['x-selvbetjening-xsrf-token'] && !loopAktiv) {
            lagredeHeaders = { ...headers };
            console.log("%c[Tampermonkey] Sikkerhets-token fanget opp automatisk! Starter overvåking...", "color: green; font-weight: bold;");
            loopAktiv = true;
            sjekkLedigeTimer();
        }
    }

    // --- AUTOMATISK NETTVERKS-AVLYTTING ---
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

    XMLHttpRequest.prototype.open = function() {
        this._headers = {};
        return originalOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
        this._headers[header.toLowerCase()] = value;
        if (header.toLowerCase() === 'x-selvbetjening-xsrf-token') {
            lagreSikkerhetsData(this._headers);
        }
        return originalSetRequestHeader.apply(this, arguments);
    };

    const originalFetch = window.fetch;
    window.fetch = async function() {
        let options = arguments[1] || {};
        if (options && options.headers) {
            let headers = options.headers;
            let token = headers['x-selvbetjening-xsrf-token'] || (headers.get && headers.get('x-selvbetjening-xsrf-token'));
            if (token) {
                let plainHeaders = {};
                if (typeof headers.forEach === 'function') {
                    headers.forEach((value, key) => { plainHeaders[key.toLowerCase()] = value; });
                } else {
                    Object.keys(headers).forEach(k => { plainHeaders[k.toLowerCase()] = headers[k]; });
                }
                lagreSikkerhetsData(plainHeaders);
            }
        }
        return originalFetch.apply(this, arguments);
    };

    // --- LYD & VARSLING ---
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function spillAlarm() {
        try {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
            oscillator.start();
            setTimeout(() => { oscillator.stop(); }, 1500);
        } catch (e) {
            console.error("[Tampermonkey] Kunne ikke spille av alarmlyd:", e);
        }
    }

    async function sendVarsel(tittel, tekst) {
        spillAlarm();
        try {
            GM_notification({ title: tittel, text: tekst, timeout: 10000 });
        } catch (e) {
            console.error("[Tampermonkey] Kunne ikke sende systemvarsel:", e);
        }
        try {
            await fetch("https://ntfy.sh/" + NTFY_TOPIC, {
                method: "POST",
                headers: {
                    "Title": tittel,
                    "Priority": "high",
                    "Tags": "car,rotating_light"
                },
                body: tekst
            });
            console.log("[Tampermonkey] Mobilvarsel sendt via ntfy.sh!");
        } catch (err) {
            console.error("[Tampermonkey] Kunne ikke sende mobilvarsel:", err);
        }
    }

    // --- HOVEDLOGIKK ---
    function finnAlleTimer(data) {
        let funnet = [];
        if (Array.isArray(data)) {
            data.forEach(stasjon => {
                if (stasjon && Array.isArray(stasjon.provetimer)) {
                    stasjon.provetimer.forEach(time => {
                        if (time && time.start) {
                            const startStr = time.start;
                            if (startStr.includes('T')) {
                                const deler = startStr.split('T');
                                funnet.push({ dato: deler[0], klokke: deler[1].substring(0, 5) });
                            }
                        }
                    });
                }
            });
        }
        const unike = [];
        const sett = new Set();
        funnet.forEach(item => {
            const id = item.dato + "_" + item.klokke;
            if (!sett.has(id)) {
                sett.add(id);
                unike.push(item);
            }
        });
        return unike;
    }

    function genererTilfeldigVentetid() {
        const sekunder = Math.floor(Math.random() * (MAKS_SEKUNDER - MIN_SEKUNDER + 1) + MIN_SEKUNDER);
        return sekunder * 1000;
    }

    async function sjekkLedigeTimer() {
        if (!lagredeHeaders) return;
        console.log("[" + new Date().toLocaleTimeString() + "] [Sjekk] Kontrollerer ledige oppkjøringstimer...");
        
        try {
            const response = await fetch("https://backend-bestill-time-oppkjoring.atlas.vegvesen.no/provetimer?arbeidsflytId=1188151347&klasse=B&trafikkstasjonIder=311", {
                "headers": lagredeHeaders,
                "referrer": "https://www.vegvesen.no/",
                "body": null,
                "method": "GET",
                "mode": "cors",
                "credentials": "include"
            });

            if (response.status === 401 || response.status === 403) {
                sendVarsel("FEIL: Logget ut", "Sesjonen din har utløpt. Vennligst oppdater nettsiden for å starte på nytt.");
                loopAktiv = false;
                return;
            }

            const data = await response.json();
            const alleTimer = finnAlleTimer(data);
            const gyldigeTimer = alleTimer.filter(t => t.dato >= MIN_DATO && t.dato < MAKS_DATO);

            if (gyldigeTimer.length === 0) {
                console.log("[Sjekk] Ingen ledige timer funnet mellom " + MIN_DATO + " og " + MAKS_DATO + " akkurat nå.");
                sisteVarsledeTimer = "";
            } else {
                gyldigeTimer.sort((a, b) => (a.dato + a.klokke).localeCompare(b.dato + b.klokke));
                const oppstilling = gyldigeTimer.map(t => t.dato + " kl. " + t.klokke).join("\n");

                if (oppstilling !== sisteVarsledeTimer) {
                    sisteVarsledeTimer = oppstilling;
                    sendVarsel("LEDIG TIME FUNNET!", "Følgende tider er ledige i din periode:\n" + oppstilling);
                } else {
                    console.log("[Sjekk] Fant ledige timer, men du har allerede fått varsel om disse.");
                }
            }

        } catch (error) {
            console.error("[Tampermonkey] Feil under sjekking:", error);
        }

        const nesteSjekkMs = genererTilfeldigVentetid();
        console.log("[Sjekk] Neste sjekk om " + (nesteSjekkMs / 1000) + " sekunder...\n------------------------------------------------");
        setTimeout(sjekkLedigeTimer, nesteSjekkMs);
    }

    console.log("%c[Tampermonkey] Vegvesen Overvåker lastet inn. Venter på at du gjør et valg i kalenderen for å fange opp innloggingsdata...", "color: blue; font-weight: bold;");
})();
