import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';

import { parseHNString } from '@/utils/functions';

import { ActionButton, RegisterModal, ReserveModal } from '@/components';

import chainData from '@/chaindata';
import { useAccounts } from '@/contexts/account';
import { useCoretimeApi, useRelayApi } from '@/contexts/apis';
import { ApiState } from '@/contexts/apis/types';
import { useNetwork } from '@/contexts/network';

// eslint-disable-next-line no-unused-vars
enum ParaState {
  // eslint-disable-next-line no-unused-vars
  RESERVED = 'Reserved',
  // eslint-disable-next-line no-unused-vars
  ONBOARDING = 'Onboarding',
  // eslint-disable-next-line no-unused-vars
  ONDEMAND_PARACHAIN = 'On-Demand Parachain',
  // eslint-disable-next-line no-unused-vars
  IDLE_PARA = 'Parachain(Idle)',
  // eslint-disable-next-line no-unused-vars
  ACTIVE_PARA = 'Parachain(Active)',
  // eslint-disable-next-line no-unused-vars
  SOON_ACTIVE = 'Soon Active',
  // eslint-disable-next-line no-unused-vars
  LEASE_HOLDING = 'Lease Holding',
  // eslint-disable-next-line no-unused-vars
  SYSTEM = 'System Parachain',
}

type ParachainInfo = {
  id: number;
  state: ParaState;
  name: string;
};

const StateCard = ({ state }: { state: ParaState }) => {
  const styles = {
    [ParaState.RESERVED]: {
      color: '#008000',
      background: 'rgba(0, 128, 0, 0.1)',
    },
    [ParaState.ONBOARDING]: {
      color: '#7472D8',
      background: 'rgba(116, 114, 216, 0.1)',
    },
    [ParaState.ONDEMAND_PARACHAIN]: {
      color: '#2D57C3',
      background: 'rgba(45, 87, 195, 0.1)',
    },
    [ParaState.IDLE_PARA]: {
      color: '#008000',
      background: 'rgba(0, 128, 0, 0.1)',
    },
    [ParaState.ACTIVE_PARA]: {
      color: '#9F53FF',
      background: '#EDDFFF',
    },
    [ParaState.SOON_ACTIVE]: {
      color: '#5e73ff',
      background: '#e1e7ff',
    },
    [ParaState.LEASE_HOLDING]: {
      color: '#5e9b53',
      background: '#f1ffe1',
    },
    [ParaState.SYSTEM]: {
      color: '#ff7f53',
      background: '#ffe9df',
    },
  };
  return (
    <Typography
      sx={{
        color: styles[state].color,
        bgcolor: styles[state].background,
        padding: '0.5rem 1.25rem',
        borderRadius: '1rem',
        width: 'fit-content',
      }}
    >
      {state}
    </Typography>
  );
};

const ParachainManagement = () => {
  const theme = useTheme();

  const router = useRouter();

  const {
    state: { api: relayApi, apiState: relayApiState },
  } = useRelayApi();
  const {
    state: { api: coretimeApi, apiState: coretimeApiState },
  } = useCoretimeApi();
  const { network } = useNetwork();
  const {
    state: { activeAccount },
  } = useAccounts();

  const [watchAll, watchAllParas] = useState(true);
  const [loading, setLoading] = useState(false);

  const [parachains, setParachains] = useState<ParachainInfo[]>([]);
  const [nextParaId, setNextParaId] = useState<number>(0);
  const [reservationCost, setReservationCost] = useState<string>('0');
  const [paraId2Reg, setParaId2Reg] = useState(0);

  const [reserveModalOpen, openReserveModal] = useState(false);
  const [registerModalOpen, openRegisterModal] = useState(false);

  const [dataDepositPerByte, setDataDepositPerByte] = useState(BigInt(0));
  const [maxCodeSize, setMaxCodeSize] = useState(BigInt(BigInt(0)));

  // table pagination
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
      fontSize: '1rem',
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

  const paraActionStyle = ({ theme }: any) => ({
    width: '12rem',
    borderRadius: '2rem',
    fontWeight: 'bold',
    color: theme.palette.primary.main,
    border: `1px solid ${theme.palette.primary.main}`,
  });

  const ParaActionButton = styled(Button)(paraActionStyle);

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Register a parathread
  const onRegister = (paraId: number) => {
    setParaId2Reg(paraId);
    openRegisterModal(true);
  };

  // Renew coretime with the given para id
  const onRenew = (paraId: number) => {
    router.push({
      pathname: 'paras/renewal',
      query: { network, paraId },
    });
  };

  // Upgrade a parathread to parachain
  const onUpgrade = (_paraId: number) => {
    router.push({
      pathname: 'purchase',
      query: { network },
    });
  };

  // Buy coretime for the given parachain
  const onBuy = () => {
    router.push({
      pathname: 'purchase',
      query: { network },
    });
  };

  const onReserved = () => {
    openReserveModal(false);
    fetchParaStates();
  };

  const onRegistered = () => {
    openRegisterModal(false);
    fetchParaStates();
  };

  const fetchParaStates = useCallback(async () => {
    if (relayApiState !== ApiState.READY || !relayApi) return;
    setLoading(true);

    const fetchActiveParas = async (): Promise<number[]> => {
      if (!coretimeApi || coretimeApiState !== ApiState.READY) return [];

      const workloads = await coretimeApi.query.broker.workload.entries();
      const ids: number[] = [];

      for (const [_, value] of workloads) {
        const {
          assignment: { task },
        } = (value.toJSON() as any)[0];
        if (task !== undefined) ids.push(task as number);
      }
      return ids;
    };

    const fetchWorkplanParas = async (): Promise<number[]> => {
      if (!coretimeApi || coretimeApiState !== ApiState.READY) return [];

      const workloads = await coretimeApi.query.broker.workplan.entries();
      const ids: number[] = [];

      for (const [_, value] of workloads) {
        const {
          assignment: { task },
        } = (value.toJSON() as any)[0];
        if (task !== undefined) ids.push(task as number);
      }
      return ids;
    };

    const fetchLeaseHoldingParas = async (): Promise<number[]> => {
      if (!coretimeApi || coretimeApiState !== ApiState.READY) return [];
      const leases = await coretimeApi.query.broker.leases();
      const ids = (
        leases.toJSON() as Array<{ until: number; task: number }>
      ).map((lease) => lease.task);
      return ids;
    };

    const fetchSystemParas = async (): Promise<number[]> => {
      if (!coretimeApi || coretimeApiState !== ApiState.READY) return [];
      const leases: any = (
        (await coretimeApi.query.broker.reservations()).toJSON() as Array<any>
      ).map((e) => e[0]);
      const ids = (leases as Array<{ mask: string; assignment: any }>)
        .filter((lease) => lease.assignment.task)
        .map((lease) => lease.assignment.task);

      return ids;
    };

    const fetchParachainList = async (): Promise<ParachainInfo[]> => {
      const parasRaw = await relayApi.query.paras.paraLifecycles.entries();
      const paras: ParachainInfo[] = [];

      const activeParas = await fetchActiveParas();
      const workplanParas = await fetchWorkplanParas();
      const leaseHoldingParas = await fetchLeaseHoldingParas();
      const systemParas = await fetchSystemParas();

      for (const [key, value] of parasRaw) {
        const [strId] = key.toHuman() as [string];
        const id = parseInt(strId.replace(/,/g, ''));
        const strState = value.toString();
        const name = chainData[network][id] ?? '';
        const isActive = activeParas.indexOf(id) !== -1;
        const isInWorkplan = workplanParas.indexOf(id) !== -1;
        const isLeaseHolding = leaseHoldingParas.indexOf(id) !== -1;
        const isSystemPara = systemParas.indexOf(id) !== -1;

        const state = isSystemPara
          ? ParaState.SYSTEM
          : isLeaseHolding
            ? ParaState.LEASE_HOLDING
            : strState === 'Parathread'
              ? ParaState.ONDEMAND_PARACHAIN
              : isActive
                ? ParaState.ACTIVE_PARA
                : isInWorkplan
                  ? ParaState.SOON_ACTIVE
                  : ParaState.IDLE_PARA;

        paras.push({ id, state, name } as ParachainInfo);
      }
      return paras;
    };

    const fetchReservedParas = async (): Promise<ParachainInfo[]> => {
      const records = await relayApi.query.registrar.paras.entries();
      const paras: ParachainInfo[] = [];

      for (const [key, value] of records) {
        const id = parseHNString((key.toHuman() as any)[0]);
        const { manager } = value.toJSON() as any;

        if (manager === activeAccount?.address) {
          paras.push({
            id,
            state: ParaState.RESERVED,
            name: '',
          });
        }
      }
      return paras;
    };

    const fetchNextParaId = async () => {
      const idRaw = await relayApi.query.registrar.nextFreeParaId();
      const id = idRaw.toPrimitive() as number;
      setNextParaId(id);
    };

    const fetchReservationCost = () => {
      setReservationCost(relayApi.consts.registrar.paraDeposit.toString());
    };

    const fetchRegistrationConsts = async () => {
      const value = BigInt(
        relayApi.consts.registrar.dataDepositPerByte.toString()
      );
      setDataDepositPerByte(value);

      const { maxCodeSize } = (
        await relayApi.query.configuration.activeConfig()
      ).toJSON() as any;
      setMaxCodeSize(BigInt(maxCodeSize));
    };

    await Promise.all([
      fetchNextParaId(),
      fetchReservationCost(),
      fetchRegistrationConsts(),
    ]);

    const paras = await fetchParachainList();
    const reservedParas = await fetchReservedParas();

    paras.push(
      ...reservedParas.filter(
        ({ id }) => paras.find((v) => v.id === id) === undefined
      )
    );
    paras.sort((a, b) => a.id - b.id);

    setParachains(paras);

    setLoading(false);
  }, [
    relayApi,
    relayApiState,
    activeAccount,
    coretimeApi,
    coretimeApiState,
    network,
  ]);

  useEffect(() => {
    fetchParaStates();
  }, [fetchParaStates]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <Typography
            variant='subtitle1'
            sx={{ color: theme.palette.common.black }}
          >
            Project Management
          </Typography>
          <Typography
            variant='subtitle2'
            sx={{ color: theme.palette.text.primary }}
          >
            Watch parachains state, register and manage parachains
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: '2rem', height: '3.25rem' }}>
          <FormControlLabel
            control={
              <Switch
                color='success'
                checked={watchAll}
                onChange={(e) => watchAllParas(e.target.checked)}
              />
            }
            label='Watch all Paras'
            labelPlacement='start'
            sx={{
              color: theme.palette.common.black,
              background: theme.palette.common.white,
              border: `1px solid ${theme.palette.grey['200']}`,
              padding: '0.25rem 1.25rem',
              borderRadius: '5rem',
            }}
          />
          <ActionButton
            label='Reserve New Para'
            onClick={() => openReserveModal(true)}
          />
        </Box>
      </Box>
      {loading ? (
        <Backdrop open>
          <CircularProgress />
        </Backdrop>
      ) : (
        <Box sx={{ mt: '2rem', overflowY: 'auto' }}>
          <TableContainer component={Paper} sx={{ maxHeight: '100%' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Para ID</StyledTableCell>
                  <StyledTableCell>Para Name</StyledTableCell>
                  <StyledTableCell>State</StyledTableCell>
                  <StyledTableCell>Action</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(rowsPerPage > 0
                  ? parachains.slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage
                    )
                  : parachains
                ).map(({ id, name, state }, index) => (
                  <StyledTableRow key={index}>
                    <StyledTableCell>{id}</StyledTableCell>
                    <StyledTableCell>{name}</StyledTableCell>
                    <StyledTableCell>
                      <StateCard state={state} />
                    </StyledTableCell>
                    <StyledTableCell>
                      {state === ParaState.RESERVED ? (
                        <ParaActionButton
                          onClick={() => onRegister(id)}
                          variant='outlined'
                        >
                          Register
                        </ParaActionButton>
                      ) : state === ParaState.ONDEMAND_PARACHAIN ? (
                        <ParaActionButton
                          variant='outlined'
                          onClick={() => onUpgrade(id)}
                        >
                          Upgrade(Buy Coretime)
                        </ParaActionButton>
                      ) : state === ParaState.IDLE_PARA ? (
                        <ParaActionButton variant='outlined' onClick={onBuy}>
                          Buy Coretime
                        </ParaActionButton>
                      ) : state === ParaState.ACTIVE_PARA ? (
                        <ParaActionButton
                          variant='outlined'
                          onClick={() => onRenew(id)}
                        >
                          Renew Coretime
                        </ParaActionButton>
                      ) : (
                        <Typography>No action required</Typography>
                      )}
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[10, 25, { label: 'All', value: -1 }]}
                    colSpan={3}
                    count={parachains.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    slotProps={{
                      select: {
                        inputProps: {
                          'aria-label': 'rows per page',
                        },
                        native: true,
                      },
                    }}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
          <ReserveModal
            open={reserveModalOpen}
            onClose={onReserved}
            paraId={nextParaId}
            reservationCost={reservationCost}
          />
          <RegisterModal
            open={registerModalOpen}
            onClose={onRegistered}
            paraId={paraId2Reg}
            dataDepositPerByte={dataDepositPerByte}
            maxCodeSize={maxCodeSize}
          />
        </Box>
      )}
    </Box>
  );
};

export default ParachainManagement;
