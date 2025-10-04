// Generated from real CSV data analysis - Monthly statistics
export interface MonthlyStats {
  month: number;
  monthName: string;
  average: number;
  minimum: number;
  maximum: number;
  hourlyAverages: { [hour: number]: number };
  dailyAverages: { [dayOfWeek: number]: number };
  dataPoints: number;
}

export interface YearlyData {
  [month: number]: MonthlyStats;
}

// Real market data from 2024 CSV analysis
export const MONTHLY_DATA_2024: YearlyData = {
  1: {
    month: 1,
    monthName: "januari",
    average: 0.08,
    minimum: 0,
    maximum: 0.147,
    hourlyAverages: {
      0: 0.064756,
      1: 0.062404,
      2: 0.065553,
      3: 0.061958,
      4: 0.061311,
      5: 0.065252,
      6: 0.068919,
      7: 0.083595,
      8: 0.099130,
      9: 0.092974,
      10: 0.085880,
      11: 0.079479,
      12: 0.074499,
      13: 0.073272,
      14: 0.077295,
      15: 0.084472,
      16: 0.093108,
      17: 0.106857,
      18: 0.106706,
      19: 0.097562,
      20: 0.086105,
      21: 0.079584,
      22: 0.076275,
      23: 0.071142
    },
    dailyAverages: {
      0: 0.070415,
      1: 0.073510,
      2: 0.079068,
      3: 0.083069,
      4: 0.091159,
      5: 0.085622,
      6: 0.079756
    },
    dataPoints: 727
  },
  2: {
    month: 2,
    monthName: "februari",
    average: 0.064,
    minimum: 0,
    maximum: 0.136,
    hourlyAverages: {
      0: 0.052787,
      1: 0.049638,
      2: 0.046991,
      3: 0.044884,
      4: 0.046538,
      5: 0.050559,
      6: 0.061872,
      7: 0.072682,
      8: 0.080321,
      9: 0.074787,
      10: 0.067871,
      11: 0.063254,
      12: 0.058208,
      13: 0.055787,
      14: 0.059192,
      15: 0.064479,
      16: 0.070087,
      17: 0.081424,
      18: 0.093487,
      19: 0.083540,
      20: 0.072575,
      21: 0.066421,
      22: 0.063714,
      23: 0.057762
    },
    dailyAverages: {
      0: 0.055561,
      1: 0.063712,
      2: 0.066011,
      3: 0.068977,
      4: 0.068868,
      5: 0.061369,
      6: 0.063231
    },
    dataPoints: 693
  },
  3: {
    month: 3,
    monthName: "maart",
    average: 0.066,
    minimum: 0,
    maximum: 0.164,
    hourlyAverages: {
      0: 0.062068,
      1: 0.058874,
      2: 0.057131,
      3: 0.056006,
      4: 0.056154,
      5: 0.057973,
      6: 0.067436,
      7: 0.077141,
      8: 0.078010,
      9: 0.065767,
      10: 0.057016,
      11: 0.053659,
      12: 0.048103,
      13: 0.046229,
      14: 0.050884,
      15: 0.053006,
      16: 0.063500,
      17: 0.081187,
      18: 0.099804,
      19: 0.100744,
      20: 0.082782,
      21: 0.072025,
      22: 0.068935,
      23: 0.063962
    },
    dailyAverages: {
      0: 0.054744,
      1: 0.077590,
      2: 0.073419,
      3: 0.078503,
      4: 0.066237,
      5: 0.060116,
      6: 0.057283
    },
    dataPoints: 715
  },
  4: {
    month: 4,
    monthName: "april",
    average: 0.068,
    minimum: 0,
    maximum: 0.185,
    hourlyAverages: {
      0: 0.061097,
      1: 0.055389,
      2: 0.055821,
      3: 0.054116,
      4: 0.053650,
      5: 0.059629,
      6: 0.073856,
      7: 0.090560,
      8: 0.086700,
      9: 0.072276,
      10: 0.062833,
      11: 0.054050,
      12: 0.046544,
      13: 0.042896,
      14: 0.046552,
      15: 0.053676,
      16: 0.044942,
      17: 0.056771,
      18: 0.075074,
      19: 0.102580,
      20: 0.109792,
      21: 0.088423,
      22: 0.075650,
      23: 0.067136
    },
    dailyAverages: {
      0: 0.051553,
      1: 0.072948,
      2: 0.064851,
      3: 0.079203,
      4: 0.076865,
      5: 0.065754,
      6: 0.054302
    },
    dataPoints: 640
  },
  5: {
    month: 5,
    monthName: "mei",
    average: 0.077,
    minimum: 0,
    maximum: 0.165,
    hourlyAverages: {
      0: 0.086231,
      1: 0.078875,
      2: 0.074623,
      3: 0.072397,
      4: 0.071383,
      5: 0.075232,
      6: 0.085339,
      7: 0.090141,
      8: 0.079450,
      9: 0.059613,
      10: 0.052568,
      11: 0.045638,
      12: 0.042528,
      13: 0.039018,
      14: 0.044785,
      15: 0.046160,
      16: 0.049683,
      17: 0.068386,
      18: 0.086536,
      19: 0.108458,
      20: 0.124842,
      21: 0.110980,
      22: 0.095142,
      23: 0.085812
    },
    dailyAverages: {
      0: 0.070703,
      1: 0.079168,
      2: 0.079431,
      3: 0.078543,
      4: 0.076878,
      5: 0.081565,
      6: 0.071546
    },
    dataPoints: 663
  },
  6: {
    month: 6,
    monthName: "juni",
    average: 0.078,
    minimum: 0,
    maximum: 0.203,
    hourlyAverages: {
      0: 0.084336,
      1: 0.076614,
      2: 0.073461,
      3: 0.068878,
      4: 0.068705,
      5: 0.070989,
      6: 0.086234,
      7: 0.091892,
      8: 0.085868,
      9: 0.068948,
      10: 0.061048,
      11: 0.048675,
      12: 0.043668,
      13: 0.037938,
      14: 0.038989,
      15: 0.035825,
      16: 0.043015,
      17: 0.058347,
      18: 0.079319,
      19: 0.104992,
      20: 0.126468,
      21: 0.123533,
      22: 0.108491,
      23: 0.090200
    },
    dailyAverages: {
      0: 0.053835,
      1: 0.092629,
      2: 0.081669,
      3: 0.082861,
      4: 0.085552,
      5: 0.082258,
      6: 0.061850
    },
    dataPoints: 636
  },
  7: {
    month: 7,
    monthName: "juli",
    average: 0.076,
    minimum: 0,
    maximum: 0.249,
    hourlyAverages: {
      0: 0.086637,
      1: 0.074454,
      2: 0.073124,
      3: 0.069210,
      4: 0.066893,
      5: 0.070305,
      6: 0.084298,
      7: 0.090592,
      8: 0.082194,
      9: 0.066405,
      10: 0.053557,
      11: 0.042637,
      12: 0.037587,
      13: 0.038642,
      14: 0.033252,
      15: 0.033611,
      16: 0.040167,
      17: 0.063435,
      18: 0.081703,
      19: 0.106509,
      20: 0.137726,
      21: 0.121716,
      22: 0.102344,
      23: 0.086917
    },
    dailyAverages: {
      0: 0.065492,
      1: 0.085249,
      2: 0.077359,
      3: 0.080866,
      4: 0.078541,
      5: 0.075528,
      6: 0.062167
    },
    dataPoints: 658
  },
  8: {
    month: 8,
    monthName: "augustus",
    average: 0.089,
    minimum: 0,
    maximum: 0.278,
    hourlyAverages: {
      0: 0.092551,
      1: 0.086568,
      2: 0.085430,
      3: 0.081890,
      4: 0.082505,
      5: 0.088108,
      6: 0.102289,
      7: 0.108532,
      8: 0.093255,
      9: 0.075110,
      10: 0.064830,
      11: 0.047567,
      12: 0.038257,
      13: 0.035022,
      14: 0.034368,
      15: 0.045866,
      16: 0.055968,
      17: 0.078890,
      18: 0.096343,
      19: 0.138346,
      20: 0.160291,
      21: 0.128793,
      22: 0.109595,
      23: 0.097955
    },
    dailyAverages: {
      0: 0.078798,
      1: 0.093417,
      2: 0.089254,
      3: 0.095948,
      4: 0.092617,
      5: 0.087653,
      6: 0.083512
    },
    dataPoints: 656
  },
  9: {
    month: 9,
    monthName: "september",
    average: 0.083,
    minimum: 0,
    maximum: 0.34,
    hourlyAverages: {
      0: 0.078746,
      1: 0.077571,
      2: 0.073656,
      3: 0.073530,
      4: 0.073079,
      5: 0.076834,
      6: 0.091409,
      7: 0.114443,
      8: 0.109840,
      9: 0.085185,
      10: 0.063753,
      11: 0.047993,
      12: 0.039175,
      13: 0.041069,
      14: 0.040259,
      15: 0.039816,
      16: 0.057336,
      17: 0.086657,
      18: 0.116957,
      19: 0.151783,
      20: 0.131265,
      21: 0.101629,
      22: 0.088842,
      23: 0.080633
    },
    dailyAverages: {
      0: 0.078801,
      1: 0.090523,
      2: 0.094089,
      3: 0.093837,
      4: 0.081718,
      5: 0.070335,
      6: 0.069449
    },
    dataPoints: 677
  },
  10: {
    month: 10,
    monthName: "oktober",
    average: 0.09,
    minimum: 0,
    maximum: 0.263,
    hourlyAverages: {
      0: 0.075637,
      1: 0.071004,
      2: 0.070082,
      3: 0.067660,
      4: 0.066659,
      5: 0.069736,
      6: 0.087594,
      7: 0.110979,
      8: 0.120090,
      9: 0.098840,
      10: 0.084148,
      11: 0.073363,
      12: 0.067206,
      13: 0.066323,
      14: 0.068541,
      15: 0.075598,
      16: 0.091649,
      17: 0.120775,
      18: 0.151045,
      19: 0.144411,
      20: 0.109737,
      21: 0.094329,
      22: 0.090143,
      23: 0.078989
    },
    dailyAverages: {
      0: 0.065695,
      1: 0.101930,
      2: 0.096278,
      3: 0.088192,
      4: 0.088200,
      5: 0.101558,
      6: 0.086347
    },
    dataPoints: 721
  },
  11: {
    month: 11,
    monthName: "november",
    average: 0.115,
    minimum: 0,
    maximum: 0.55,
    hourlyAverages: {
      0: 0.095100,
      1: 0.090557,
      2: 0.092912,
      3: 0.089342,
      4: 0.088270,
      5: 0.092698,
      6: 0.099377,
      7: 0.121591,
      8: 0.130182,
      9: 0.124137,
      10: 0.114178,
      11: 0.103448,
      12: 0.099773,
      13: 0.101607,
      14: 0.109911,
      15: 0.124837,
      16: 0.148487,
      17: 0.181187,
      18: 0.170547,
      19: 0.144813,
      20: 0.121368,
      21: 0.108616,
      22: 0.106272,
      23: 0.096849
    },
    dailyAverages: {
      0: 0.079415,
      1: 0.109922,
      2: 0.133283,
      3: 0.138798,
      4: 0.124608,
      5: 0.116834,
      6: 0.103098
    },
    dataPoints: 710
  },
  12: {
    month: 12,
    monthName: "december",
    average: 0.109,
    minimum: 0,
    maximum: 0.873,
    hourlyAverages: {
      0: 0.078265,
      1: 0.070710,
      2: 0.068518,
      3: 0.065484,
      4: 0.063007,
      5: 0.068770,
      6: 0.081449,
      7: 0.099443,
      8: 0.131524,
      9: 0.140574,
      10: 0.131322,
      11: 0.121871,
      12: 0.115698,
      13: 0.117313,
      14: 0.123370,
      15: 0.138466,
      16: 0.154363,
      17: 0.169709,
      18: 0.152038,
      19: 0.135767,
      20: 0.113937,
      21: 0.096068,
      22: 0.090596,
      23: 0.078610
    },
    dailyAverages: {
      0: 0.081346,
      1: 0.084885,
      2: 0.108122,
      3: 0.140990,
      4: 0.160236,
      5: 0.117291,
      6: 0.081166
    },
    dataPoints: 738
  }
};

// Real market data from 2025 CSV analysis
export const MONTHLY_DATA_2025: YearlyData = {
  1: {
    month: 1,
    monthName: "januari",
    average: 0.117,
    minimum: 0.001,
    maximum: 0.523,
    hourlyAverages: {
      0: 0.095661,
      1: 0.091454,
      2: 0.085516,
      3: 0.083135,
      4: 0.079807,
      5: 0.088217,
      6: 0.100727,
      7: 0.128319,
      8: 0.154615,
      9: 0.143011,
      10: 0.126103,
      11: 0.113796,
      12: 0.107350,
      13: 0.105446,
      14: 0.111823,
      15: 0.127459,
      16: 0.140369,
      17: 0.164018,
      18: 0.161419,
      19: 0.143011,
      20: 0.126190,
      21: 0.116081,
      22: 0.109092,
      23: 0.099867
    },
    dailyAverages: {
      0: 0.099923,
      1: 0.115031,
      2: 0.113171,
      3: 0.123648,
      4: 0.126230,
      5: 0.117920,
      6: 0.117466
    },
    dataPoints: 743
  },
  2: {
    month: 2,
    monthName: "februari",
    average: 0.126,
    minimum: 0.004,
    maximum: 0.276,
    hourlyAverages: {
      0: 0.108939,
      1: 0.104768,
      2: 0.104191,
      3: 0.101851,
      4: 0.102321,
      5: 0.105916,
      6: 0.121995,
      7: 0.148150,
      8: 0.164853,
      9: 0.146156,
      10: 0.127549,
      11: 0.112033,
      12: 0.105928,
      13: 0.103649,
      14: 0.108085,
      15: 0.117089,
      16: 0.133070,
      17: 0.159898,
      18: 0.171969,
      19: 0.159695,
      20: 0.142945,
      21: 0.128845,
      22: 0.124565,
      23: 0.115341
    },
    dailyAverages: {
      0: 0.119287,
      1: 0.125544,
      2: 0.132018,
      3: 0.130963,
      4: 0.130626,
      5: 0.123932,
      6: 0.118407
    },
    dataPoints: 672
  },
  3: {
    month: 3,
    monthName: "maart",
    average: 0.099,
    minimum: 0,
    maximum: 0.247,
    hourlyAverages: {
      0: 0.096005,
      1: 0.090546,
      2: 0.090933,
      3: 0.086483,
      4: 0.087181,
      5: 0.094809,
      6: 0.116340,
      7: 0.129170,
      8: 0.116146,
      9: 0.089604,
      10: 0.066332,
      11: 0.053073,
      12: 0.057039,
      13: 0.054118,
      14: 0.048339,
      15: 0.068878,
      16: 0.092451,
      17: 0.121917,
      18: 0.154265,
      19: 0.155059,
      20: 0.131933,
      21: 0.113923,
      22: 0.106302,
      23: 0.097863
    },
    dailyAverages: {
      0: 0.080074,
      1: 0.109023,
      2: 0.108472,
      3: 0.110706,
      4: 0.102283,
      5: 0.097642,
      6: 0.089054
    },
    dataPoints: 689
  },
  4: {
    month: 4,
    monthName: "april",
    average: 0.089,
    minimum: 0,
    maximum: 0.253,
    hourlyAverages: {
      0: 0.089878,
      1: 0.083341,
      2: 0.082317,
      3: 0.080424,
      4: 0.081227,
      5: 0.087296,
      6: 0.104579,
      7: 0.120469,
      8: 0.108869,
      9: 0.078262,
      10: 0.057242,
      11: 0.058119,
      12: 0.043254,
      13: 0.043110,
      14: 0.039915,
      15: 0.051778,
      16: 0.050817,
      17: 0.068198,
      18: 0.100534,
      19: 0.129656,
      20: 0.140285,
      21: 0.116567,
      22: 0.101890,
      23: 0.092713
    },
    dailyAverages: {
      0: 0.080157,
      1: 0.090694,
      2: 0.092103,
      3: 0.092256,
      4: 0.091057,
      5: 0.092265,
      6: 0.080446
    },
    dataPoints: 627
  },
  5: {
    month: 5,
    monthName: "mei",
    average: 0.086,
    minimum: 0,
    maximum: 0.213,
    hourlyAverages: {
      0: 0.090621,
      1: 0.083708,
      2: 0.080648,
      3: 0.078311,
      4: 0.079085,
      5: 0.085285,
      6: 0.098980,
      7: 0.101478,
      8: 0.086631,
      9: 0.061791,
      10: 0.033746,
      11: 0.032756,
      12: 0.029437,
      13: 0.038656,
      14: 0.034768,
      15: 0.033235,
      16: 0.040862,
      17: 0.051811,
      18: 0.083075,
      19: 0.109738,
      20: 0.139533,
      21: 0.130385,
      22: 0.111203,
      23: 0.094885
    },
    dailyAverages: {
      0: 0.065967,
      1: 0.089083,
      2: 0.085349,
      3: 0.091124,
      4: 0.092978,
      5: 0.085739,
      6: 0.083652
    },
    dataPoints: 592
  },
  6: {
    month: 6,
    monthName: "juni",
    average: 0.085,
    minimum: 0,
    maximum: 0.289,
    hourlyAverages: {
      0: 0.096665,
      1: 0.088114,
      2: 0.085107,
      3: 0.082499,
      4: 0.082516,
      5: 0.086154,
      6: 0.093861,
      7: 0.091165,
      8: 0.082871,
      9: 0.061731,
      10: 0.043472,
      11: 0.031008,
      12: 0.020055,
      13: 0.016161,
      14: 0.011050,
      15: 0.020551,
      16: 0.027137,
      17: 0.046822,
      18: 0.077659,
      19: 0.106955,
      20: 0.143039,
      21: 0.148073,
      22: 0.125258,
      23: 0.104311
    },
    dailyAverages: {
      0: 0.080067,
      1: 0.085284,
      2: 0.082833,
      3: 0.091413,
      4: 0.088056,
      5: 0.083837,
      6: 0.083076
    },
    dataPoints: 584
  },
  7: {
    month: 7,
    monthName: "juli",
    average: 0.09,
    minimum: 0,
    maximum: 0.518,
    hourlyAverages: {
      0: 0.102250,
      1: 0.095318,
      2: 0.091601,
      3: 0.088665,
      4: 0.089441,
      5: 0.093446,
      6: 0.103015,
      7: 0.102842,
      8: 0.099925,
      9: 0.084695,
      10: 0.069744,
      11: 0.058537,
      12: 0.053669,
      13: 0.045113,
      14: 0.039413,
      15: 0.043905,
      16: 0.058454,
      17: 0.083053,
      18: 0.096752,
      19: 0.119516,
      20: 0.143744,
      21: 0.142999,
      22: 0.124265,
      23: 0.108680
    },
    dailyAverages: {
      0: 0.083688,
      1: 0.092596,
      2: 0.094012,
      3: 0.091883,
      4: 0.090785,
      5: 0.095349,
      6: 0.082195
    },
    dataPoints: 720
  },
  8: {
    month: 8,
    monthName: "augustus",
    average: 0.083,
    minimum: 0,
    maximum: 0.275,
    hourlyAverages: {
      0: 0.091608,
      1: 0.085254,
      2: 0.082218,
      3: 0.080070,
      4: 0.081423,
      5: 0.087943,
      6: 0.097099,
      7: 0.098960,
      8: 0.090484,
      9: 0.074736,
      10: 0.061402,
      11: 0.041170,
      12: 0.032256,
      13: 0.029065,
      14: 0.029994,
      15: 0.040856,
      16: 0.044716,
      17: 0.069188,
      18: 0.092646,
      19: 0.121500,
      20: 0.139351,
      21: 0.119682,
      22: 0.105876,
      23: 0.095085
    },
    dailyAverages: {
      0: 0.072463,
      1: 0.082170,
      2: 0.078928,
      3: 0.093115,
      4: 0.094397,
      5: 0.086053,
      6: 0.075262
    },
    dataPoints: 673
  },
  9: {
    month: 9,
    monthName: "september",
    average: 0.088,
    minimum: 0,
    maximum: 0.383,
    hourlyAverages: {
      0: 0.075398,
      1: 0.073896,
      2: 0.072792,
      3: 0.072060,
      4: 0.074645,
      5: 0.082534,
      6: 0.097185,
      7: 0.106034,
      8: 0.106089,
      9: 0.086464,
      10: 0.057866,
      11: 0.047603,
      12: 0.047866,
      13: 0.042682,
      14: 0.048920,
      15: 0.062018,
      16: 0.061879,
      17: 0.079286,
      18: 0.114132,
      19: 0.170500,
      20: 0.158167,
      21: 0.110231,
      22: 0.097266,
      23: 0.086220
    },
    dailyAverages: {
      0: 0.075614,
      1: 0.101681,
      2: 0.090985,
      3: 0.073635,
      4: 0.069601,
      5: 0.093142,
      6: 0.087622
    },
    dataPoints: 174
  }
};

export function getMonthlyData(year: number): YearlyData {
  return year === 2025 ? MONTHLY_DATA_2025 : MONTHLY_DATA_2024;
}

export function getMonthStats(year: number, month: number): MonthlyStats | null {
  const data = getMonthlyData(year);
  return data[month] || null;
}

export function getHourlyDataForMonth(year: number, month: number): { hour: number; price: number }[] {
  const monthStats = getMonthStats(year, month);
  if (!monthStats) return [];
  
  return Object.keys(monthStats.hourlyAverages).map(hour => ({
    hour: parseInt(hour),
    price: monthStats.hourlyAverages[parseInt(hour)]
  })).sort((a, b) => a.hour - b.hour);
}

export function getDailyDataForMonth(year: number, month: number): { dayOfWeek: number; dayName: string; price: number }[] {
  const monthStats = getMonthStats(year, month);
  if (!monthStats) return [];
  
  const dayNames = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
  
  return Object.keys(monthStats.dailyAverages).map(dayOfWeek => ({
    dayOfWeek: parseInt(dayOfWeek),
    dayName: dayNames[parseInt(dayOfWeek)],
    price: monthStats.dailyAverages[parseInt(dayOfWeek)]
  })).sort((a, b) => a.dayOfWeek - b.dayOfWeek);
}

// Calculate weighted average over a longer period
export function getWeightedAverage(year: number, months: number[]): {
  weightedAverage: number;
  totalDataPoints: number;
  period: string;
  minPrice: number;
  maxPrice: number;
  seasonalBreakdown: { season: string; average: number; months: number[] }[];
} {
  const data = getMonthlyData(year);
  const seasonalBreakdown: { season: string; average: number; months: number[] }[] = [];
  
  let totalWeightedSum = 0;
  let totalDataPoints = 0;
  let minPrice = Infinity;
  let maxPrice = -Infinity;
  
  // Group months by season
  const seasons = {
    winter: { months: [12, 1, 2], name: 'Winter' },
    spring: { months: [3, 4, 5], name: 'Lente' },
    summer: { months: [6, 7, 8], name: 'Zomer' },
    autumn: { months: [9, 10, 11], name: 'Herfst' }
  };
  
  Object.keys(seasons).forEach(seasonKey => {
    const season = seasons[seasonKey as keyof typeof seasons];
    const seasonMonths = months.filter(month => season.months.includes(month));
    
    if (seasonMonths.length > 0) {
      let seasonSum = 0;
      let seasonDataPoints = 0;
      let seasonMin = Infinity;
      let seasonMax = -Infinity;
      
      seasonMonths.forEach(month => {
        const monthStats = data[month];
        if (monthStats) {
          // Weight by number of data points (more data = more reliable)
          const weight = monthStats.dataPoints;
          seasonSum += monthStats.average * weight;
          seasonDataPoints += weight;
          seasonMin = Math.min(seasonMin, monthStats.minimum);
          seasonMax = Math.max(seasonMax, monthStats.maximum);
        }
      });
      
      if (seasonDataPoints > 0) {
        const seasonAverage = seasonSum / seasonDataPoints;
        seasonalBreakdown.push({
          season: season.name,
          average: Math.round(seasonAverage * 1000) / 1000,
          months: seasonMonths
        });
        
        totalWeightedSum += seasonSum;
        totalDataPoints += seasonDataPoints;
        minPrice = Math.min(minPrice, seasonMin);
        maxPrice = Math.max(maxPrice, seasonMax);
      }
    }
  });
  
  const weightedAverage = totalDataPoints > 0 ? totalWeightedSum / totalDataPoints : 0;
  const monthNames = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 
                     'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  const period = months.map(m => monthNames[m - 1]).join(', ');
  
  return {
    weightedAverage: Math.round(weightedAverage * 1000) / 1000,
    totalDataPoints,
    period,
    minPrice: minPrice === Infinity ? 0 : Math.round(minPrice * 1000) / 1000,
    maxPrice: maxPrice === -Infinity ? 0 : Math.round(maxPrice * 1000) / 1000,
    seasonalBreakdown
  };
}

// Get all available months for a year
export function getAvailableMonths(year: number): number[] {
  const data = getMonthlyData(year);
  return Object.keys(data).map(Number).sort((a, b) => a - b);
}