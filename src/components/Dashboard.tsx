import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { supabase } from '../config/supabase';

interface DashboardStats {
  totalProducts: number;
  totalCarts: number;
  lowStockProducts: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCarts: 0,
    lowStockProducts: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total products
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact' });

        // Get total carts
        const { count: cartsCount } = await supabase
          .from('carts')
          .select('*', { count: 'exact' });

        // Get low stock products (less than 10 items)
        const { count: lowStockCount } = await supabase
          .from('products')
          .select('*', { count: 'exact' })
          .lt('stock', 10);

        setStats({
          totalProducts: productsCount || 0,
          totalCarts: cartsCount || 0,
          lowStockProducts: lowStockCount || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Products
              </Typography>
              <Typography variant="h5">
                {stats.totalProducts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Carts
              </Typography>
              <Typography variant="h5">
                {stats.totalCarts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Low Stock Products
              </Typography>
              <Typography variant="h5" color="error">
                {stats.lowStockProducts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 