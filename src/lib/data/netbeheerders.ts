/**
 * Netbeheerder data met regios en specifieke kosten
 * Gebaseerd op "Overzicht Kostencomponenten Energie"
 */

export interface Netbeheerder {
  naam: string;
  regios: string[]; // Postcode ranges
  kostenStroom: number; // €/jaar
  kostenGas: number; // €/jaar
}

export const netbeheerders: Netbeheerder[] = [
  {
    naam: "Liander",
    regios: [
      "1000-1099", // Amsterdam
      "1100-1199", // Amsterdam
      "1200-1299", // Amsterdam
      "1300-1399", // Amsterdam
      "1400-1499", // Amsterdam
      "1500-1599", // Amsterdam
      "1600-1699", // Amsterdam
      "1700-1799", // Amsterdam
      "1800-1899", // Amsterdam
      "1900-1999", // Amsterdam
      "2000-2099", // Haarlem
      "2100-2199", // Haarlem
      "2200-2299", // Haarlem
      "2300-2399", // Leiden
      "2400-2499", // Leiden
      "2500-2599", // Den Haag
      "2600-2699", // Den Haag
      "2700-2799", // Den Haag
      "2800-2899", // Den Haag
      "2900-2999", // Den Haag
      "3000-3099", // Rotterdam
      "3100-3199", // Rotterdam
      "3200-3299", // Rotterdam
      "3300-3399", // Rotterdam
      "3400-3499", // Rotterdam
      "3500-3599", // Utrecht
      "3600-3699", // Utrecht
      "3700-3799", // Utrecht
      "3800-3899", // Utrecht
      "3900-3999", // Utrecht
      "4000-4099", // Arnhem
      "4100-4199", // Arnhem
      "4200-4299", // Arnhem
      "4300-4399", // Arnhem
      "4400-4499", // Arnhem
      "4500-4599", // Arnhem
      "4600-4699", // Arnhem
      "4700-4799", // Arnhem
      "4800-4899", // Arnhem
      "4900-4999", // Arnhem
      "5000-5099", // Tilburg
      "5100-5199", // Tilburg
      "5200-5299", // Tilburg
      "5300-5399", // Tilburg
      "5400-5499", // Tilburg
      "5500-5599", // Tilburg
      "5600-5699", // Tilburg
      "5700-5799", // Tilburg
      "5800-5899", // Tilburg
      "5900-5999", // Tilburg
      "6000-6099", // Eindhoven
      "6100-6199", // Eindhoven
      "6200-6299", // Eindhoven
      "6300-6399", // Eindhoven
      "6400-6499", // Eindhoven
      "6500-6599", // Eindhoven
      "6600-6699", // Eindhoven
      "6700-6799", // Eindhoven
      "6800-6899", // Eindhoven
      "6900-6999", // Eindhoven
      "7000-7099", // Enschede
      "7100-7199", // Enschede
      "7200-7299", // Enschede
      "7300-7399", // Enschede
      "7400-7499", // Enschede
      "7500-7599", // Enschede
      "7600-7699", // Enschede
      "7700-7799", // Enschede
      "7800-7899", // Enschede
      "7900-7999", // Enschede
      "8000-8099", // Zwolle
      "8100-8199", // Zwolle
      "8200-8299", // Zwolle
      "8300-8399", // Zwolle
      "8400-8499", // Zwolle
      "8500-8599", // Zwolle
      "8600-8699", // Zwolle
      "8700-8799", // Zwolle
      "8800-8899", // Zwolle
      "8900-8999", // Zwolle
      "9000-9099", // Groningen
      "9100-9199", // Groningen
      "9200-9299", // Groningen
      "9300-9399", // Groningen
      "9400-9499", // Groningen
      "9500-9599", // Groningen
      "9600-9699", // Groningen
      "9700-9799", // Groningen
      "9800-9899", // Groningen
      "9900-9999", // Groningen
    ],
    kostenStroom: 471,
    kostenGas: 248
  },
  {
    naam: "Stedin",
    regios: [
      "1000-1099", // Amsterdam (deels)
      "1100-1199", // Amsterdam (deels)
      "1200-1299", // Amsterdam (deels)
      "1300-1399", // Amsterdam (deels)
      "1400-1499", // Amsterdam (deels)
      "1500-1599", // Amsterdam (deels)
      "1600-1699", // Amsterdam (deels)
      "1700-1799", // Amsterdam (deels)
      "1800-1899", // Amsterdam (deels)
      "1900-1999", // Amsterdam (deels)
      "2000-2099", // Haarlem (deels)
      "2100-2199", // Haarlem (deels)
      "2200-2299", // Haarlem (deels)
      "2300-2399", // Leiden (deels)
      "2400-2499", // Leiden (deels)
      "2500-2599", // Den Haag (deels)
      "2600-2699", // Den Haag (deels)
      "2700-2799", // Den Haag (deels)
      "2800-2899", // Den Haag (deels)
      "2900-2999", // Den Haag (deels)
      "3000-3099", // Rotterdam (deels)
      "3100-3199", // Rotterdam (deels)
      "3200-3299", // Rotterdam (deels)
      "3300-3399", // Rotterdam (deels)
      "3400-3499", // Rotterdam (deels)
      "3500-3599", // Utrecht (deels)
      "3600-3699", // Utrecht (deels)
      "3700-3799", // Utrecht (deels)
      "3800-3899", // Utrecht (deels)
      "3900-3999", // Utrecht (deels)
    ],
    kostenStroom: 490,
    kostenGas: 268
  },
  {
    naam: "Enexis",
    regios: [
      "4000-4099", // Arnhem (deels)
      "4100-4199", // Arnhem (deels)
      "4200-4299", // Arnhem (deels)
      "4300-4399", // Arnhem (deels)
      "4400-4499", // Arnhem (deels)
      "4500-4599", // Arnhem (deels)
      "4600-4699", // Arnhem (deels)
      "4700-4799", // Arnhem (deels)
      "4800-4899", // Arnhem (deels)
      "4900-4999", // Arnhem (deels)
      "5000-5099", // Tilburg (deels)
      "5100-5199", // Tilburg (deels)
      "5200-5299", // Tilburg (deels)
      "5300-5399", // Tilburg (deels)
      "5400-5499", // Tilburg (deels)
      "5500-5599", // Tilburg (deels)
      "5600-5699", // Tilburg (deels)
      "5700-5799", // Tilburg (deels)
      "5800-5899", // Tilburg (deels)
      "5900-5999", // Tilburg (deels)
      "6000-6099", // Eindhoven (deels)
      "6100-6199", // Eindhoven (deels)
      "6200-6299", // Eindhoven (deels)
      "6300-6399", // Eindhoven (deels)
      "6400-6499", // Eindhoven (deels)
      "6500-6599", // Eindhoven (deels)
      "6600-6699", // Eindhoven (deels)
      "6700-6799", // Eindhoven (deels)
      "6800-6899", // Eindhoven (deels)
      "6900-6999", // Eindhoven (deels)
      "7000-7099", // Enschede (deels)
      "7100-7199", // Enschede (deels)
      "7200-7299", // Enschede (deels)
      "7300-7399", // Enschede (deels)
      "7400-7499", // Enschede (deels)
      "7500-7599", // Enschede (deels)
      "7600-7699", // Enschede (deels)
      "7700-7799", // Enschede (deels)
      "7800-7899", // Enschede (deels)
      "7900-7999", // Enschede (deels)
      "8000-8099", // Zwolle (deels)
      "8100-8199", // Zwolle (deels)
      "8200-8299", // Zwolle (deels)
      "8300-8399", // Zwolle (deels)
      "8400-8499", // Zwolle (deels)
      "8500-8599", // Zwolle (deels)
      "8600-8699", // Zwolle (deels)
      "8700-8799", // Zwolle (deels)
      "8800-8899", // Zwolle (deels)
      "8900-8999", // Zwolle (deels)
      "9000-9099", // Groningen (deels)
      "9100-9199", // Groningen (deels)
      "9200-9299", // Groningen (deels)
      "9300-9399", // Groningen (deels)
      "9400-9499", // Groningen (deels)
      "9500-9599", // Groningen (deels)
      "9600-9699", // Groningen (deels)
      "9700-9799", // Groningen (deels)
      "9800-9899", // Groningen (deels)
      "9900-9999", // Groningen (deels)
    ],
    kostenStroom: 492,
    kostenGas: 254
  }
];

/**
 * Bepaalt netbeheerder op basis van postcode
 */
export function bepaalNetbeheerder(postcode: string): Netbeheerder | null {
  // Verwijder spaties en converteer naar nummer
  const cleanPostcode = postcode.replace(/\s/g, '');
  const postcodeNum = parseInt(cleanPostcode);
  
  if (isNaN(postcodeNum)) {
    return null;
  }

  // Zoek netbeheerder op basis van postcode range
  for (const netbeheerder of netbeheerders) {
    for (const range of netbeheerder.regios) {
      const [min, max] = range.split('-').map(Number);
      if (postcodeNum >= min && postcodeNum <= max) {
        return netbeheerder;
      }
    }
  }

  return null;
}

/**
 * Haalt alle beschikbare netbeheerders op
 */
export function getAlleNetbeheerders(): Netbeheerder[] {
  return netbeheerders;
}
