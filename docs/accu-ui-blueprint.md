# Accu-tool UI Blueprint

Deze blueprint koppelt de briefing en berekenhet.nl-inspiratie aan de huidige codebase. Het document vormt de basis voor de implementatiestappen uit het UI-plan.

## 1. Componentinventarisatie

| Module | Bestanden | Huidige rol | Observaties |
|--------|-----------|-------------|-------------|
| Lay-out & hero | `src/components/tool/ToolLayout.tsx` | Header + generieke hero | Generiek contractverhaal; geen specifieke CTA voor accu-tool. Geen sticky of wizard-navigatie. |
| Invoer | `src/components/tool/BatteryInputForm.tsx` | Eén lang formulier, valideert inline | Alle velden in één flow. Geen progressive disclosure, geen Zod, geen tussenstappen. |
| Resultaten | `src/components/tool/BatteryResults.tsx` | Scenario-cards + grafieken | Veel waarde maar weinig top-level KPI’s; geen tabbladen of sticky samenvatting. |
| Overige | `tool/CalculationResults.tsx`, `tool/BatteryProductShowcase.tsx` | Contractvergelijker componenten | Kunnen dienen als referentie voor cards/summaries. |

## 2. Wizardstappen & datakoppeling

Wizard bestaat uit vijf stappen, afgestemd op `UserProfile`, `BatteryInput` en briefingvariabelen.

1. **StapBasics** – Profiel & aansluiting  
   - Velden: postcode, netbeheerder (lookup), aansluiting elektriciteit/gas, jaarverbruik stroom/gas, heeftZonnepanelen toggle.  
   - Koppeling: `UserProfile.postcode`, `jaarverbruikStroom`, `aansluitingElektriciteit`, `aansluitingGas`.  
   - Validatie: Zod schema + inline hinting.

2. **StapConnection** – Netbeheer & verbruiksprofielen  
   - Velden: piek/dal verdeling, dynamisch verbruiksprofiel upload (`verbruiksprofiel`).  
   - Progressive disclosure: alleen zichtbaar na StapBasics.  
   - Extra: preview kaart met netbeheerderkosten.

3. **StapSolar** – Zonnepanelen & flex  
   - Conditional op `heeftZonnepanelen`.  
   - Velden: `pv_opwek_kWh`, `zelfverbruik_zonder_accu_pct`, slider voor eigenverbruik met accu, `pv_profiel`.  
   - Flex opties voor EV/WP: `ev_flex_pct`, `wp_flex_pct`, `max_flexvermogen_kW`.

4. **StapBattery** – Accu & investeringen  
   - Velden: `accu_capaciteit_kWh`, `accu_prijs_euro`, `round_trip_efficiency_pct`, degradatie, laadsnelheid.  
   - UI: cards met preset knoppen (klein/middel/groot) + custom invoer.

5. **StapDynamicOptions** – Tarieven & arbitrage  
   - Velden: contracttype, vaste/dynamische tarieven, `laad_drempel_ct`, `ontlaad_drempel_ct`, `dynamisch_prijsbestand`.  
  - Samenvattingspaneel: toont alle gemaakte keuzes + call-to-action `Bereken`.

Elke stap heeft een lokale slice die mapt naar Zustand store of context zodat resultaten direct bruikbaar zijn door `calculateBatteryScenarios`.

## 3. Hero & navigatieconcept

### Hero (ToolLayout)
- Titel: “Bereken jouw accu-terugverdientijd in 5 stappen”.  
- Subtitel: kort voordeel, “Combineer zonnepanelen, dynamische prijzen en accu’s zonder Excel”.  
- CTA-knoppen: “Start berekening” (scroll naar wizard) en secundair “Bekijk voorbeeldresultaten”.  
- Visual: eenvoudige illustratie of stat highlight (bijv. “Gemiddelde besparing €… per jaar”).  
- Sticky header: toont stappenindicator (“Stap 2 van 5”) en `Bereken opnieuw` knop zodra gebruiker scrolt voorbij hero.

### Navigatiepatronen
- Top van wizard: breadcrumbs met iconen (Profiel → Zonnepanelen → Accu → Tarieven → Overzicht).  
- Rechts (desktop): samenvattingskolom met live KPI’s (kWh, investering, geschatte terugverdientijd zodra berekend).  
- Mobiel: sticky footer met “Volgende stap” / “Opslaan & volgende”.

## 4. Resultaatgebied

1. **Top KPI-kaarten**  
   - URL: `BatteryResults` opbreken in “headline metrics” (beste scenario, terugverdientijd, cashflow jaar 5).  
   - Grote kaart bovenaan met scenario-badge en CTA “Download als PDF” (future).

2. **Scenario-tabbladen**  
   - Tabs: Huidig, Na 2027, Dynamisch, + optie “Eigen scenario” (in toekomst).  
   - Binnen tab: kaart met besparingsbron, cashflow mini-chart, details link.

3. **Sticky samenvatting**  
   - Compact paneel met belangrijkste cijfers + knop `Nieuwe berekening`.  
   - Op mobiel als expandable drawer.

4. **Visualisaties**  
   - Cashflow (Line chart) & Jaarlijkse besparing (Stacked bar) blijven, maar wrappercards krijgen duidelijke titels/tooltips.  
   - Extra donut voor energieverdeling eigenverbruik/teruglevering (berekenhet stijl).

## 5. Interactie & feedback

- **Validatie**: Zod schema’s per stap met `react-hook-form` of custom wrapper. Fouten inline (onder veld) + top-level alert.  
- **Debounce**: 500ms op inputs die herberekeningen triggeren (piek/dal, drempels).  
- **Loading**: skeleton cards voor KPI’s; hero CTA toont spinner tijdens berekenen.  
- **Toasts**: succes/waarschuwing bij afronden berekening of CSV-fout.  
- **Error boundary**: voor `BatteryResults` en recharts (fallback melding).  
- **Accessibility**: form labels, focus management bij stapwissel, ARIA voor progress indicator.

## 6. Openstaande beslissingen

- Opslag van wizard state: bestaande store uitbreiden of dedicated `batteryWizardStore`.  
- File upload handling (CSV) – client-side parsing (PapaParse) vs. backend.  
- Optionele EV/WP visualisatie in resultatenfase (roadmap).

Dit blueprint-document wordt als referentie gebruikt tijdens implementatie van de resterende planstappen. Nadere tweaks kunnen via pull request review worden vastgelegd.

