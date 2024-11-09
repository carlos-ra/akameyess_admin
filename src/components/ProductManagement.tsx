import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setProducts, setLoading, setError } from '../store/slices/productsSlice';
import { productService } from '../services/supabase/products';
import { Product } from '../services/supabase/types';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  InputAdornment,
  Grid,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

interface ProductFormData {
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  sub_category: string;
  images: string[];
  ali_express_link?: string;
  featured: boolean;
}

const CATEGORIES = ['cosplay', 'beauty'] as const;

const parseImages = (images: any): string[] => {
  try {
    if (Array.isArray(images)) return images;
    if (typeof images === 'object' && images !== null) {
      // Convert object format to array
      return Object.values(images).filter(url => typeof url === 'string');
    }
    return [];
  } catch (e) {
    console.error('Error parsing images:', e, images);
    return [];
  }
};

const ProductManagement = () => {
  const dispatch = useDispatch();
  const products = useSelector((state: RootState) => state.products.items);
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    sub_category: '',
    images: [],
    ali_express_link: '',
    featured: false
  });

  const [imageUrl, setImageUrl] = useState('');

  const filteredProducts = products.filter(product => 
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      sub_category: '',
      images: [],
      ali_express_link: '',
      featured: false
    });
    setEditingProduct(null);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const fetchProducts = async () => {
    try {
      dispatch(setLoading(true));
      const products = await productService.getAll();
      dispatch(setProducts(products));
    } catch (error) {
      console.error('Error fetching products:', error);
      dispatch(setError('Failed to fetch products'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description || '',
      price: product.price,
      stock: product.stock || 0,
      category: product.category,
      sub_category: product.sub_category,
      images: parseImages(product.images),
      ali_express_link: product.ali_express_link || '',
      featured: product.featured || false
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      dispatch(setLoading(true));
      
      const productData = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        images: formData.images,
        category: formData.category,
        sub_category: formData.sub_category,
        stock: formData.stock,
        featured: formData.featured,
        ali_express_link: formData.ali_express_link || null
      };

      if (editingProduct) {
        await productService.update(editingProduct.id, productData);
      } else {
        await productService.create(productData);
      }

      await fetchProducts();
      handleClose();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error saving product:', error);
      dispatch(setError('Failed to save product'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        dispatch(setLoading(true));
        await productService.delete(productId);
        await fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        dispatch(setError('Failed to delete product'));
      } finally {
        dispatch(setLoading(false));
      }
    }
  };

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, imageUrl.trim()]
      });
      setImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Products</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add Product
        </Button>
      </Box>

      <TextField
        fullWidth
        margin="normal"
        placeholder="Search products by title or description..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="80px">Image</TableCell>
              <TableCell 
                width="20%" 
                sx={{ 
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '200px'
                }}
              >
                Title
              </TableCell>
              <TableCell width="10%">Price</TableCell>
              <TableCell width="8%">Stock</TableCell>
              <TableCell width="12%">Category</TableCell>
              <TableCell width="12%">Sub Category</TableCell>
              <TableCell width="20%">Description</TableCell>
              <TableCell width="8%">Featured</TableCell>
              <TableCell width="10%" align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.map((product: Product) => (
              <TableRow key={product.id}>
                <TableCell sx={{ width: '80px', padding: '8px' }}>
                  <Box
                    component="img"
                    sx={{
                      width: '60px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: 1,
                      display: 'block',
                    }}
                    src={(() => {
                      const parsedImages = parseImages(product.images);
                      return parsedImages.length > 0 
                        ? parsedImages[0] 
                        : 'https://via.placeholder.com/60?text=No+Image';
                    })()}
                    alt={product.title}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      const target = e.currentTarget;
                      console.error('Image load error:', target.src);
                      target.src = 'https://via.placeholder.com/60?text=Error';
                    }}
                  />
                </TableCell>
                <TableCell
                  sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '200px',
                    '&:hover': {
                      overflow: 'visible',
                      whiteSpace: 'normal',
                      backgroundColor: 'background.paper',
                      position: 'relative',
                      zIndex: 1,
                    }
                  }}
                  title={product.title}
                >
                  {product.title}
                </TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell
                  sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '150px'
                  }}
                  title={product.category}
                >
                  {product.category}
                </TableCell>
                <TableCell
                  sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '150px'
                  }}
                  title={product.sub_category}
                >
                  {product.sub_category}
                </TableCell>
                <TableCell
                  sx={{
                    maxWidth: '300px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      overflow: 'visible',
                      whiteSpace: 'normal',
                      backgroundColor: 'background.paper',
                      position: 'relative',
                      zIndex: 1,
                    }
                  }}
                  title={product.description}
                >
                  {product.description}
                </TableCell>
                <TableCell>{product.featured ? 'Yes' : 'No'}</TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => handleEdit(product)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => handleDelete(product.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                margin="normal"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Sub Category"
                margin="normal"
                value={formData.sub_category}
                onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                margin="normal"
                value={formData.price === 0 ? '' : formData.price}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({
                    ...formData,
                    price: value === '' ? 0 : Number(value)
                  });
                }}
                InputProps={{
                  inputProps: { 
                    min: 0,
                    step: 0.01,
                    onKeyDown: (e) => {
                      if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                        e.preventDefault();
                      }
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Stock"
                type="number"
                margin="normal"
                value={formData.stock === 0 ? '' : formData.stock}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({
                    ...formData,
                    stock: value === '' ? 0 : Number(value)
                  });
                }}
                InputProps={{
                  inputProps: { 
                    min: 0,
                    onKeyDown: (e) => {
                      if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                        e.preventDefault();
                      }
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="AliExpress Link"
                margin="normal"
                value={formData.ali_express_link}
                onChange={(e) => setFormData({ ...formData, ali_express_link: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                margin="normal"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    color="primary"
                  />
                }
                label="Featured Product"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Product Images
                </Typography>
                
                {/* Current Images */}
                {formData.images.length > 0 && (
                  <ImageList sx={{ width: '100%', height: 'auto', maxHeight: 400 }} cols={3} rowHeight={200}>
                    {formData.images.map((url, index) => (
                      <ImageListItem key={index} sx={{ overflow: 'hidden' }}>
                        <img
                          src={url}
                          alt={`Product image ${index + 1}`}
                          loading="lazy"
                          style={{ height: '200px', objectFit: 'cover' }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/200?text=Invalid+Image';
                          }}
                        />
                        <ImageListItemBar
                          sx={{
                            background:
                              'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                          }}
                          position="top"
                          actionIcon={
                            <IconButton
                              sx={{ color: 'white' }}
                              onClick={() => handleRemoveImage(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          }
                          actionPosition="right"
                        />
                      </ImageListItem>
                    ))}
                    {/* Add Image Tile */}
                    <ImageListItem>
                      <Box
                        sx={{
                          height: '200px',
                          border: '2px dashed #ccc',
                          borderRadius: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: 'action.hover',
                          },
                        }}
                        onClick={() => document.getElementById('image-url-input')?.focus()}
                      >
                        <AddPhotoAlternateIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Add Image URL
                        </Typography>
                      </Box>
                    </ImageListItem>
                  </ImageList>
                )}

                {/* Image URL Input */}
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <TextField
                    id="image-url-input"
                    fullWidth
                    label="Image URL"
                    placeholder="Enter image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    size="small"
                    InputProps={{
                      endAdornment: formData.images.length === 0 && (
                        <InputAdornment position="end">
                          <AddPhotoAlternateIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddImage}
                    disabled={!imageUrl.trim()}
                    sx={{ minWidth: '120px' }}
                  >
                    Add Image
                  </Button>
                </Box>

                {/* Image Guidelines */}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Add up to 5 images. Recommended size: 800x800 pixels. Supported formats: JPG, PNG
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={formData.images.length === 0}
          >
            {editingProduct ? 'Save Changes' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductManagement; 