import React from 'react';
import { format } from 'date-fns';
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  Box,
  Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import OrderStatusHistory from './OrderStatusHistory';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
}));

const getStatusColor = (status) => {
  switch (status) {
    case 'delivered':
      return 'success';
    case 'shipped':
      return 'info';
    case 'processing':
      return 'warning';
    case 'cancelled':
    case 'refunded':
      return 'error';
    default:
      return 'default';
  }
};

const OrderDetails = ({ order }) => {
  // Format shipping address
  const formatAddress = (address) => {
    if (!address) return 'No address provided';
    const { street, city, state, zipCode, country } = address;
    return [street, city, state, zipCode, country]
      .filter(Boolean)
      .join(', ');
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: 'auto' }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <StyledPaper elevation={3}>
            <Typography variant="h6" gutterBottom>
              Order Details
            </Typography>
            <Typography variant="body1">
              <strong>Order ID:</strong> #{order.orderNumber}
            </Typography>
            <Typography variant="body1">
              <strong>Date:</strong> {order.date ? format(new Date(order.date), 'MMM dd, yyyy HH:mm') : 'Invalid date'}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <strong>Status:</strong>{' '}
              <Chip
                label={order.status}
                color={getStatusColor(order.status)}
                size="small"
              />
            </Box>
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={6}>
          <StyledPaper elevation={3}>
            <Typography variant="h6" gutterBottom>
              Customer Information
            </Typography>
            <Typography variant="body1">
              <strong>Name:</strong> {order.customerName}
            </Typography>
            <Typography variant="body1">
              <strong>Shipping Address:</strong>
              <br />
              {formatAddress(order.shippingAddress)}
            </Typography>
          </StyledPaper>
        </Grid>
      </Grid>

      <StyledPaper elevation={3}>
        <Typography variant="h6" gutterBottom>
          Order Items
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>Product</StyledTableCell>
                <StyledTableCell align="right">Quantity</StyledTableCell>
                <StyledTableCell align="right">Price</StyledTableCell>
                <StyledTableCell align="right">Subtotal</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items?.map((item) => (
                <TableRow key={item.productId}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                  <TableCell align="right">
                    ${(item.quantity * item.price).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <StyledTableCell colSpan={3} align="right">
                  Total:
                </StyledTableCell>
                <StyledTableCell align="right">
                  ${order.total?.toFixed(2)}
                </StyledTableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </StyledPaper>

      <StyledPaper elevation={3}>
        <Typography variant="h6" gutterBottom>
          Payment Information
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ mr: 1 }}>
            <strong>Payment Status:</strong>
          </Typography>
          <Chip
            label={order.paymentStatus}
            color={order.paymentStatus === 'paid' ? 'success' : order.paymentStatus === 'pending' ? 'warning' : 'error'}
            size="small"
          />
        </Box>
      </StyledPaper>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Status History
          </Typography>
          <OrderStatusHistory statusUpdates={order.statusUpdates || []} />
        </CardContent>
      </Card>
    </Box>
  );
};

export default OrderDetails;