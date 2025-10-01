## **Project Overview**

Bouw een moderne, responsieve web-applicatie voor het vergelijken van Nederlandse energiecontracten met focus op accurate berekeningen van totale jaarkosten, inclusief complexe salderingsberekeningen voor zonnepanelen.

---

## **Tech Stack Requirements**

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **State Management:** Zustand of React Context
- **Charts:** Recharts voor visualisaties
- **Validatie:** Zod voor type-safe schemas
- **Database:** SQLite met Drizzle ORM (voor leveranciers/tarieven)

---

## **Core Features & User Flow**

### **1. Input Form (Stap 1)**

```
interface UserProfile {  postcode: string;                    // Voor netbeheerder lookup  aansluitingElektriciteit: "1x25A" | "1x35A" | "3x25A" | "3x35A" | "3x50A";  aansluitingGas: "G4" | "G6" | "G10" | "G16" | "G25";  jaarverbruikStroom: number;          // kWh  jaarverbruikGas: number;             // m³  heeftZonnepanelen: boolean;    // Alleen als heeftZonnepanelen = true  pvOpwek?: number;                    // Totale jaarproductie in kWh  percentageZelfverbruik?: number;     // 0-100, default 35%    // Optioneel  piekDalVerdeling?: {                 // Voor dynamische tarieven    piek: number;                      // 0-1, default 0.4    dal: number;                       // 0-1, default 0.6  };}
```

### **2. Berekening Engine**

```
interface ContractData {  leverancier: string;  productNaam: string;  type: "vast" | "variabel" | "dynamisch";  looptijdMaanden: number;    // Leverancier kosten  vasteLeveringskosten: number;        // €/maand  tarieven: {    stroomKalePrijs: number;           // €/kWh    gasKalePrijs: number;              // €/m³    terugleververgoeding: number;      // €/kWh    vasteTerugleverkosten?: number;    // €/jaar bij PV  };    // Marketing  kortingEenmalig: number;             // €  duurzaamheidsScore: number;          // 0-10  klanttevredenheid: number;           // 0-10}interface BerekeningResult {  // Hoofdresultaten  totaleJaarkosten: number;  totaleJaarkostenMetPv: number;       // Met PV-opbrengsten  maandlastenGemiddeld: number;    // Details stroom  stroomKosten: {    kaleEnergie: number;    energiebelasting: number;    btw: number;    netbeheer: number;    totaal: number;  };    // Details gas  gasKosten: {    kaleEnergie: number;    energiebelasting: number;          // Gestaffeld    btw: number;    netbeheer: number;    totaal: number;  };    // PV details (alleen bij zonnepanelen)  pvOpbrengsten?: {    zelfVerbruikKwh: number;    zelfVerbruikWaarde: number;        // €, informatief    gesaldeerdKwh: number;    salderingsBesparing: number;       // € bespaard door saldering    nettoTerugleveringKwh: number;    terugleververgoedingBedrag: number; // €    totaleOpbrengst: number;           // € saldering + vergoeding  };    // Vergelijking  positieInRanking: number;  verschilMetGoedkoopste: number;      // €}
```

---

## **Kritieke Berekeningformules**

### **Energiebelasting Gas (Gestaffeld)**

```
const berekenGasbelasting = (verbruikM3: number): number => {  const staffels = [    { vanaf: 0, tot: 1000, tarief: 0.70544 },    { vanaf: 1000, tot: 170000, tarief: 0.70544 },    { vanaf: 170000, tot: 1000000, tarief: 0.31573 },    { vanaf: 1000000, tot: 10000000, tarief: 0.20347 },    { vanaf: 10000000, tot: Infinity, tarief: 0.05385 }  ];    let belasting = 0;  let resterendVerbruik = verbruikM3;    for (const staffel of staffels) {    const verbruikInStaffel = Math.min(resterendVerbruik, staffel.tot - staffel.vanaf);    if (verbruikInStaffel > 0) {      belasting += verbruikInStaffel * staffel.tarief;      resterendVerbruik -= verbruikInStaffel;    }  }    return belasting;};
```

### **Saldering Berekening (Meest Complex)**

```
const berekenSaldering = (  pvOpwek: number,  jaarverbruik: number,  percentageZelfverbruik: number,  salderingsPercentage: number = 1.0  // 1.0 t/m 2026) => {  // Stap 1: Verdeel PV opwek  const zelfVerbruikKwh = pvOpwek * (percentageZelfverbruik / 100);  const terugleveringKwh = pvOpwek - zelfVerbruikKwh;  const afnameVanNetKwh = Math.max(0, jaarverbruik - zelfVerbruikKwh);    // Stap 2: Saldering toepassen  const gesaldeerdKwh = Math.min(afnameVanNetKwh, terugleveringKwh) * salderingsPercentage;  const nettoTerugleveringKwh = Math.max(0, terugleveringKwh - afnameVanNetKwh);    // Stap 3: Financiële impact  const ENERGIEBELASTING_STROOM = 0.13163;  const BTW = 0.21;    const salderingsBesparing = gesaldeerdKwh * (    stroomKalePrijs + ENERGIEBELASTING_STROOM  ) * (1 + BTW);    const terugleververgoeding = nettoTerugleveringKwh * contract.terugleververgoeding;    return {    zelfVerbruikKwh,    gesaldeerdKwh,    nettoTerugleveringKwh,    salderingsBesparing,    terugleververgoeding,    totaleOpbrengst: salderingsBesparing + terugleververgoeding  };};
```

---

## **Database Schema**

```
-- Leveranciers en hun productenCREATE TABLE leveranciers (  id INTEGER PRIMARY KEY,  naam TEXT NOT NULL,  logo_url TEXT,  website TEXT,  klanttevredenheid REAL,  duurzaamheidsscore REAL);CREATE TABLE energieproducten (  id INTEGER PRIMARY KEY,  leverancier_id INTEGER,  product_naam TEXT,  type TEXT, -- 'vast', 'variabel', 'dynamisch'  looptijd_maanden INTEGER,  vaste_leveringskosten REAL,  stroom_kale_prijs REAL,  gas_kale_prijs REAL,  terugleververgoeding REAL,  vaste_terugleverkosten REAL,  welkomstbonus REAL,  geldig_vanaf DATE,  geldig_tot DATE,  FOREIGN KEY (leverancier_id) REFERENCES leveranciers(id));-- Netbeheerders per postcodeCREATE TABLE netbeheerders (  postcode_van TEXT,  postcode_tot TEXT,  netbeheerder TEXT,  vastrecht_elektriciteit_laag REAL,  -- 1x25A etc.  vastrecht_elektriciteit_hoog REAL,  -- 3x35A etc.  vastrecht_gas_g4 REAL,  vastrecht_gas_g6 REAL);
```

---

## **UI/UX Requirements**

### **Layout Structure**

```
├── Header (logo, navigatie)├── Hero Section (titel, subtitel, CTA)├── Input Form │   ├── Basisgegevens (postcode, verbruik)│   ├── Aansluiting details│   └── Zonnepanelen sectie (conditional)├── Results Section│   ├── Top 3 aanbieders (cards)│   ├── Volledige vergelijking (tabel)│   └── PV opbrengsten breakdown (chart)└── Footer
```

### **Key Components**

**1. Input Form met Progressive Disclosure**

```
// Form sections die progressief verschijnenconst FormSections = () => (  <div className="space-y-8">    <BasicsSection />    <ConnectionSection />    {heeftZonnepanelen && <SolarSection />}    <AdvancedOptions collapsed={true} />  </div>);// Solar section met sliderconst SolarSection = () => (  <Card>    <CardHeader>      <CardTitle>Zonnepanelen gegevens</CardTitle>    </CardHeader>    <CardContent>      <div className="space-y-4">        <InputField           label="Jaarlijkse opwek (kWh)"          name="pvOpwek"          type="number"          placeholder="3500"        />        <SliderField          label="Percentage direct zelfverbruik"          name="percentageZelfverbruik"          min={15}          max={70}          defaultValue={35}          formatLabel={(value) => `${value}%`}          helpText="Hoeveel van je zonneproductie gebruik je direct in huis?"        />      </div>    </CardContent>  </Card>);
```

**2. Results Cards**

```
const ResultCard = ({ result, rank }: { result: BerekeningResult, rank: number }) => (  <Card className={`${rank === 1 ? 'ring-2 ring-green-500' : ''} relative`}>    {rank === 1 && <Badge className="absolute -top-2 left-4 bg-green-500">Beste Deal</Badge>}        <CardHeader>      <div className="flex justify-between">        <div>          <CardTitle>{result.leverancier}</CardTitle>          <p className="text-sm text-muted-foreground">{result.productNaam}</p>        </div>        <div className="text-right">          <div className="text-2xl font-bold">€{result.totaleJaarkostenMetPv}</div>          <div className="text-sm text-muted-foreground">per jaar</div>        </div>      </div>    </CardHeader>        <CardContent>      <div className="space-y-2">        <div className="flex justify-between">          <span>Maandlasten</span>          <span>€{result.maandlastenGemiddeld}</span>        </div>        {result.pvOpbrengsten && (          <div className="flex justify-between text-green-600">            <span>PV Opbrengst</span>            <span>-€{result.pvOpbrengsten.totaleOpbrengst}</span>          </div>        )}      </div>            <Button className="w-full mt-4">        Bekijk Details      </Button>    </CardContent>  </Card>);
```

**3. PV Opbrengsten Breakdown Chart**

```
const PVBreakdownChart = ({ pvData }: { pvData: PvOpbrengsten }) => (  <Card>    <CardHeader>      <CardTitle>Je Zonnepanelen Opbrengsten</CardTitle>    </CardHeader>    <CardContent>      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">        <StatCard           title="Zelf Verbruikt"          value={`${pvData.zelfVerbruikKwh} kWh`}          subValue={`€${pvData.zelfVerbruikWaarde} waarde`}          color="blue"        />        <StatCard           title="Gesaldeerd"          value={`${pvData.gesaldeerdKwh} kWh`}          subValue={`€${pvData.salderingsBesparing} bespaard`}          color="green"        />        <StatCard           title="Netto Teruggeleverd"          value={`${pvData.nettoTerugleveringKwh} kWh`}          subValue={`€${pvData.terugleververgoeding} vergoeding`}          color="orange"        />      </div>            {/* Pie chart van verdeling */}      <ResponsiveContainer width="100%" height={300}>        <PieChart>          <Pie            data={[              { name: 'Zelf verbruikt', value: pvData.zelfVerbruikKwh, fill: '#3b82f6' },              { name: 'Gesaldeerd', value: pvData.gesaldeerdKwh, fill: '#10b981' },              { name: 'Teruggeleverd', value: pvData.nettoTerugleveringKwh, fill: '#f59e0b' }            ]}            cx="50%"            cy="50%"            outerRadius={80}            dataKey="value"            label={({name, value}) => `${name}: ${value} kWh`}          />        </PieChart>      </ResponsiveContainer>    </CardContent>  </Card>);
```

---

## **Code Organization**

```
src/├── app/│   ├── page.tsx                    # Main comparison page│   ├── layout.tsx│   └── globals.css├── components/│   ├── ui/                        # shadcn components│   ├── forms/│   │   ├── UserInputForm.tsx│   │   ├── SolarSection.tsx│   │   └── ConnectionSection.tsx│   ├── results/│   │   ├── ResultCard.tsx│   │   ├── ComparisonTable.tsx│   │   └── PVBreakdownChart.tsx│   └── layout/│       ├── Header.tsx│       └── Footer.tsx├── lib/│   ├── calculations/│   │   ├── energyCalculator.ts    # Main calculation engine│   │   ├── saldering.ts           # PV specific calculations│   │   └── gasStaffels.ts         # Gas tax brackets│   ├── data/│   │   ├── leveranciers.ts        # Static data or DB queries│   │   └── netbeheerders.ts       # Postcode to grid operator mapping│   ├── utils/│   │   ├── validation.ts          # Zod schemas│   │   └── formatting.ts          # Currency, number formatting│   └── db/│       ├── schema.ts              # Drizzle schemas│       └── queries.ts             # DB operations├── stores/│   └── calculationStore.ts        # Zustand store for user inputs└── types/    ├── contracts.ts    ├── calculations.ts    └── user.ts
```

---

## **Development Priorities**

### **Phase 1 (MVP)**

1. Basic input form (no PV yet)
2. Core calculation engine (stroom + gas)
3. Simple results display (3 cards)
4. Static data for ~5 major leveranciers

### **Phase 2**

1. Zonnepanelen functionaliteit
2. Saldering berekeningen
3. PV opbrengsten visualisatie
4. Uitgebreide vergelijkingstabel

### **Phase 3**

1. Database implementatie
2. Postcode → netbeheerder lookup
3. Geavanceerde filters & sortering
4. Export functionaliteit (PDF rapport)

---

## **Testing Requirements**

Implementeer unit tests voor alle berekeningen:

```
describe('energyCalculator', () => {  test('berekent basis stroomkosten correct', () => {    expect(berekenStroomkosten(2900, 0.10)).toBeCloseTo(290.00, 2);  });    test('berekent gas staffels correct', () => {    expect(berekenGasbelasting(500)).toBeCloseTo(352.72, 2);    expect(berekenGasbelasting(1500)).toBeCloseTo(1058.16, 2);  });    test('berekent saldering correct', () => {    const result = berekenSaldering(4000, 3000, 35, 1.0);    expect(result.zelfVerbruikKwh).toBe(1400);    expect(result.gesaldeerdKwh).toBe(1600);    expect(result.nettoTerugleveringKwh).toBe(1000);  });});
```

---

## **Performance & UX Notes**

- **Debounce** input fields (500ms) om onnodige herberekeningen te voorkomen
- **Optimistic updates** voor form changes
- **Loading states** tijdens berekeningen
- **Error boundaries** voor calculation failures
- **Responsive design** mobile-first
- **Accessibility** (proper labels, ARIA attributes)

---

Start met het opzetten van de project structuur en de core calculation engine. Focus eerst op de accuratesse van de berekeningen voordat je de UI gaat bouwen.