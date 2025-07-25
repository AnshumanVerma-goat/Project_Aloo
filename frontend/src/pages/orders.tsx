import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  Chip,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import BaseLayout from '../components/BaseLayout';
import api from '../services/api';

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  customer_id: number;
  customer_name: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  items: OrderItem[];
}

const statusColors: Record<string, string> = {
  pending: '#FFA000',
  confirmed: '#1976D2',
  shipped: '#7B1FA2',
  delivered: '#388E3C',
  cancelled: '#D32F2F',
};

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get<Order[]>('/orders');
      setOrders(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      setError('Failed to update order status. Please try again.');
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  if (loading) {
    return (
      <BaseLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <Box>
        <Typography variant="h4" gutterBottom>
          Orders
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Total Amount</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>#{order.id}</TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onChange={(e: SelectChangeEvent) => 
                            handleStatusChange(order.id, e.target.value)
                          }
                          size="small"
                          sx={{
                            minWidth: 120,
                            '& .MuiSelect-select': {
                              color: statusColors[order.status],
                              fontWeight: 'bold',
                            },
                          }}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="confirmed">Confirmed</MenuItem>
                          <MenuItem value="shipped">Shipped</MenuItem>
                          <MenuItem value="delivered">Delivered</MenuItem>
                          <MenuItem value="cancelled">Cancelled</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell align="right">₹{order.total_amount.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => handleViewDetails(order)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Order Details #{selectedOrder?.id}
          </DialogTitle>
          <DialogContent>
            {selectedOrder && (
              <>
                <Box mb={3}>
                  <Typography variant="subtitle1" gutterBottom>
                    Customer Information
                  </Typography>
                  <Typography>Name: {selectedOrder.customer_name}</Typography>
                  <Typography>Order Date: {new Date(selectedOrder.created_at).toLocaleString()}</Typography>
                  <Typography>
                    Status: <Chip 
                      label={selectedOrder.status.toUpperCase()} 
                      sx={{ 
                        backgroundColor: statusColors[selectedOrder.status],
                        color: 'white',
                      }} 
                    />
                  </Typography>
                </Box>

                <Typography variant="subtitle1" gutterBottom>
                  Order Items
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.product_name}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">₹{item.price.toFixed(2)}</TableCell>
                          <TableCell align="right">
                            ₹{(item.quantity * item.price).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          <strong>Total Amount:</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>₹{selectedOrder.total_amount.toFixed(2)}</strong>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </BaseLayout>
  );
};

export default OrdersPage;
