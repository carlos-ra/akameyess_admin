import { useEffect, useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  Typography, 
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { supabase } from '../config/supabase';

interface OrderStatus {
  id: string;
  label: string;
  value: number;
  color: string;
}

interface DailyRevenue {
  x: string;
  y: number;
}

interface CategoryRevenue {
  [key: string]: string | number;
  id: string;
  label: string;
  value: number;
}

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
  revenueByCategory: CategoryRevenue[];
  ordersByStatus: OrderStatus[];
  dailyRevenue: DailyRevenue[];
  statusBreakdown: {
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
  };
}

const statusColors = {
  pending: '#ffd700',
  processing: '#1976d2',
  completed: '#2e7d32',
  cancelled: '#d32f2f'
};

const dateRanges = [
  { value: '7', label: 'Last 7 Days' },
  { value: '30', label: 'Last 30 Days' },
  { value: '90', label: 'Last 90 Days' },
  { value: 'custom', label: 'Custom Range' }
];

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    averageOrderValue: 0,
    revenueByCategory: [],
    ordersByStatus: [],
    dailyRevenue: [],
    statusBreakdown: {
      pending: 0,
      processing: 0,
      completed: 0,
      cancelled: 0
    }
  });

  const [dateRange, setDateRange] = useState('7');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const getDateFilter = () => {
    const end = new Date();
    let start = new Date();

    if (dateRange === 'custom' && startDate && endDate) {
      return {
        start: new Date(startDate),
        end: new Date(endDate)
      };
    }

    start.setDate(end.getDate() - parseInt(dateRange));
    return { start, end };
  };

  const fetchDashboardData = async () => {
    try {
      const { start, end } = getDateFilter();

      // Fetch orders within date range
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, status, created_at')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at', { ascending: true });

      if (!orders) return;

      // Calculate totals
      const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

      // Calculate status breakdown
      const statusBreakdown = orders.reduce((acc, order) => {
        const status = order.status?.toLowerCase() || 'pending';
        acc[status as keyof typeof acc] = (acc[status as keyof typeof acc] || 0) + 1;
        return acc;
      }, {
        pending: 0,
        processing: 0,
        completed: 0,
        cancelled: 0
      });

      // Format orders by status for pie chart
      const ordersByStatus = Object.entries(statusBreakdown).map(([status, count]) => ({
        id: status,
        label: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        color: statusColors[status as keyof typeof statusColors]
      }));

      // Calculate daily revenue
      const dailyRevenue = orders.reduce((acc: DailyRevenue[], order) => {
        const date = new Date(order.created_at).toLocaleDateString();
        const existingDate = acc.find(item => item.x === date);
        if (existingDate) {
          existingDate.y += Number(order.total_amount);
        } else {
          acc.push({ x: date, y: Number(order.total_amount) });
        }
        return acc;
      }, []);

      // Fetch and calculate revenue by category
      const { data: products } = await supabase
        .from('products')
        .select('category, price');

      const revenueByCategory = products?.reduce((acc: CategoryRevenue[], product) => {
        const existingCategory = acc.find(item => item.id === product.category);
        if (existingCategory) {
          existingCategory.value += Number(product.price);
        } else {
          acc.push({
            id: product.category,
            label: product.category.charAt(0).toUpperCase() + product.category.slice(1),
            value: Number(product.price)
          });
        }
        return acc;
      }, []) || [];

      // Get total products count
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact' });

      setStats({
        totalRevenue,
        totalOrders,
        totalProducts: totalProducts || 0,
        averageOrderValue,
        revenueByCategory,
        ordersByStatus,
        dailyRevenue,
        statusBreakdown
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange, startDate, endDate]);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>

        {/* Date Filter Controls */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateRange}
                label="Date Range"
                onChange={(e) => setDateRange(e.target.value)}
              >
                {dateRanges.map((range) => (
                  <MenuItem key={range.value} value={range.value}>
                    {range.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {dateRange === 'custom' && (
            <>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}
        </Grid>
      </Box>

      {/* Status Overview Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Object.entries(stats.statusBreakdown).map(([status, count]) => (
          <Grid item xs={6} sm={3} key={status}>
            <Card sx={{ bgcolor: `${statusColors[status as keyof typeof statusColors]}15` }}>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="h6" sx={{ color: statusColors[status as keyof typeof statusColors] }}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Typography>
                  <Typography variant="h4">
                    {count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    orders
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <AttachMoneyIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h5">
                    ${stats.totalRevenue.toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <ShoppingCartIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Orders
                  </Typography>
                  <Typography variant="h5">
                    {stats.totalOrders}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <InventoryIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Products
                  </Typography>
                  <Typography variant="h5">
                    {stats.totalProducts}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <TrendingUpIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Avg. Order Value
                  </Typography>
                  <Typography variant="h5">
                    ${stats.averageOrderValue.toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Revenue Trend */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue Trend (Last 7 Days)
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveLine
                  data={[
                    {
                      id: "revenue",
                      data: stats.dailyRevenue
                    }
                  ]}
                  margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                  xScale={{ type: 'point' }}
                  yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickRotation: -45,
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickRotation: 0,
                    legend: 'Revenue ($)',
                    legendOffset: -40,
                    legendPosition: 'middle'
                  }}
                  pointSize={10}
                  pointColor={{ theme: 'background' }}
                  pointBorderWidth={2}
                  pointBorderColor={{ from: 'serieColor' }}
                  enableArea={true}
                  areaOpacity={0.15}
                  useMesh={true}
                  legends={[
                    {
                      anchor: 'bottom-right',
                      direction: 'column',
                      justify: false,
                      translateX: 100,
                      translateY: 0,
                      itemsSpacing: 0,
                      itemDirection: 'left-to-right',
                      itemWidth: 80,
                      itemHeight: 20,
                      symbolSize: 12,
                      symbolShape: 'circle',
                    }
                  ]}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Orders by Status */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Orders by Status
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsivePie
                  data={stats.ordersByStatus}
                  margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                  innerRadius={0.5}
                  padAngle={0.7}
                  cornerRadius={3}
                  activeOuterRadiusOffset={8}
                  borderWidth={1}
                  borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                  arcLinkLabelsSkipAngle={10}
                  arcLinkLabelsTextColor="#333333"
                  arcLinkLabelsThickness={2}
                  arcLinkLabelsColor={{ from: 'color' }}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                  legends={[
                    {
                      anchor: 'bottom',
                      direction: 'row',
                      justify: false,
                      translateX: 0,
                      translateY: 56,
                      itemsSpacing: 0,
                      itemWidth: 100,
                      itemHeight: 18,
                      itemTextColor: '#999',
                      itemDirection: 'left-to-right',
                      itemOpacity: 1,
                      symbolSize: 18,
                      symbolShape: 'circle',
                    }
                  ]}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue by Category */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue by Category
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveBar
                  data={stats.revenueByCategory}
                  keys={['value']}
                  indexBy="id"
                  margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                  padding={0.3}
                  valueScale={{ type: 'linear' }}
                  indexScale={{ type: 'band', round: true }}
                  colors={{ scheme: 'nivo' }}
                  borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Category',
                    legendPosition: 'middle',
                    legendOffset: 32
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Revenue ($)',
                    legendPosition: 'middle',
                    legendOffset: -40
                  }}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                  legends={[
                    {
                      dataFrom: 'keys',
                      anchor: 'bottom-right',
                      direction: 'column',
                      justify: false,
                      translateX: 120,
                      translateY: 0,
                      itemsSpacing: 2,
                      itemWidth: 100,
                      itemHeight: 20,
                      itemDirection: 'left-to-right',
                      itemOpacity: 0.85,
                      symbolSize: 20,
                    }
                  ]}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 