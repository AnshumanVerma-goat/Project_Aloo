import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Button,
  useTheme,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Add as AddIcon } from '@mui/icons-material';
import BaseLayout from '../components/BaseLayout';
import api from '../services/api';

interface DashboardStats {
  total_orders: number;
  total_revenue: number;
  orders_by_status: {
    [key: string]: number;
  };
  top_products: {
    product_id: number;
    product_name: string;
    total_quantity: number;
    total_revenue: number;
  }[];
  revenue_by_day: {
    [key: string]: number;
  };
}

interface Order {
  id: number;
  customer_id: number;
  total_amount: number;
  status: string;
  created_at: string;
  items: {
    id: number;
    product_id: number;
    quantity: number;
    price: number;
  }[];
}

const VendorDashboard: React.FC = () => {
  const theme = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, ordersResponse] = await Promise.all([
          api.get<DashboardStats>('/vendor-dashboard/me/stats'),
          api.get<Order[]>('/vendor-dashboard/me/orders'),
        ]);

        setStats(statsResponse.data);
        setOrders(ordersResponse.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <BaseLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </BaseLayout>
    );
  }

  if (error) {
    return (
      <BaseLayout>
        <Box p={3}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </BaseLayout>
    );
  }

  const revenueData = stats?.revenue_by_day
    ? Object.entries(stats.revenue_by_day).map(([date, amount]) => ({
        date,
        revenue: amount,
      }))
    : [];

  return (
    <BaseLayout>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Vendor Dashboard</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            href="/products/new"
          >
            Add New Product
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Orders
                </Typography>
                <Typography variant="h5">
                  {stats?.total_orders || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h5">
                  ₹{stats?.total_revenue?.toFixed(2) || '0.00'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending Orders
                </Typography>
                <Typography variant="h5">
                  {stats?.orders_by_status?.pending || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Delivered Orders
                </Typography>
                <Typography variant="h5">
                  {stats?.orders_by_status?.delivered || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Revenue Chart */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Revenue Last 7 Days
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill={theme.palette.primary.main} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Top Products
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product Name</TableCell>
                    <TableCell align="right">Quantity Sold</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats?.top_products.map((product) => (
                    <TableRow key={product.product_id}>
                      <TableCell>{product.product_name}</TableCell>
                      <TableCell align="right">{product.total_quantity}</TableCell>
                      <TableCell align="right">₹{product.total_revenue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Orders
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Items</TableCell>
                    <TableCell align="right">Total Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Typography
                          component="span"
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            backgroundColor: 
                              order.status === 'delivered'
                                ? '#E8F5E9'
                                : order.status === 'pending'
                                ? '#FFF3E0'
                                : '#F5F5F5',
                            color:
                              order.status === 'delivered'
                                ? '#2E7D32'
                                : order.status === 'pending'
                                ? '#E65100'
                                : '#424242',
                          }}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{order.items.length}</TableCell>
                      <TableCell align="right">₹{order.total_amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </BaseLayout>
  );
};

export default VendorDashboard;
