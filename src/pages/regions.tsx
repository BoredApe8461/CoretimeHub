import BackspaceIcon from '@mui/icons-material/Backspace';
import SellIcon from '@mui/icons-material/Sell';
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Typography,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';

import {
  InterlaceModal,
  PartitionModal,
  RegionCard,
  TaskAssignModal,
  TransferModal,
} from '@/components';
import { SellModal } from '@/components/Modals/Sell';
import { UnlistModal } from '@/components/Modals/Unlist';

import { useRegions } from '@/contexts/regions';
import { useToast } from '@/contexts/toast';
import {
  AssignmentIcon,
  InterlaceIcon,
  PartitionIcon,
  TransferIcon,
} from '@/icons';
import { RegionLocation } from '@/models';
const Dashboard = () => {
  const theme = useTheme();
  const { regions, loading, updateRegionName } = useRegions();

  const [currentRegionIndex, setCurrentRegionIndex] = useState<number>();
  const [partitionModalOpen, openPartitionModal] = useState(false);
  const [interlaceModalOpen, openInterlaceModal] = useState(false);
  const [assignModalOpen, openAssignModal] = useState(false);
  const [sellModalOpen, openSellModal] = useState(false);
  const [unlistModalOpen, openUnlistModal] = useState(false);
  const [transferModalOpen, openTransferModal] = useState(false);
  const { toastInfo } = useToast();

  const selectedRegion =
    currentRegionIndex === undefined ? undefined : regions[currentRegionIndex];
  const regionSelected = selectedRegion !== undefined;

  const manage = (openModal: (_v: boolean) => void) => {
    if (!regionSelected) {
      toastInfo(
        'First select a region by clicking on one of the regions displayed.'
      );
    } else {
      openModal(true);
    }
  };

  const management = [
    {
      label: 'partition',
      icon: PartitionIcon,
      onClick: () => manage(openPartitionModal),
    },
    {
      label: 'interlace',
      icon: InterlaceIcon,
      onClick: () => manage(openInterlaceModal),
    },
    {
      label: 'transfer',
      icon: TransferIcon,
      onClick: () => manage(openTransferModal),
    },
    {
      label: 'assign',
      icon: AssignmentIcon,
      onClick: () => manage(openAssignModal),
    },
    {
      label: 'sell',
      icon: SellIcon,
      onClick: () => manage(openSellModal),
    },
    {
      label: 'unlist',
      icon: BackspaceIcon,
      onClick: () => manage(openUnlistModal),
    },
  ];

  const isDisabled = (action: string): boolean => {
    if (!selectedRegion) return false;
    if (selectedRegion.location === RegionLocation.CORETIME_CHAIN) {
      // regions on the coretime chain cannot be listed on sale. They first have to be
      // transferred to the contacts chain.
      return action === 'sell';
    } else if (selectedRegion.location === RegionLocation.CONTRACTS_CHAIN) {
      // XcRegions can only be transferred and listed on sale.
      return !(action === 'transfer' || action === 'sell');
    } else {
      // TODO: allow price updates as well.
      return !(action == 'unlist');
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', gap: '1rem' }}>
      <Box sx={{ maxWidth: '45rem', flexGrow: 1, overflow: 'auto' }}>
        <Box>
          <Typography
            variant='subtitle2'
            sx={{ color: theme.palette.text.secondary }}
          >
            Manage your cores
          </Typography>
          <Typography
            variant='subtitle1'
            sx={{ color: theme.palette.text.primary }}
          >
            Regions Dashboard
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            mt: '1rem',
          }}
        >
          <Backdrop open={loading}>
            <CircularProgress />
          </Backdrop>
          {regions.length === 0 ? (
            <>
              <Typography>
                No regions owned. Go to <Link href='/purchase'>bulk sales</Link>{' '}
                to make a purchase
              </Typography>
            </>
          ) : (
            <>
              {regions.map((region, index) => (
                <Box key={index} onClick={() => setCurrentRegionIndex(index)}>
                  <RegionCard
                    regionMetadata={region}
                    active={index === currentRegionIndex}
                    editable
                    updateName={(name) => updateRegionName(index, name)}
                  />
                </Box>
              ))}
            </>
          )}
        </Box>
      </Box>
      <Box
        sx={{
          position: 'fixed',
          right: '7.5rem',
          color: theme.palette.text.secondary,
          background: theme.palette.background.default,
          minWidth: 280,
          height: 500,
          margin: 'auto',
          padding: '2rem 3rem',
        }}
      >
        <Typography variant='h1'>Manage</Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            marginTop: '3rem',
            alignItems: 'flex-start',
          }}
        >
          {management.map(({ label, icon: Icon, onClick }, index) => (
            <Button
              key={index}
              sx={{
                color: theme.palette.text.secondary,
                textTransform: 'capitalize',
              }}
              startIcon={
                <Icon
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  color={theme.palette.text.secondary}
                />
              }
              disabled={isDisabled(label)}
              onClick={onClick}
            >
              {label}
            </Button>
          ))}
        </Box>
      </Box>
      {regionSelected && (
        <>
          <PartitionModal
            open={partitionModalOpen}
            onClose={() => openPartitionModal(false)}
            regionMetadata={selectedRegion}
          />
          <InterlaceModal
            open={interlaceModalOpen}
            onClose={() => openInterlaceModal(false)}
            regionMetadata={selectedRegion}
          />
          <TaskAssignModal
            open={assignModalOpen}
            onClose={() => openAssignModal(false)}
            regionMetadata={selectedRegion}
          />
          <TransferModal
            open={transferModalOpen}
            onClose={() => openTransferModal(false)}
            regionMetadata={selectedRegion}
          />
          <SellModal
            open={sellModalOpen}
            onClose={() => openSellModal(false)}
            regionMetadata={selectedRegion}
          />
          <UnlistModal
            open={unlistModalOpen}
            onClose={() => openUnlistModal(false)}
            regionMetadata={selectedRegion}
          />
        </>
      )}
    </Box>
  );
};

export default Dashboard;
