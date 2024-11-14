import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setOrders, setLoading as setGlobalLoading, setError } from '../store/slices/ordersSlice';
import { orderService } from '../services/supabase/orders';
import { Order } from '../services/supabase/types';
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
  Stack,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

interface CartItem {
  id: string;
  user_id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  created_at: string;
  updated_at: string;
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
    images: Record<string, string>;
  };
}

interface OrderWithEmail extends Order {
  email?: string;
}

const OrderRow = ({ order }: { order: OrderWithEmail }) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status: string = 'pending') => {
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'processing': return 'info';
      case 'cancelled': return 'error';
      default: return 'warning';
    }
  };

  const handleRowClick = async () => {
    try {
      if (!open && items.length === 0) {
        setLoading(true);
        console.log('Fetching items for order:', order.id);
        const cartItems = await orderService.getCartItemsByOrderId(order.id);
        console.log('Received items:', cartItems);
        setItems(cartItems as unknown as CartItem[]);
      }
      setOpen(!open);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <TableRow 
        hover
        onClick={handleRowClick}
        sx={{ cursor: 'pointer' }}
      >
        <TableCell width="5%">
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick();
            }}
          >
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />
            )}
          </IconButton>
        </TableCell>
        <TableCell 
          width="20%" 
          sx={{ 
            maxWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={order.id}
        >
          {order.id}
        </TableCell>
        <TableCell 
          width="20%" 
          sx={{ 
            maxWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={order.user_id}
        >
          {order.user_id}
        </TableCell>
        <TableCell 
          width="20%"
          sx={{ 
            maxWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={order.email || 'N/A'}
        >
          {order.email || 'N/A'}
        </TableCell>
        <TableCell width="10%" align="right">
          ${Number(order.total_amount).toFixed(2)}
        </TableCell>
        <TableCell width="15%" align="center">
          <Chip 
            label={order.status} 
            color={getStatusColor(order.status)}
            size="small"
          />
        </TableCell>
        <TableCell width="10%">
          {new Date(order.created_at || '').toLocaleDateString()}
        </TableCell>
      </TableRow>
      {items.length > 0 && (
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 2, bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <ShoppingCartIcon color="primary" />
                  <Typography variant="h6" component="div">
                    Order Items ({totalItems})
                  </Typography>
                </Stack>
                <Grid container spacing={2}>
                  {items.map((item) => (
                    <Grid item xs={12} md={6} key={item.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={3}>
                              <Avatar
                                variant="rounded"
                                src={Object.values(item.product?.images || {})[0] || ''}
                                alt={item.product?.title || 'Unknown Product'}
                                sx={{ 
                                  width: 80, 
                                  height: 80,
                                  bgcolor: 'grey.200'
                                }}
                              >
                                {!item.product?.images && 'No Image'}
                              </Avatar>
                            </Grid>
                            <Grid item xs={9}>
                              <Stack spacing={1}>
                                <Typography variant="subtitle1" component="div">
                                  {item.product?.title || 'Unknown Product'}
                                </Typography>
                                <Stack
                                  direction="row"
                                  justifyContent="space-between"
                                  alignItems="center"
                                >
                                  <Typography variant="body2" color="text.secondary">
                                    Quantity: {item.quantity}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Price: ${Number(item.price_at_time).toFixed(2)}
                                  </Typography>
                                </Stack>
                                <Divider />
                                <Stack
                                  direction="row"
                                  justifyContent="space-between"
                                  alignItems="center"
                                >
                                  <Typography variant="subtitle2" color="primary">
                                    Subtotal
                                  </Typography>
                                  <Typography variant="subtitle2" color="primary">
                                    ${(Number(item.quantity) * Number(item.price_at_time)).toFixed(2)}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

const OrderManagement = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state: RootState) => state.orders.items);
  const [searchTerm, setSearchTerm] = useState('');
  const [emailSearchTerm, setEmailSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        dispatch(setGlobalLoading(true));
        const ordersData = await orderService.getAllOrders();
        console.log('Orders fetched:', ordersData);
        dispatch(setOrders(ordersData));
      } catch (error) {
        console.error('Error fetching orders:', error);
        dispatch(setError('Failed to fetch orders'));
      } finally {
        dispatch(setGlobalLoading(false));
      }
    };

    fetchOrders();
  }, [dispatch]);

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = order.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmail = !emailSearchTerm || 
      (order as OrderWithEmail).email?.toLowerCase().includes(emailSearchTerm.toLowerCase()) || false;
    return matchesStatus && matchesSearch && matchesEmail;
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Orders
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Search by user ID..."
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
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Search by email..."
            value={emailSearchTerm}
            onChange={(e) => setEmailSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
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
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="5%" />
              <TableCell width="20%">Order ID</TableCell>
              <TableCell width="20%">User ID</TableCell>
              <TableCell width="20%">Email</TableCell>
              <TableCell width="10%" align="right">Total Amount</TableCell>
              <TableCell width="15%" align="center">Status</TableCell>
              <TableCell width="10%">Created At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OrderManagement; 