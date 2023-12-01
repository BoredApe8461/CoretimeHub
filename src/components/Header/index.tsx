import { ExpandMore } from '@mui/icons-material';
import { Button, Collapse, Divider, List, ListItemButton } from '@mui/material';
import { useInkathon } from '@scio-labs/use-inkathon';
import Image from 'next/image';
import React, { useState } from 'react';

import Logo from '@/assets/logo.png';

import styles from './index.module.scss';
import { WalletModal } from '../Modals/WalletModal';

export const Header = () => {
  const { activeAccount, disconnect, accounts, setActiveAccount } =
    useInkathon();
  const [accountsOpen, openAccounts] = useState(false);
  const [walletModalOpen, openWalletModal] = useState(false);

  return (
    <>
      <div className={styles.header}>
        <div className={styles.logo}>
          <Image src={Logo} alt='logo' className={styles.logoImg} />
        </div>
        <div className={styles.menu}>
          {activeAccount ? (
            <List component='div' className={styles.listWrapper}>
              {!accountsOpen && (
                <ListItemButton
                  onClick={() => openAccounts(true)}
                  sx={{ justifyContent: 'space-between' }}
                >
                  {activeAccount.name}
                  <ExpandMore />
                </ListItemButton>
              )}

              <Collapse in={accountsOpen} className={styles.accountsWrapper}>
                <List component='div' className={styles.accountsList}>
                  {accounts?.map((account, index) => (
                    <ListItemButton
                      key={index}
                      onClick={() => {
                        setActiveAccount && setActiveAccount(account);
                        openAccounts(false);
                      }}
                    >
                      {account.name}
                    </ListItemButton>
                  ))}
                </List>
                <Divider />
                <ListItemButton onClick={disconnect}>Disconnect</ListItemButton>
              </Collapse>
            </List>
          ) : (
            <Button
              variant='outlined'
              className={styles.connectWallet}
              onClick={() => openWalletModal(true)}
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
      <WalletModal
        open={walletModalOpen}
        onClose={() => openWalletModal(false)}
      />
    </>
  );
};
