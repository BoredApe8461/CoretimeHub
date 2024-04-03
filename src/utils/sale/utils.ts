import { Timeslice } from 'coretime-utils';

import { leadinFactorAt } from '@/utils/functions';

import { BlockNumber, SaleConfig, SaleInfo, SalePhase } from '@/models';

export const getCurrentPhase = (
  saleInfo: SaleInfo,
  blockNumber: number
): SalePhase => {
  if (saleInfo.saleStart > blockNumber) {
    return SalePhase.Interlude;
  } else if (saleInfo.saleStart + saleInfo.leadinLength > blockNumber) {
    return SalePhase.Leadin;
  } else {
    return SalePhase.Regular;
  }
};

export const getSaleStartInBlocks = (
  saleInfo: SaleInfo,
  config: SaleConfig
) => {
  // `saleInfo.saleStart` defines the start of the leadin phase.
  // However, we want to account for the interlude period as well.
  return saleInfo.saleStart - config.interludeLength;
};

export const getSaleEndInBlocks = (
  saleInfo: SaleInfo,
  blockNumber: BlockNumber,
  lastCommittedTimeslice: Timeslice
) => {
  const timeslicesUntilSaleEnd = saleInfo.regionBegin - lastCommittedTimeslice;
  return blockNumber + 80 * timeslicesUntilSaleEnd;
};

// Returns a range between 0 and 100.
export const getSaleProgress = (
  saleInfo: SaleInfo,
  config: SaleConfig,
  blockNumber: number,
  lastCommittedTimeslice: number
): number => {
  const start = getSaleStartInBlocks(saleInfo, config);
  const end = getSaleEndInBlocks(saleInfo, blockNumber, lastCommittedTimeslice);

  const saleDuration = end - start;
  const elapsed = blockNumber - start;

  const progress = elapsed / saleDuration;
  return Number((progress * 100).toFixed(2));
};

export const getCurrentPrice = (saleInfo: SaleInfo, blockNumber: number) => {
  const num = Math.min(blockNumber - saleInfo.saleStart, saleInfo.leadinLength);
  const through = num / saleInfo.leadinLength;

  return Number((leadinFactorAt(through) * saleInfo.price).toFixed());
};
