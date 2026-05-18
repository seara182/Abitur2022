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

// 104 Alumni-Einträge. Geclustert um die Schule, einige verstreut, ein paar im Ausland.
// Bearbeitung: einfach diese Liste austauschen — der Rest der Seite zieht sich live nach.
const ALUMNI = [
  { plz: "31246"    , city: "Lahstedt"                  , lat:  52.2033, lon:   10.3102 },
  { plz: "31246"    , city: "Lahstedt"                  , lat:  52.2186, lon:   10.2869 },
  { plz: "31246"    , city: "Lahstedt"                  , lat:  52.2094, lon:   10.2831 },
  { plz: "31246"    , city: "Lahstedt"                  , lat:  52.2311, lon:   10.2982 },
  { plz: "31246"    , city: "Lahstedt"                  , lat:  52.2284, lon:   10.2949 },
  { plz: "31246"    , city: "Lahstedt"                  , lat:  52.2172, lon:   10.2913 },
  { plz: "31246"    , city: "Lahstedt"                  , lat:  52.2358, lon:   10.2875 },
  { plz: "31246"    , city: "Lahstedt"                  , lat:  52.2092, lon:   10.3045 },
  { plz: "31246"    , city: "Lahstedt"                  , lat:  52.2293, lon:    10.301 },
  { plz: "31246"    , city: "Lahstedt"                  , lat:  52.2003, lon:   10.3024 },
  { plz: "31246"    , city: "Lahstedt"                  , lat:  52.2127, lon:   10.3111 },
  { plz: "31246"    , city: "Lahstedt"                  , lat:  52.2291, lon:   10.2909 },
  { plz: "31226"    , city: "Peine"                     , lat:  52.3084, lon:   10.2175 },
  { plz: "31226"    , city: "Peine"                     , lat:  52.3125, lon:   10.2412 },
  { plz: "31226"    , city: "Peine"                     , lat:  52.3058, lon:   10.2348 },
  { plz: "31226"    , city: "Peine"                     , lat:  52.3066, lon:   10.2208 },
  { plz: "31226"    , city: "Peine"                     , lat:  52.3287, lon:   10.2249 },
  { plz: "31226"    , city: "Peine"                     , lat:  52.3367, lon:   10.2239 },
  { plz: "31226"    , city: "Peine"                     , lat:  52.3162, lon:   10.2205 },
  { plz: "31226"    , city: "Peine"                     , lat:  52.3277, lon:   10.2209 },
  { plz: "31226"    , city: "Peine"                     , lat:  52.3346, lon:   10.2204 },
  { plz: "31226"    , city: "Peine"                     , lat:  52.3316, lon:   10.2178 },
  { plz: "31228"    , city: "Peine-Stederdorf"          , lat:  52.3518, lon:   10.2296 },
  { plz: "31228"    , city: "Peine-Stederdorf"          , lat:  52.3617, lon:   10.2266 },
  { plz: "31228"    , city: "Peine-Stederdorf"          , lat:  52.3431, lon:   10.2162 },
  { plz: "31228"    , city: "Peine-Stederdorf"          , lat:  52.3398, lon:   10.2172 },
  { plz: "31228"    , city: "Peine-Stederdorf"          , lat:  52.3415, lon:   10.2473 },
  { plz: "31228"    , city: "Peine-Stederdorf"          , lat:    52.37, lon:   10.2152 },
  { plz: "31303"    , city: "Burgdorf"                  , lat:   52.469, lon:   10.0006 },
  { plz: "31303"    , city: "Burgdorf"                  , lat:  52.4433, lon:   10.0027 },
  { plz: "31303"    , city: "Burgdorf"                  , lat:  52.4504, lon:   10.0062 },
  { plz: "31303"    , city: "Burgdorf"                  , lat:  52.4451, lon:   10.0197 },
  { plz: "31303"    , city: "Burgdorf"                  , lat:  52.4389, lon:   10.0007 },
  { plz: "31303"    , city: "Lehrte"                    , lat:  52.3832, lon:    9.9882 },
  { plz: "31303"    , city: "Lehrte"                    , lat:  52.3847, lon:    9.9842 },
  { plz: "31303"    , city: "Lehrte"                    , lat:  52.3813, lon:    9.9707 },
  { plz: "31303"    , city: "Lehrte"                    , lat:  52.3595, lon:    9.9679 },
  { plz: "31303"    , city: "Lehrte"                    , lat:  52.3544, lon:     9.971 },
  { plz: "31303"    , city: "Lehrte"                    , lat:  52.3647, lon:    9.9952 },
  { plz: "31249"    , city: "Hohenhameln"               , lat:  52.2868, lon:   10.1344 },
  { plz: "31249"    , city: "Hohenhameln"               , lat:  52.2699, lon:   10.1398 },
  { plz: "31249"    , city: "Hohenhameln"               , lat:  52.2698, lon:   10.1363 },
  { plz: "31249"    , city: "Hohenhameln"               , lat:  52.2719, lon:   10.1499 },
  { plz: "31249"    , city: "Hohenhameln"               , lat:  52.2546, lon:   10.1328 },
  { plz: "31199"    , city: "Diekholzen"                , lat:  52.1058, lon:    9.9533 },
  { plz: "31199"    , city: "Diekholzen"                , lat:  52.0975, lon:    9.9716 },
  { plz: "31199"    , city: "Diekholzen"                , lat:   52.122, lon:    9.9393 },
  { plz: "30159"    , city: "Hannover"                  , lat:  52.3579, lon:    9.7438 },
  { plz: "30159"    , city: "Hannover"                  , lat:  52.3776, lon:    9.7481 },
  { plz: "30159"    , city: "Hannover"                  , lat:  52.3643, lon:    9.7356 },
  { plz: "30159"    , city: "Hannover"                  , lat:  52.3604, lon:     9.734 },
  { plz: "30159"    , city: "Hannover"                  , lat:  52.3909, lon:     9.757 },
  { plz: "30159"    , city: "Hannover"                  , lat:  52.3779, lon:    9.7412 },
  { plz: "30159"    , city: "Hannover"                  , lat:  52.3908, lon:    9.7293 },
  { plz: "30159"    , city: "Hannover"                  , lat:  52.3597, lon:    9.7398 },
  { plz: "30159"    , city: "Hannover"                  , lat:  52.3776, lon:    9.7315 },
  { plz: "30161"    , city: "Hannover-List"             , lat:  52.4051, lon:    9.7464 },
  { plz: "30161"    , city: "Hannover-List"             , lat:  52.3952, lon:    9.7375 },
  { plz: "30161"    , city: "Hannover-List"             , lat:  52.3788, lon:    9.7427 },
  { plz: "30161"    , city: "Hannover-List"             , lat:   52.403, lon:     9.767 },
  { plz: "30169"    , city: "Hannover-Süd"              , lat:  52.3417, lon:    9.7467 },
  { plz: "30169"    , city: "Hannover-Süd"              , lat:  52.3385, lon:    9.7314 },
  { plz: "30169"    , city: "Hannover-Süd"              , lat:  52.3636, lon:    9.7324 },
  { plz: "31134"    , city: "Hildesheim"                , lat:  52.1416, lon:    9.9682 },
  { plz: "31134"    , city: "Hildesheim"                , lat:  52.1651, lon:    9.9583 },
  { plz: "31134"    , city: "Hildesheim"                , lat:  52.1409, lon:     9.971 },
  { plz: "31134"    , city: "Hildesheim"                , lat:  52.1304, lon:     9.932 },
  { plz: "31134"    , city: "Hildesheim"                , lat:  52.1617, lon:    9.9655 },
  { plz: "31134"    , city: "Hildesheim"                , lat:   52.148, lon:    9.9576 },
  { plz: "38100"    , city: "Braunschweig"              , lat:  52.2795, lon:    10.509 },
  { plz: "38100"    , city: "Braunschweig"              , lat:  52.2552, lon:   10.5221 },
  { plz: "38100"    , city: "Braunschweig"              , lat:  52.2714, lon:   10.5013 },
  { plz: "38100"    , city: "Braunschweig"              , lat:  52.2668, lon:   10.5226 },
  { plz: "38100"    , city: "Braunschweig"              , lat:  52.2606, lon:   10.5101 },
  { plz: "38440"    , city: "Wolfsburg"                 , lat:  52.4056, lon:   10.8038 },
  { plz: "38440"    , city: "Wolfsburg"                 , lat:  52.4202, lon:   10.7872 },
  { plz: "38440"    , city: "Wolfsburg"                 , lat:  52.4396, lon:   10.8016 },
  { plz: "37073"    , city: "Göttingen"                 , lat:  51.5206, lon:    9.9181 },
  { plz: "37073"    , city: "Göttingen"                 , lat:  51.5354, lon:    9.9281 },
  { plz: "37073"    , city: "Göttingen"                 , lat:  51.5231, lon:    9.9268 },
  { plz: "28195"    , city: "Bremen"                    , lat:  53.0872, lon:    8.7931 },
  { plz: "28195"    , city: "Bremen"                    , lat:  53.0773, lon:    8.8148 },
  { plz: "20095"    , city: "Hamburg"                   , lat:  53.5447, lon:   10.0012 },
  { plz: "20095"    , city: "Hamburg"                   , lat:  53.5534, lon:   10.0013 },
  { plz: "20095"    , city: "Hamburg"                   , lat:  53.5555, lon:    9.9739 },
  { plz: "10115"    , city: "Berlin-Mitte"              , lat:  52.5246, lon:   13.3785 },
  { plz: "10115"    , city: "Berlin-Mitte"              , lat:  52.5202, lon:   13.3878 },
  { plz: "10115"    , city: "Berlin-Mitte"              , lat:  52.5469, lon:   13.3902 },
  { plz: "10115"    , city: "Berlin-Mitte"              , lat:  52.5181, lon:   13.3961 },
  { plz: "10967"    , city: "Berlin-Kreuzberg"          , lat:  52.4874, lon:   13.4126 },
  { plz: "10967"    , city: "Berlin-Kreuzberg"          , lat:  52.5039, lon:   13.3825 },
  { plz: "50667"    , city: "Köln"                      , lat:  50.9429, lon:    6.9602 },
  { plz: "50667"    , city: "Köln"                      , lat:  50.9337, lon:    6.9492 },
  { plz: "40213"    , city: "Düsseldorf"                , lat:  51.2161, lon:    6.7712 },
  { plz: "44135"    , city: "Dortmund"                  , lat:  51.5329, lon:    7.4684 },
  { plz: "45127"    , city: "Essen"                     , lat:  51.4493, lon:    7.0261 },
  { plz: "60311"    , city: "Frankfurt a.M."            , lat:  50.1141, lon:    8.6713 },
  { plz: "60311"    , city: "Frankfurt a.M."            , lat:  50.0971, lon:    8.6983 },
  { plz: "60311"    , city: "Frankfurt a.M."            , lat:  50.0979, lon:    8.6652 },
  { plz: "68159"    , city: "Mannheim"                  , lat:  49.4732, lon:    8.4649 },
  { plz: "70173"    , city: "Stuttgart"                 , lat:  48.7821, lon:    9.1819 },
  { plz: "70173"    , city: "Stuttgart"                 , lat:  48.7786, lon:    9.1809 },
  { plz: "80331"    , city: "München"                   , lat:  48.1289, lon:   11.5933 },
  { plz: "80331"    , city: "München"                   , lat:  48.1358, lon:   11.5726 },
];

// Markante "Pole" für die Distanzanzeige — wird vom Skript automatisch
// auf das tatsächliche maximal entfernte Paar in ALUMNI aktualisiert.
const DISTANCE_HIGHLIGHT = {
  home: { name: 'Hier', lat: 47.6603, lon: 9.4753 },
  far:  { name: 'Da',           lat: 35.6762, lon: 139.6503 },
  km:   8432,
};
