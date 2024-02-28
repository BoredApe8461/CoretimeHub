import { ApiPromise } from '@polkadot/api';
import { CoreMask, Region } from 'coretime-utils';

import { parseHNString } from '@/utils/functions';

export const fetchRegions = async (
  coretimeApi: ApiPromise | null
): Promise<Array<Region>> => {
  if (!coretimeApi) {
    return [];
  }
  const brokerEntries = await coretimeApi.query.broker.regions.entries();

  const brokerRegions: Array<Region> = brokerEntries
    .map(([key, value]) => {
      const keyTuple: any = key.toHuman();
      const { begin, core, mask } = keyTuple[0] as any;
      const { end, owner, paid } = value.toHuman() as any;

      const regionId = {
        begin: parseHNString(begin.toString()),
        core: parseHNString(core.toString()),
        mask: new CoreMask(mask),
      };
      return new Region(
        regionId,
        {
          end: parseHNString(end),
          owner,
          paid: paid ? parseHNString(paid) : null,
        },
        0
      );
    })
    .filter((entry) => entry !== null) as Array<Region>;

  return brokerRegions;
};
