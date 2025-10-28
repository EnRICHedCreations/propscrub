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

export const SCRUB_COST = 5; // 5 Bubbles per scrub
export const BUBBLES_PER_BAR = 100; // 1 Bar of Soap = 100 Bubbles

export const PURCHASE_OPTIONS: PurchaseOption[] = [
  {
    id: 'bubbles_50',
    name: '50 Bubbles',
    bubbles: 50,
    priceUSD: 5.00
  },
  {
    id: 'bubbles_125',
    name: '125 Bubbles',
    bubbles: 125,
    priceUSD: 10.00
  },
  {
    id: 'soap_1',
    name: '1 Bar of Soap',
    barsOfSoap: 1,
    priceUSD: 20.00,
    popular: true
  },
  {
    id: 'soap_3',
    name: '3 Bars of Soap',
    barsOfSoap: 3,
    priceUSD: 50.00
  },
  {
    id: 'soap_10',
    name: '10 Bars of Soap',
    barsOfSoap: 10,
    priceUSD: 150.00
  }
];

export const getTotalBubbles = (balance: UserBalance): number => {
  return balance.bubbles + (balance.barsOfSoap * BUBBLES_PER_BAR);
};

export const canAffordScrub = (balance: UserBalance): boolean => {
  return getTotalBubbles(balance) >= SCRUB_COST;
};

export const deductScrubCost = (balance: UserBalance): UserBalance => {
  let remainingCost = SCRUB_COST;
  let newBalance = { ...balance };

  // First deduct from bubbles
  if (newBalance.bubbles >= remainingCost) {
    newBalance.bubbles -= remainingCost;
    return newBalance;
  }

  // If not enough bubbles, deduct what we can and break a bar of soap
  remainingCost -= newBalance.bubbles;
  newBalance.bubbles = 0;

  if (newBalance.barsOfSoap > 0) {
    newBalance.barsOfSoap -= 1;
    newBalance.bubbles = BUBBLES_PER_BAR - remainingCost;
  }

  return newBalance;
};
