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
  Typography,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  FormControlLabel,
  Switch,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

type ProductImages = Record<string, string>;

interface FormData {
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

const parseImages = (images: ProductImages | string[] | null | undefined): string[] => {
  try {
    if (!images) return [];
    if (Array.isArray(images)) return images;
    if (typeof images === 'object') {
      return Object.values(images);
    }
    return [];
  } catch (e) {
    console.error('Error parsing images:', e);
    return [];
  }
};

const ProductManagement = () => {
  const dispatch = useDispatch();
  const products = useSelector((state: RootState) => state.products.items);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: 0,
    stock: 0,
    category: 'cosplay',
    sub_category: '',
    images: [],
    ali_express_link: '',
    featured: false
  });

  const [imageUrl, setImageUrl] = useState('');

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: 0,
      stock: 0,
      category: 'cosplay',
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
      images: parseImages(typeof product.images === 'string' ? {} : product.images),
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
        ali_express_link: formData.ali_express_link || undefined
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
        <Button 
          variant="contained" 
          onClick={() => setOpen(true)}
          startIcon={<AddIcon />}
        >
          Add Product
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
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
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {CATEGORIES.map((category) => (
                <MenuItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {filteredProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={Object.values(product.images)[0] || 'https://via.placeholder.com/200?text=No+Image'}
                alt={product.title}
                sx={{ objectFit: 'cover' }}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.src = 'https://via.placeholder.com/200?text=Error+Loading+Image';
                }}
              />
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="h6" noWrap title={product.title}>
                    {product.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {product.description}
                  </Typography>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" color="primary">
                      ${product.price.toFixed(2)}
                    </Typography>
                    <Chip 
                      label={`Stock: ${product.stock || 0}`}
                      color={product.stock && product.stock > 0 ? 'success' : 'error'}
                      size="small"
                    />
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Chip 
                      label={product.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip 
                      label={product.sub_category}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  </Stack>
                </Stack>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end' }}>
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
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setFormData({ ...formData, featured: e.target.checked })
                    }
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