import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setCarts, setLoading, setError } from '../store/slices/cartsSlice';
import { cartService } from '../services/supabase/carts';
import { CartItem, User } from '../services/supabase/types';
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
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SearchIcon from '@mui/icons-material/Search';

interface CartRowProps {
  cartItems: CartItem[];
  user: User;
  created_at?: string;
}

const CartRow = ({ cartItems, user, created_at }: CartRowProps) => {
  const [open, setOpen] = useState(false);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.quantity * (item.product?.price || 0),
    0
  );

  return (
    <>
      <TableRow>
        <TableCell width="5%">
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell width="35%">{user.email}</TableCell>
        <TableCell width="20%">{totalItems}</TableCell>
        <TableCell width="20%">${totalAmount.toFixed(2)}</TableCell>
        <TableCell width="20%">
          {created_at ? new Date(created_at).toLocaleDateString() : 'N/A'}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Cart Items
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width="40%">Product</TableCell>
                    <TableCell width="20%">Quantity</TableCell>
                    <TableCell width="20%">Price</TableCell>
                    <TableCell width="20%">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cartItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.product?.title || 'Unknown Product'}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${item.product?.price.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>
                        ${((item.quantity * (item.product?.price || 0))).toFixed(2)}
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

const CartManagement = () => {
  const dispatch = useDispatch();
  const carts = useSelector((state: RootState) => state.carts.carts);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateSort, setDateSort] = useState<'newest' | 'oldest'>('newest');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredAndSortedCarts = carts
    .filter(cart => {
      const matchesSearch = cart.user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const cartDate = cart.items[0]?.created_at ? new Date(cart.items[0].created_at) : new Date();
      const isAfterStart = !startDate || cartDate >= new Date(startDate);
      const isBeforeEnd = !endDate || cartDate <= new Date(endDate);
      
      return matchesSearch && isAfterStart && isBeforeEnd;
    })
    .sort((a, b) => {
      const dateA = new Date(a.items[0]?.created_at || '').getTime();
      const dateB = new Date(b.items[0]?.created_at || '').getTime();
      return dateSort === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const fetchCarts = async () => {
    try {
      dispatch(setLoading(true));
      const cartsData = await cartService.getAllCarts();
      dispatch(setCarts(cartsData));
    } catch (error) {
      console.error('Error fetching carts:', error);
      dispatch(setError('Failed to fetch carts'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Shopping Carts
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Search by user email..."
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
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
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
              <TableCell>User</TableCell>
              <TableCell>Total Items</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Created At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedCarts.map((cart) => (
              <CartRow 
                key={cart.items[0]?.id || Math.random()}
                cartItems={cart.items}
                user={cart.user}
                created_at={cart.items[0]?.created_at}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CartManagement; 