import { NetworkType } from '@/models';

export const SUBSCAN_CORETIME_API = {
  [NetworkType.ROCOCO]: process.env.SUBSCAN_CORETIME_ROCOCO_API ?? '',
  [NetworkType.KUSAMA]: process.env.SUBSCAN_CORETIME_KUSAMA_API ?? '',
  [NetworkType.NONE]: '',
};

export const SUBSCAN_URL = {
  [NetworkType.ROCOCO]: 'https://coretime-rococo.subscan.io',
  [NetworkType.KUSAMA]: 'https://coretime-kusama.subscan.io',
  [NetworkType.NONE]: '',
};
