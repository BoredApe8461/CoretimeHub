import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import theme from '@/utils/muiTheme';

import { ListingCard, MarketFilters, PurchaseModal } from '@/components';

import { useMarket } from '@/contexts/market';
import { Listing } from '@/models';

const Marketplace = () => {
  const { listedRegions, fetchMarket } = useMarket();

  const [purchaseModalOpen, openPurhcaseModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [filteredListings, setFilteredListings] = useState<Listing[]>(listedRegions);

  const onPurchase = (listing: Listing) => {
    setSelectedListing(listing);
    openPurhcaseModal(true);
  };

  useEffect(() => {
    setFilteredListings(listedRegions);
  }, [listedRegions]);

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
            Explore all the regions listed on the marketplace
          </Typography>
          <Typography
            variant='subtitle1'
            sx={{ color: theme.palette.text.primary }}
          >
            Explore the market
          </Typography>
        </Box>
      </Box>
      <MarketFilters
        listings={listedRegions}
        setFilteredListings={setFilteredListings}
      />
      {filteredListings.length > 0 && (
        <Box
          marginTop='2rem'
          display='flex'
          flexWrap='wrap'
          justifyContent='space-around'
        >
          {filteredListings.map((listing, indx) => (
            <Box key={indx} margin='1em'>
              <ListingCard
                listing={listing}
                readOnly={false}
                onPurchase={onPurchase}
              />
            </Box>
          ))}
        </Box>
      )}
      {selectedListing && (
        <PurchaseModal
          open={purchaseModalOpen}
          onClose={() => {
            fetchMarket();
            openPurhcaseModal(false);
          }}
          listing={selectedListing}
        />
      )}
    </Box>
  );
};

export default Marketplace;
