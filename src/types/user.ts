export interface UserProfile {
  postcode: string;                    // Voor netbeheerder lookup
  netbeheerder?: string;              // Geselecteerde netbeheerder (als postcode lookup faalt)
  aansluitingElektriciteit: "1x25A" | "1x35A" | "3x25A" | "3x35A" | "3x50A";
  aansluitingGas: "G4" | "G6" | "G10" | "G16" | "G25";
  jaarverbruikStroom: number;          // kWh
  jaarverbruikGas: number;             // m³
  heeftZonnepanelen: boolean;
  // Alleen als heeftZonnepanelen = true
  pvOpwek?: number;                    // Totale jaarproductie in kWh
  percentageZelfverbruik?: number;     // 0-100, default 35%
  
  // Nieuwe velden voor dynamische contracten
  heeftWarmtepomp: boolean;
  heeftElektrischeAuto: boolean;
  geenGas: boolean;
  
  // Optioneel
  piekDalVerdeling?: {                 // Voor dynamische tarieven
    piek: number;                      // 0-1, default 0.4
    dal: number;                       // 0-1, default 0.6
  };
}
