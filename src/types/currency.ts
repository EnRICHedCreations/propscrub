export interface UserBalance {
  bubbles: number;
  barsOfSoap: number;
}

export interface PurchaseOption {
  id: string;
  name: string;
  bubbles?: number;
  barsOfSoap?: number;
  priceUSD: number;
  popular?: boolean;
}

// Pricing: per 50 records
export const BASIC_SCRUB_COST_PER_50 = 10; // 10 Bubbles per 50 records (Basic Scrub)
export const PRISON_SCRUB_COST_PER_50 = 25; // 25 Bubbles per 50 records (Prison Scrub)
export const BUBBLES_PER_BAR = 100; // 1 Bar of Soap = 100 Bubbles

export const PURCHASE_OPTIONS: PurchaseOption[] = [
  {
    id: 'bubbles_50',
    name: '50 Bubbles',
    bubbles: 50,
    priceUSD: 2.50
  },
  {
    id: 'bubbles_125',
    name: '125 Bubbles',
    bubbles: 125,
    priceUSD: 6.25
  },
  {
    id: 'soap_1',
    name: '1 Bar of Soap',
    barsOfSoap: 1,
    priceUSD: 5.00,
    popular: true
  },
  {
    id: 'soap_3',
    name: '3 Bars of Soap',
    barsOfSoap: 3,
    priceUSD: 15.00
  },
  {
    id: 'soap_10',
    name: '10 Bars of Soap',
    barsOfSoap: 10,
    priceUSD: 50.00
  }
];

export const getTotalBubbles = (balance: UserBalance): number => {
  return balance.bubbles + (balance.barsOfSoap * BUBBLES_PER_BAR);
};

export const calculateScrubCost = (recordCount: number, isPrisonScrub: boolean): number => {
  const costPer50 = isPrisonScrub ? PRISON_SCRUB_COST_PER_50 : BASIC_SCRUB_COST_PER_50;
  const batches = Math.ceil(recordCount / 50);
  return batches * costPer50;
};

export const canAffordScrub = (balance: UserBalance, recordCount: number, isPrisonScrub: boolean): boolean => {
  const cost = calculateScrubCost(recordCount, isPrisonScrub);
  return getTotalBubbles(balance) >= cost;
};

export const deductScrubCost = (balance: UserBalance, recordCount: number, isPrisonScrub: boolean): UserBalance => {
  const scrubCost = calculateScrubCost(recordCount, isPrisonScrub);
  let remainingCost = scrubCost;
  let newBalance = { ...balance };

  // First deduct from bubbles
  if (newBalance.bubbles >= remainingCost) {
    newBalance.bubbles -= remainingCost;
    return newBalance;
  }

  // If not enough bubbles, deduct what we can and break bars of soap as needed
  remainingCost -= newBalance.bubbles;
  newBalance.bubbles = 0;

  while (remainingCost > 0 && newBalance.barsOfSoap > 0) {
    newBalance.barsOfSoap -= 1;
    newBalance.bubbles = BUBBLES_PER_BAR;

    if (newBalance.bubbles >= remainingCost) {
      newBalance.bubbles -= remainingCost;
      remainingCost = 0;
    } else {
      remainingCost -= newBalance.bubbles;
      newBalance.bubbles = 0;
    }
  }

  return newBalance;
};
