import { ContractData } from '@/types/contracts';

export const leveranciers: ContractData[] = [
  {
    leverancier: "Eneco",
    productNaam: "Eneco Vast Voordeel",
    type: "vast",
    looptijdMaanden: 12,
    vasteLeveringskosten: 4.95,
    tarieven: {
      stroomKalePrijs: 0.0895,
      gasKalePrijs: 0.2850,
      terugleververgoeding: 0.07
    },
    kortingEenmalig: 0,
    duurzaamheidsScore: 8.5,
    klanttevredenheid: 7.8
  },
  {
    leverancier: "Vattenfall",
    productNaam: "Vattenfall Vast",
    type: "vast",
    looptijdMaanden: 12,
    vasteLeveringskosten: 3.95,
    tarieven: {
      stroomKalePrijs: 0.0920,
      gasKalePrijs: 0.2920,
      terugleververgoeding: 0.08
    },
    kortingEenmalig: 0,
    duurzaamheidsScore: 8.0,
    klanttevredenheid: 7.5
  },
  {
    leverancier: "Essent",
    productNaam: "Essent Vast Voordeel",
    type: "vast",
    looptijdMaanden: 12,
    vasteLeveringskosten: 4.50,
    tarieven: {
      stroomKalePrijs: 0.0880,
      gasKalePrijs: 0.2880,
      terugleververgoeding: 0.06
    },
    kortingEenmalig: 0,
    duurzaamheidsScore: 7.5,
    klanttevredenheid: 7.2
  },
  {
    leverancier: "Greenchoice",
    productNaam: "Greenchoice Groen Vast",
    type: "vast",
    looptijdMaanden: 12,
    vasteLeveringskosten: 5.95,
    tarieven: {
      stroomKalePrijs: 0.0950,
      gasKalePrijs: 0.2950,
      terugleververgoeding: 0.09
    },
    kortingEenmalig: 0,
    duurzaamheidsScore: 9.5,
    klanttevredenheid: 8.1
  },
  {
    leverancier: "Budget Energie",
    productNaam: "Budget Energie Vast",
    type: "vast",
    looptijdMaanden: 12,
    vasteLeveringskosten: 3.50,
    tarieven: {
      stroomKalePrijs: 0.0850,
      gasKalePrijs: 0.2750,
      terugleververgoeding: 0.05
    },
    kortingEenmalig: 0,
    duurzaamheidsScore: 6.5,
    klanttevredenheid: 6.8
  }
];

