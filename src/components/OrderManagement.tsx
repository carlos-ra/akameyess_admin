import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setOrders, setLoading, setError } from '../store/slices/ordersSlice';
import { orderService } from '../services/supabase/orders';
import { Order, OrderItem } from '../services/supabase/types';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Collapse,
  IconButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Chip,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SearchIcon from '@mui/icons-material/Search';

interface OrderRowProps {
  order: Order & { items: (OrderItem & { product: { title: string } })[] };
}

const OrderRow = ({ order }: OrderRowProps) => {
  const [open, setOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      <TableRow>
        <TableCell width="5%">
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell width="20%">{order.user?.email || 'Unknown User'}</TableCell>
        <TableCell width="15%">${order.total_amount.toFixed(2)}</TableCell>
        <TableCell width="15%">
          <Chip 
            label={order.status} 
            color={getStatusColor(order.status || '')}
            size="small"
          />
        </TableCell>
        <TableCell width="25%">{order.shipping_address}</TableCell>
        <TableCell width="20%">
          {new Date(order.created_at || '').toLocaleDateString()}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Order Items
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width="40%">Product</TableCell>
                    <TableCell width="20%">Quantity</TableCell>
                    <TableCell width="20%">Price at Time</TableCell>
                    <TableCell width="20%">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.product.title}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${item.price_at_time.toFixed(2)}</TableCell>
                      <TableCell>
                        ${(item.quantity * item.price_at_time).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const OrderManagement = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state: RootState) => state.orders.items);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateSort, setDateSort] = useState<'newest' | 'oldest'>('newest');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredAndSortedOrders = orders
    .filter(order => {
      const matchesSearch = order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.shipping_address?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const orderDate = new Date(order.created_at || '');
      const isAfterStart = !startDate || orderDate >= new Date(startDate);
      const isBeforeEnd = !endDate || orderDate <= new Date(endDate);
      
      return matchesSearch && matchesStatus && isAfterStart && isBeforeEnd;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at || '').getTime();
      const dateB = new Date(b.created_at || '').getTime();
      return dateSort === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const fetchOrders = async () => {
    try {
      dispatch(setLoading(true));
      const ordersData = await orderService.getAllOrders();
      dispatch(setOrders(ordersData));
    } catch (error) {
      console.error('Error fetching orders:', error);
      dispatch(setError('Failed to fetch orders'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Orders
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            placeholder="Search by email or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Sort by Date</InputLabel>
            <Select
              value={dateSort}
              label="Sort by Date"
              onChange={(e) => setDateSort(e.target.value as 'newest' | 'oldest')}
            >
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="oldest">Oldest First</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2.5}>
          <TextField
            fullWidth
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} md={2.5}>
          <TextField
            fullWidth
            type="date"
            label="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Customer</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Shipping Address</TableCell>
              <TableCell>Created At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedOrders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OrderManagement; 