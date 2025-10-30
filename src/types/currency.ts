export interface UserBalance {
  bubbles: number;
}

export interface PurchaseOption {
  id: string;
  name: string;
  bubbles: number;
  priceUSD: number;
  popular?: boolean;
}

// Pricing: per 50 records
export const BASIC_SCRUB_COST_PER_50 = 10; // 10 Bubbles per 50 records (Basic Scrub)
export const PRISON_SCRUB_COST_PER_50 = 25; // 25 Bubbles per 50 records (Prison Scrub)

export const PURCHASE_OPTIONS: PurchaseOption[] = [
  {
    id: 'bubbles_50',
    name: '50 Bubbles',
    bubbles: 50,
    priceUSD: 2.50
  },
  {
    id: 'bubbles_100',
    name: '100 Bubbles',
    bubbles: 100,
    priceUSD: 5.00,
    popular: true
  },
  {
    id: 'bubbles_250',
    name: '250 Bubbles',
    bubbles: 250,
    priceUSD: 12.50
  },
  {
    id: 'bubbles_500',
    name: '500 Bubbles',
    bubbles: 500,
    priceUSD: 25.00
  },
  {
    id: 'bubbles_1000',
    name: '1000 Bubbles',
    bubbles: 1000,
    priceUSD: 50.00
  }
];

export const getTotalBubbles = (balance: UserBalance): number => {
  return balance.bubbles;
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
  return {
    bubbles: balance.bubbles - scrubCost
  };
};
