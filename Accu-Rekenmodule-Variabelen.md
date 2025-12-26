# Accu-rekenmodule – Transparantie en Instelbaarheid

Dit document maakt de volledige thuisaccu-berekening inzichtelijk. Je kunt elke variabele aanpassen, ziet de hele rekenlogica en begrijpt hoe vaste én dynamische contracten worden vergeleken. De structuur volgt de briefing van `accu_rekenmodule_briefing.md`.

## Inhoudsopgave

1. [Basisinstellingen (alle invoervariabelen)](#basisinstellingen-alle-invoervariabelen)
2. [Berekeningslogica (pseudocode en scenario’s)](#berekeningslogica-pseudocode-en-scenarios)
3. [Uitleg, aannames en verbeteringen](#uitleg-aannames-en-verbeteringen)
4. [Referenties en datasets](#referenties-en-datasets)

---

## Basisinstellingen (alle invoervariabelen)

👉 Alle variabelen hieronder zijn zichtbaar in de UI. Standaardwaarden zijn “best guesses” voor 2025 en mogen direct door de gebruiker aangepast worden.

### 1.1 Kerninstellingen huishouden en productie

| Variabele | Betekenis | Default | Eenheid | Aanpasbaar |
|-----------|-----------|---------|---------|------------|
| `jaarverbruik_kWh` | Totale elektriciteitsafname net | 9000 | kWh/jaar | ✅ |
| `pv_opwek_kWh` | Jaarlijkse PV-opwekking | 5000 | kWh/jaar | ✅ |
| `eigenverbruik_zonder_accu_pct` | Direct eigenverbruik zonder accu | 35 | % | ✅ |
| `eigenverbruik_met_accu_pct` | Verwachte eigenverbruik met accu | 65 | % | ✅ |
| `saldering_actief_tot` | Laatste jaar met 100% saldering | 2026 | jaartal | ✅ |
| `energiebelasting_ct` | Saldeerbare energiebelasting stroom | 12.28 | ct/kWh | ✅ |
| `btw_pct` | BTW-percentage | 21 | % | ✅ |
| `netbeheerder` | Netbeheerder voor staffelkosten | Liander | tekst | ✅ |
| `postcodereeks` | Postcode (lookup voor profielen) | 3812 | 4 cijfers | ✅ |

### 1.2 Profielen en simulatiebestanden

| Variabele | Betekenis | Default | Eenheid | Aanpasbaar |
|-----------|-----------|---------|---------|------------|
| `dynamisch_prijsbestand` | Jaarbestand met uurprijzen (spot) | `data/spotprijzen_2024.csv` | pad | ✅ |
| `pv_profiel` | Uurlijkse PV-output (0-1 schaal t.o.v. piek) | `profiles/pv_standaard.csv` | pad | ✅ |
| `verbruiksprofiel` | Uurlijkse vraag huishouden | `profiles/load_huishouden.csv` | pad | ✅ |
| `ev_profiel` | Basis laadprofiel EV (zonder sturing) | `profiles/ev.csv` | pad | ✅ |
| `wp_profiel` | Warmtepompverbruik (uurresolutie) | `profiles/wp.csv` | pad | ✅ |
| `simulatieresolutie` | Resolutie van simulatie | uur | tekst | ✅ |
| `simulatie_jaren` | Jaren die worden doorgerekend | `['2024','2025']` | lijst | ✅ |

> 💡 Gebruik maandprofielen in plaats van uurdata? Vervang de CSV’s door aggregaten en stel `simulatieresolutie` in op `maand`.

### 1.3 Accuspecificaties en degradatie

| Variabele | Betekenis | Default | Eenheid | Aanpasbaar |
|-----------|-----------|---------|---------|------------|
| `accu_capaciteit_kWh` | Totale bruikbare capaciteit | 10 | kWh | ✅ |
| `accu_prijs_euro` | Totale investering (inclusief installatie) | 5000 | € | ✅ |
| `round_trip_efficiency_pct` | Heen-en-terug rendement | 90 | % | ✅ |
| `max_laadsnelheid_kW` | Maximaal laad/ontlaadvermogen | 5 | kW | ✅ |
| `degradatie_start_jaar` | Jaar waarin degradatie merkbaar wordt | 10 | jaar | ✅ |
| `degradatie_pct_per_jaar` | Capaciteitsverlies na startjaar | 2 | % | ✅ |
| `levensduur_analyse_jaren` | Horizon voor TCO/cashflow | 15 | jaar | ✅ |

### 1.4 Contractparameters (vast & dynamisch)

| Variabele | Betekenis | Default | Eenheid | Aanpasbaar |
|-----------|-----------|---------|---------|------------|
| `contracttype` | Vast of dynamisch | Dynamisch | keuze | ✅ |
| `stroomprijs_vast_ct` | All-in kale component vast contract | 21.0 | ct/kWh | ✅ |
| `terugleververgoeding_vast_ct` | Terugleververgoeding vast contract | 7.0 | ct/kWh | ✅ |
| `terugleverkosten_staffel` | Kosten per jaar (zie tabel hieronder) | `staffels/liander_2025.json` | pad | ✅ |
| `vaste_leveringskosten_vast` | Vaste kosten leverancier | 8.5 | €/maand | ✅ |
| `spotprijs_gemiddeld_ct` | Gemiddelde spotprijs (2025) | 8.68 | ct/kWh | ✅ |
| `opslag_afname_ct` | Opslag bij dynamische afname | 2.5 | ct/kWh | ✅ |
| `opslag_invoeding_ct` | Opslag (aftrek) bij teruglevering | 2.3 | ct/kWh | ✅ |
| `maandelijkse_vergoeding_dyn` | Vaste vergoeding dynamische leverancier | 5.99 | €/maand | ✅ |
| `laad_drempel_ct` | Maximale prijs om te laden | 6.5 | ct/kWh | ✅ |
| `ontlaad_drempel_ct` | Minimale prijs om te ontladen | 18.0 | ct/kWh | ✅ |

> 💡 Netto-afnameprijs dynamisch = `(spot + opslag_afname + energiebelasting_ct) × (1 + btw_pct/100)`.

### 1.5 Flexibele lasten (EV en warmtepomp)

| Variabele | Betekenis | Default | Eenheid | Aanpasbaar |
|-----------|-----------|---------|---------|------------|
| `ev_accu_capaciteit_kWh` | Accu van elektrische auto | 60 | kWh | ✅ |
| `ev_flex_pct` | Deel van EV-laden dat verschoven kan worden | 60 | % | ✅ |
| `ev_max_laadsnelheid_kW` | Maximaal laadvermogen EV | 11 | kW | ✅ |
| `wp_flex_pct` | Deel van warmtepompverbruik dat verschoven kan worden | 20 | % | ✅ |
| `max_flexvermogen_kW` | Totaal flexibel vermogen (EV+WP) | 8 | kW | ✅ |
| `comfortlimiet_graden` | Max. temperatuurafwijking WP-buffer | 2 | °C | ✅ |

> 👉 Flexinstellingen beïnvloeden alleen de dynamische simulatie. Bij vaste contracten worden EV/WP-profielen direct in het eigenverbruik verwerkt.

### 1.6 Terugleverkosten (standaard Liander 2025)

| Jaarlijkse teruglevering (kWh) | Kosten/jaar (€) |
|--------------------------------|-----------------|
| 0 – 500 | 36 |
| 500 – 1000 | 90 |
| 1000 – 1500 | 162 |
| 1500 – 2000 | 210 |
| 2000 – 2500 | 276 |
| 2500 – 3000 | 348 |
| 3000 – 3500 | 438 |
| 3500 – 4000 | 504 |
| 4000 – 4500 | 576 |
| 4500 – 5000 | 642 |
| 5000 – 6000 | 774 |
| 6000 – 7000 | 924 |
| 7000 – 8000 | 1068 |
| 8000 – 9000 | 1218 |
| 9000 – 10000 | 1344 |
| 10000 – 12500 | 1518 |
| 12500 – 15000 | 1890 |
| 15000 – 20000 | 2172 |
| > 20000 | 3024 |

> 💡 Andere netbeheerders? Vervang `terugleverkosten_staffel` door het juiste JSON-bestand en toon de gekoppelde tabel in de UI.

---

## Berekeningslogica (pseudocode en scenario’s)

De rekenmodule rekent vaste én dynamische contracten door. Alle stappen zijn hieronder in pseudocode weergegeven zodat de gebruiker exact ziet wat er gebeurt.

### 2.1 Stap 1 – Netto-afname en teruglevering (basis)

```pseudo
input:
  jaarverbruik_kWh
  pv_opwek_kWh
  eigenverbruik_zonder_accu_pct
  eigenverbruik_met_accu_pct

zonder_accu_eigenverbruik_kWh = pv_opwek_kWh * (eigenverbruik_zonder_accu_pct / 100)
zonder_accu_teruglevering_kWh = max(0, pv_opwek_kWh - zonder_accu_eigenverbruik_kWh)
zonder_accu_netto_afname_kWh = max(0, jaarverbruik_kWh - zonder_accu_eigenverbruik_kWh)

met_accu_eigenverbruik_kWh = pv_opwek_kWh * (eigenverbruik_met_accu_pct / 100)
met_accu_teruglevering_kWh = max(0, pv_opwek_kWh - met_accu_eigenverbruik_kWh)
met_accu_netto_afname_kWh = max(0, jaarverbruik_kWh - met_accu_eigenverbruik_kWh)

extra_eigenverbruik_kWh = met_accu_eigenverbruik_kWh - zonder_accu_eigenverbruik_kWh
```

### 2.2 Stap 2 – Waarde eigenverbruik bij vast contract

```pseudo
volle_afnameprijs_vast_ct = stroomprijs_vast_ct + energiebelasting_ct
volle_afnameprijs_vast_eur = (volle_afnameprijs_vast_ct / 100) * (1 + btw_pct/100)

vergoeding_teruglevering_ct = if jaar <= saldering_actief_tot
  then terugleververgoeding_vast_ct + energiebelasting_ct
  else max(terugleververgoeding_vast_ct, stroomprijs_vast_ct * 0.5)

waarde_eigenverbruik_vast_eur = (volle_afnameprijs_vast_ct - vergoeding_teruglevering_ct) / 100
voordeel_accu_vast_eur = extra_eigenverbruik_kWh * waarde_eigenverbruik_vast_eur

terugleverkosten_besparing = berekenMarginaleTerugleverkosten(zonder_accu_teruglevering_kWh, met_accu_teruglevering_kWh)
jaarlijks_voordeel_vast = voordeel_accu_vast_eur + terugleverkosten_besparing
```

### 2.3 Stap 3 – Dynamisch contract simulatie (uur- of maandbasis)

```pseudo
prijzen = leesCSV(dynamisch_prijsbestand)             // €/kWh
huishouden_load = combineerProfielen(verbruiksprofiel, pv_profiel, ev_profiel, wp_profiel, flexinstellingen)

accu_soc = 0.5 * accu_capaciteit_kWh                   // start op 50%
jaarlijkse_arbitrage_winst = 0
gerealiseerde_cycli = 0

voor elk tijdstip t:
  prijs_ct = prijzen[t] * 100

  // PV injectie vermindert net-afname eerst
  netto_load = huishoudelijke_load_na_eigenverbruik(t)

  if prijs_ct <= laad_drempel_ct:
    beschikbaar = min(max_laadsnelheid_kW * duur(t), accu_capaciteit_kWh - accu_soc)
    energie_te_laden = min(beschikbaar, flexibele_laadvraag(t))
    kosten_laden = energie_te_laden * prijs_ct / 100
    accu_soc += energie_te_laden * round_trip_efficiency_pct / 100
    jaarlijkse_arbitrage_winst -= kosten_laden

  if prijs_ct >= ontlaad_drempel_ct:
    beschikbaar = min(max_laadsnelheid_kW * duur(t), accu_soc)
    energie_te_ontladen = min(beschikbaar, vraag_tijdens_duur(t))
    opbrengst_ontladen = energie_te_ontladen * prijs_ct / 100
    accu_soc -= energie_te_ontladen
    jaarlijkse_arbitrage_winst += opbrengst_ontladen
    gerealiseerde_cycli += energie_te_ontladen / accu_capaciteit_kWh

jaarlijkse_arbitrage_winst *= (round_trip_efficiency_pct / 100)
jaarlijkse_arbitrage_winst -= maandelijkse_vergoeding_dyn * 12

jaarlijks_voordeel_dynamisch = voordeel_accu_vast_eur (zonder salderen) + jaarlijkse_arbitrage_winst
```

> 💡 `combineerProfielen` past EV- en WP-flex toe op de goedkoopste uren binnen comfort- en vermogenslimieten.

### 2.4 Stap 4 – Degradatie en cashflow

```pseudo
cashflow[0] = -accu_prijs_euro

voor jaar = 1 tot levensduur_analyse_jaren:
  degradatiefactor = if jaar > degradatie_start_jaar
    then (1 - degradatie_pct_per_jaar/100)^(jaar - degradatie_start_jaar)
    else 1

  voordeel_vast = jaarlijks_voordeel_vast * degradatiefactor
  voordeel_dyn = jaarlijks_voordeel_dynamisch * degradatiefactor

  cashflow_vast[jaar] = cashflow_vast[jaar-1] + voordeel_vast
  cashflow_dyn[jaar] = cashflow_dyn[jaar-1] + voordeel_dyn

  if cashflow_vast[jaar] >= 0 and terugverdientijd_vast nog niet gezet:
    terugverdientijd_vast = jaar
  if cashflow_dyn[jaar] >= 0 and terugverdientijd_dyn nog niet gezet:
    terugverdientijd_dyn = jaar
```

### 2.5 Stap 5 – Resultaten en scenariovergelijking

| Scenario | Investering (€) | Jaarlijks voordeel (vast) | Jaarlijks voordeel (dynamisch) | Terugverdientijd (vast) | Terugverdientijd (dynamisch) |
|----------|-----------------|----------------------------|---------------------------------|--------------------------|-------------------------------|
| Zonder accu | – | – | – | – | – |
| Kleine accu (5 kWh) | 1600 | 117 | –2 | 13,7 jaar | n.v.t. |
| Grote accu (10 kWh) | 6500 | 264 | 302 | 24,6 jaar | 21,5 jaar |

> 👉 Voorbeeldwaarden zijn illustratief. De UI toont realtime waarden op basis van ingevoerde profielen en prijzen.

### 2.6 Samenvattende KPIs

- `gerealiseerde_cycli_per_jaar`
- `jaarlijkse_arbitrage_winst`
- `cashflow_na_15_jaar`
- `rendement_op_investering`
- `co2_reductie_schatting` *(optioneel, op basis van emissiefactoren net vs. eigen opwek)*

---

## Uitleg, aannames en verbeteringen

### 3.1 Belangrijkste aannames

> 💡 Deze aannames zijn zichtbaar in de UI en kunnen waar mogelijk door de gebruiker worden aangepast.

- Saldering blijft 100% tot en met `saldering_actief_tot` en valt daarna terug naar 0%.
- Minimale vergoeding na 2027 is 50% van de leveringsprijs (`stroomprijs_vast_ct * 0.5`).
- Uurprofielen zijn representatief voor het gekozen huishouden, EV- en WP-gedrag.
- De gebruiker stuurt EV en warmtepomp optimaal binnen de flexpercentages en comfortlimieten.
- De spotprijsbestanden bevatten alle uurtarieven incl. negatieve prijzen.
- Monte Carlo of seizoensvariatie kan worden ingeschakeld door aanvullende opties (uit te breiden in UI).

### 3.2 Beperkingen en gevoeligheden

> ⚠️ Houd rekening met deze risico’s voordat je conclusies trekt.

- Historische spreads garanderen geen toekomstige arbitragewinst.
- Inflatie, rente, onderhoud en vervangingskosten zijn (nog) niet opgenomen.
- Netbeheerderstaffels kunnen wijzigen; controleer jaarlijks.
- Gedrag van gebruikers (handmatig laden/ontladen) kan afwijken van het algoritme.
- Degradatie is vereenvoudigd; temperatuur en laadprofiel kunnen extra impact hebben.
- EV/WP-flex veronderstelt dat gebruikers toestemming geven voor automatische sturing.

### 3.3 Hoe pas je variabelen aan?

1. **Kies scenario** – selecteer `contracttype` (vast/dynamisch).
2. **Laad datasets** – wijs CSV-bestanden toe via de bestandskiezer.
3. **Pas profielen aan** – upload eigen PV/EV/WP-profielen of gebruik seizoensgewichten.
4. **Stel drempelprijzen in** – experimenteer met `laad_drempel_ct` en `ontlaad_drempel_ct`.
5. **Simuleer** – voer de berekening uit en bekijk cashflow en terugverdientijden in de grafieken.

> 💡 Plan voor visualisaties: toon grafieken voor cashflow, jaarlijkse besparing, arbitragewinst en energiebrug (opwek → opslag → verbruik).

### 3.4 Verbeteringen op de roadmap

- Monte Carlo-simulatie over prijsblokken met `mc_iterations`, `mc_block_days`.
- Scenariovergelijker voor meerdere accuformaten tegelijk.
- Integratie met realtime API’s voor dynamische prijsvoorspellingen.
- Koppeling met belastingwijzigingen (energiebelasting, BTW) per jaar.
- Export naar CSV/JSON van alle tussenresultaten voor audit-trails.

---

## Referenties en datasets

- `src/lib/calculations/batteryCalculator.ts` – kernlogica voor scenario’s, saldering en arbitrage.
- `src/lib/constants/battery.ts` – standaardwaarden voor dynamisch en vast contract.
- `src/lib/constants/index.ts` – energiebelasting, netbeheerkosten en defaults.
- `src/lib/calculations/terugleverkosten.ts` – staffels en marginale kosten.
- `public/jeroen_punt_nl_dynamische_stroomprijzen_jaar_2024.csv` – historische uurprijzen.
- `public/jeroen_punt_nl_dynamische_stroomprijzen_jaar_2025.csv` – historische uurprijzen.
- `profiles/*.csv` – voorbeeldprofielen voor huishoudens, EV’s en warmtepompen.

---

*Laatste update: 2025*  
*Versie: 2.0*

