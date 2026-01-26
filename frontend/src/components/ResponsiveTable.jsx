import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Card, CardContent, Typography, Grid, useMediaQuery, useTheme } from '@mui/material';

/**
 * Responsive Table Component
 * Shows as a table on desktop and as cards on mobile/tablet
 */
const ResponsiveTable = ({ 
  columns, // Array of { id, label, render? }
  data, 
  renderRow, // Function to render each row as a card (for mobile)
  dense = false 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (isMobile && data.length > 0) {
    // Mobile view: Show as cards
    return (
      <Grid container spacing={2}>
        {data.map((row, index) => (
          <Grid item xs={12} key={row._id || index}>
            {renderRow ? renderRow(row) : (
              <Card sx={{ '&:hover': { boxShadow: 3 }, transition: 'box-shadow 0.3s' }}>
                <CardContent>
                  {columns.map((col) => (
                    <Box key={col.id} sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
                        {col.label}:
                      </Typography>
                      <Typography variant="body2" sx={{ textAlign: 'right', ml: 1 }}>
                        {col.render ? col.render(row[col.id], row) : row[col.id]}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}
          </Grid>
        ))}
      </Grid>
    );
  }

  // Desktop view: Show as table
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
      <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: 650 }}>
        <TableHead sx={{ backgroundColor: (t) => t.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5' }}>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.id} sx={{ fontWeight: 700, fontSize: { sm: '0.75rem', md: '0.875rem' } }}>
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                <Typography color="textSecondary">No data available</Typography>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow key={row._id || index} sx={{ '&:hover': { backgroundColor: (t) => t.palette.mode === 'dark' ? '#1a1a1a' : '#f9f9f9' } }}>
                {columns.map((col) => (
                  <TableCell key={col.id} sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, py: 1.5 }}>
                    {col.render ? col.render(row[col.id], row) : row[col.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ResponsiveTable;
