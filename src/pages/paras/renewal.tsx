import {
  Backdrop,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { humanizer } from 'humanize-duration';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { Status, useRenewableParachains } from '@/hooks/renewableParas';
import {
  getBalanceString,
  sendTx,
  timesliceToTimestamp,
} from '@/utils/functions';

import { Balance, ProgressButton } from '@/components';

import { chainData } from '@/chaindata';
import { useAccounts } from '@/contexts/account';
import { useCoretimeApi, useRelayApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useBalances } from '@/contexts/balance';
import { useCommon } from '@/contexts/common';
import { useNetwork } from '@/contexts/network';
import { useToast } from '@/contexts/toast';

const Renewal = () => {
  const router = useRouter();
  const theme = useTheme();

  const {
    state: { activeAccount, activeSigner },
  } = useAccounts();
  const { balance } = useBalances();
  const { status, parachains } = useRenewableParachains();

  const {
    state: { api: relayApi, apiState: relayApiState },
  } = useRelayApi();
  const {
    state: { api: coretimeApi, apiState: coretimeApiState, decimals, symbol },
  } = useCoretimeApi();

  const { toastError, toastInfo, toastSuccess } = useToast();
  const { network } = useNetwork();
  const { timeslicePeriod } = useCommon();
  const [loading, setLoading] = useState(false);

  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [working, setWorking] = useState(false);
  const [expiryTimestamp, setExpiryTimestamp] = useState(0);

  const formatDuration = humanizer({ units: ['w', 'd'], round: true });

  const defaultHandler = {
    ready: () => toastInfo('Transaction was initiated.'),
    inBlock: () => toastInfo(`In Block`),
    finalized: () => setWorking(false),
    success: () => {
      toastSuccess('Successfully renewed the selected parachain.');
    },
    error: () => {
      toastError(`Failed to renew the selected parachain.`);
      setWorking(false);
    },
  };

  const handleRenew = () => {
    if (!activeAccount || !coretimeApi || !coretimeApiState || !activeSigner)
      return;

    const { core } = parachains[activeIdx];

    const txRenewal = coretimeApi.tx.broker.renew(core);

    sendTx(txRenewal, activeAccount.address, activeSigner, defaultHandler);
  };

  useEffect(() => {
    const getExpiry = async () => {
      setLoading(true);
      if (
        !coretimeApi ||
        coretimeApiState !== ApiState.READY ||
        !relayApi ||
        relayApiState !== ApiState.READY ||
        !parachains[activeIdx]
      )
        return;
      const currentTimeslice = (
        (await coretimeApi.query.broker.status()).toJSON() as any
      ).lastCommittedTimeslice;
      const now = await timesliceToTimestamp(
        relayApi,
        currentTimeslice,
        timeslicePeriod
      );
      const expiry = await timesliceToTimestamp(
        relayApi,
        parachains[activeIdx].when,
        timeslicePeriod
      );
      setExpiryTimestamp(expiry - now);
      setLoading(false);
    };

    getExpiry();
  }, [
    coretimeApi,
    coretimeApiState,
    relayApi,
    relayApiState,
    activeIdx,
    parachains,
  ]);

  useEffect(() => {
    if (!router.isReady || status !== Status.LOADED || parachains.length === 0)
      return;
    const { query } = router;
    if (query['paraId'] === undefined) return;
    const paraId = parseInt(query['paraId'] as string);
    const index = parachains.findIndex((para) => para.paraId == paraId);
    if (index === -1) {
      toastError(`No renewable parachain found with ID = ${paraId}`);
      return;
    }
    setActiveIdx(index);
  }, [router, parachains, status, parachains.length, toastError]);

  return status === Status.LOADING ? (
    <Backdrop open>
      <CircularProgress />
    </Backdrop>
  ) : parachains.length === 0 ? (
    <Typography>There are no renewable parachains.</Typography>
  ) : (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography
            variant='subtitle1'
            sx={{ color: theme.palette.common.black }}
          >
            Renew a parachain
          </Typography>
          <Typography
            variant='subtitle2'
            sx={{ color: theme.palette.text.primary }}
          >
            Renew a parachain
          </Typography>
        </Box>
        <Balance
          coretimeBalance={balance.coretime}
          relayBalance={balance.relay}
        />
      </Box>

      <Box sx={{ width: '60%', margin: '0 auto' }}>
        <Paper
          sx={{
            padding: '2rem',
            borderRadius: '2rem',
            mt: '2rem',
            boxShadow: 'none',
          }}
        >
          <Stack
            direction='column'
            gap={1}
            margin='1rem 0'
            width='75%'
            sx={{ mx: 'auto' }}
          >
            <Typography
              variant='h1'
              textAlign='center'
              sx={{ color: theme.palette.common.black, mb: '1rem' }}
            >
              Select a parachain to renew
            </Typography>
            <FormControl fullWidth sx={{ mt: '1rem' }}>
              <InputLabel id='label-parachain-select'>Parachain</InputLabel>
              <Select
                sx={{ borderRadius: '1rem' }}
                labelId='label-parachain-select'
                label='Parachain'
                value={activeIdx}
                onChange={(e) => setActiveIdx(Number(e.target.value))}
              >
                {parachains.map(({ paraId }, index) => (
                  <MenuItem key={index} value={index}>
                    {`${paraId} ${chainData[network][paraId] || ''}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Stack
              direction='column'
              padding='1rem'
              mt={'2rem'}
              gap='0.5rem'
              border='1px solid'
              borderColor={theme.palette.grey[400]}
              borderRadius='1rem'
            >
              <Property
                property='Core number:'
                value={parachains[activeIdx].core}
              />
              <Property
                tooltip='The parachain will stop with block production once it expires.'
                property='Expiry in:'
                value={loading ? '...' : formatDuration(expiryTimestamp)}
              />
              <Property
                property='Renewal price: '
                value={getBalanceString(
                  parachains[activeIdx].price.toString(),
                  decimals,
                  symbol
                )}
              />
            </Stack>
          </Stack>
          <Stack
            direction='row'
            gap='1rem'
            marginTop='2em'
            justifyContent='center'
          >
            <ProgressButton
              label='Renew'
              onClick={handleRenew}
              loading={working}
              width='200px'
            />
          </Stack>
        </Paper>
      </Box>
    </>
  );
};

interface PropertyProps {
  property: string;
  value: any;
  tooltip?: string;
}

export const Property = ({ property, value, tooltip }: PropertyProps) => {
  return (
    <Box display='flex' justifyContent='space-between' mx='1rem'>
      <Typography fontWeight='light' color='black'>
        {property}
      </Typography>
      <Box display='flex'>
        {tooltip && (
          <Tooltip title={tooltip} arrow sx={{ fontSize: '1rem' }}>
            <Typography color='black' mr='.5rem' sx={{ cursor: 'default' }}>
              &#9432;
            </Typography>
          </Tooltip>
        )}
        <Typography fontWeight='bold' color='black'>
          {value}
        </Typography>
      </Box>
    </Box>
  );
};

export default Renewal;
