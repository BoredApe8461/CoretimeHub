import {
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material';
import { useState } from 'react';

import { SalesHistoryItem } from '@/models';

import { StyledTableCell, StyledTableRow } from '../common';
import { SaleDetailsModal } from '../../Modals';

interface SalesHistoryTableProps {
  data: SalesHistoryItem[];
}

export const SalesHistoryTable = ({ data }: SalesHistoryTableProps) => {
  // table pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [saleDetailsModalOpen, openSaleDetailsModal] = useState(false);
  const [regionBegin, setRegionBegin] = useState(0);
  const [regionEnd, setRegionEnd] = useState(0);

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
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

  return (
    <Stack direction='column' gap='1em'>
      <TableContainer component={Paper} sx={{ height: '35rem' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <StyledTableCell>Sale Id</StyledTableCell>
              <StyledTableCell>Region Begin</StyledTableCell>
              <StyledTableCell>Region End</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : data
            ).map(({ id, regionBegin, regionEnd }, index) => (
              <StyledTableRow key={index}>
                <StyledTableCell align='center'>
                  <Button
                    onClick={() => {
                      openSaleDetailsModal(true);
                      setRegionBegin(regionBegin);
                      setRegionEnd(regionEnd);
                    }}
                  >
                    {id}
                  </Button>
                </StyledTableCell>
                <StyledTableCell align='center'>{regionBegin}</StyledTableCell>
                <StyledTableCell align='center'>{regionEnd}</StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Stack alignItems='center'>
        <Table>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[10, 25, { label: 'All', value: -1 }]}
                colSpan={3}
                count={data.length}
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
                sx={{
                  '.MuiTablePagination-spacer': {
                    flex: '0 0 0',
                  },
                  '.MuiTablePagination-toolbar': {
                    justifyContent: 'center',
                  },
                }}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </Stack>
      <SaleDetailsModal
        open={saleDetailsModalOpen}
        onClose={() => openSaleDetailsModal(false)}
        regionBegin={regionBegin}
        regionEnd={regionEnd}
      />
    </Stack>
  );
};
