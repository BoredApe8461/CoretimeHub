import { LoadingButton } from '@mui/lab';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { useInkathon } from '@scio-labs/use-inkathon';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import {
  formatBalance,
  leadinFactorAt,
  parseHNString,
} from '@/utils/functions';

import BorderLinearProgress from '@/components/elements/BorderLinearProgress';
import SaleInfoGrid from '@/components/elements/SaleInfo';

import { useCoretimeApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useRegions } from '@/contexts/regions';
import { useSaleInfo } from '@/contexts/sales';
import { useToast } from '@/contexts/toast';
import { SalePhase } from '@/models';

const Purchase = () => {
  const theme = useTheme();

  const [working, setWorking] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [currentPhase, setCurrentPhase] = useState<SalePhase | null>(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [saleEnd, setSaleEnd] = useState<number | null>(null);
  const [currentBlockNumber, setCurrentBlockNumber] = useState<number | null>(
    null
  );
  const [progress, setProgress] = useState<number | null>(0);

  const { activeSigner, activeAccount } = useInkathon();
  const { toastError, toastSuccess, toastInfo } = useToast();

  const { saleInfo, loading } = useSaleInfo();
  const {
    state: { api, apiState },
  } = useCoretimeApi();

  const {
    fetchRegions,
  } = useRegions();

  useEffect(() => {
    fetchBalance();
    fetchCurrentPhase();
    fetchCurreentPrice();
  }, [api, apiState, saleInfo, activeAccount]);

  const fetchBalance = async () => {
    if (!api || apiState !== ApiState.READY || !activeAccount) return;
    const account = (
      await api.query.system.account(activeAccount.address)
    ).toHuman() as any;
    setBalance(parseHNString(account.data.free.toString()));
  };

  const fetchCurrentPhase = async () => {
    if (!api || apiState !== ApiState.READY || loading) return;
    const blockNumber = parseHNString(
      ((await api.query.system.number()).toHuman() as any).toString()
    );
    const end =
      saleInfo.saleStart + 80 * (saleInfo.regionEnd - saleInfo.regionBegin);

    setCurrentBlockNumber(blockNumber);
    setSaleEnd(end);

    setProgress((blockNumber / end) * 100);

    if (saleInfo.saleStart > blockNumber) {
      setCurrentPhase(SalePhase.Interlude);
    } else if (saleInfo.saleStart + saleInfo.leadinLength > blockNumber) {
      setCurrentPhase(SalePhase.Leadin);
    } else {
      setCurrentPhase(SalePhase.Regular);
    }
  };

  const fetchCurreentPrice = async () => {
    if (!api || apiState !== ApiState.READY || loading) return;
    const blockNumber = parseHNString(
      ((await api.query.system.number()).toHuman() as any).toString()
    );

    const num = Math.min(
      blockNumber - saleInfo.saleStart,
      saleInfo.leadinLength
    );
    const through = num / saleInfo.leadinLength;
    setCurrentPrice(
      Number((leadinFactorAt(through) * saleInfo.price).toFixed())
    );
  };

  const purchase = async () => {
    if (!api || apiState !== ApiState.READY || !activeAccount || !activeSigner)
      return;
    const txPurchase = api.tx.broker.purchase(currentPrice);

    try {
      setWorking(true);
      await txPurchase.signAndSend(
        activeAccount.address,
        { signer: activeSigner },
        ({ status, events }) => {
          if (status.isReady) toastInfo('Transaction was initiated');
          else if (status.isInBlock) toastInfo(`In Block`);
          else if (status.isFinalized) {
            setWorking(false);
            events.forEach(({ event: { method } }) => {
              if (method === 'ExtrinsicSuccess') {
                toastSuccess('Transaction successful');
                fetchRegions();
              } else if (method === 'ExtrinsicFailed') {
                toastError(`Failed to partition the region`);
              }
            });
          }
        }
      );
    } catch (e) {
      toastError(`Failed to partition the region. ${e}`);
      setWorking(false);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography
            variant='subtitle2'
            sx={{ color: theme.palette.text.secondary }}
          >
            Purchase a core directly from the Coretime chain
          </Typography>
          <Typography
            variant='subtitle1'
            sx={{ color: theme.palette.text.primary }}
          >
            Purchase a core
          </Typography>
        </Box>
        <Typography variant='h6' sx={{ color: theme.palette.text.primary }}>
          {`Your balance: ${formatBalance(balance)} ROC`}
        </Typography>
      </Box>
      <Box>
        {loading ||
          !currentPhase ||
          !saleEnd ||
          !currentBlockNumber ||
          !progress ? (
          <>
            <Typography variant='h5' align='center'>
              Connect your wallet
            </Typography>
          </>
        ) : (
          <>
            <Box
              sx={{
                marginTop: '2em',
              }}
            >
              <SaleInfoGrid
                currentPhase={currentPhase}
                currentPrice={currentPrice}
                saleInfo={saleInfo}
                saleEnd={saleEnd}
              />
            </Box>
            <Box
              sx={{
                marginTop: '2em',
              }}
            >
              <Typography variant='h6'>Current Bulk Sale:</Typography>
              <BorderLinearProgress variant='determinate' value={progress} />
            </Box>
            <Box
              sx={{
                marginTop: '2em',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Link href='/regions'>
                <Button variant='outlined'>
                  Manage your regions
                </Button>
              </Link>
              <LoadingButton
                onClick={purchase}
                variant='contained'
                loading={working}
              >
                Purchase
              </LoadingButton>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Purchase;
