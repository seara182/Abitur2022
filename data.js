/* ================================================================
   data.js — Alumni-Datensatz für den Jahrgang 2022
   Tausche die Einträge unten gegen die echten PLZ/Koordinaten aus.
   Format: { plz, city, lat, lon }
================================================================ */
'use strict';

// Kartenmarker — einfach editierbar, wird von der Leaflet-Karte gerendert
const locations = [
  { lat: 52.26751489569391, lng: 10.226607536154159, label: 'Gymnasium Groß Ilsede' },
  // Weitere Standorte hier eintragen: { lat: ..., lng: ..., label: '...' }
];

// Schul-Koordinaten — wird als "Heimatpunkt" für den Zoom + die Distanz verwendet
const SCHOOL = {
  name: 'Gymnasium Groß Ilsede',
  plz:  '31246',
  city: 'Groß Ilsede',
  lat:  52.26751489569391,
  lon:  10.226607536154159,
};

// Schuljahr-Beginn / Abi-Datum
const ABI_DATE = new Date(2022, 6, 2); // 02.07.2022

// Datenpunkte des Jubiläums — werden nach und nach ergänzt, sobald Rückmeldungen
// eintreffen. Format: { plz, city, lat, lon }.
const ALUMNI = [
  { plz: "38268", city: "Lengede",          lat: 52.2046, lon: 10.3064 },
  { plz: "38268", city: "Lengede",          lat: 52.2089, lon: 10.3010 },
  { plz: "88048", city: "Friedrichshafen",  lat: 47.6779, lon:  9.4794 },
];

// Markante "Pole" für die Distanzanzeige — größte Spanne zwischen zwei Datenpunkten.
const DISTANCE_HIGHLIGHT = {
  home: { name: 'Lengede',         lat: 52.2046, lon: 10.3064 },
  far:  { name: 'Friedrichshafen', lat: 47.6779, lon:  9.4794 },
  km:   649,
};
