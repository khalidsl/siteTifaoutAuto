import type { CartItem, GuestInfo } from '../types';

export const calculateOrderTotals = (cart: CartItem[], discountRate = 0) => {
  const rawSubtotal = cart.reduce((sum, item) => sum + (item.product.price || 0) * item.qty, 0);
  const discount = discountRate > 0 ? Math.round(rawSubtotal * discountRate / 100) : 0;
  const subtotal = rawSubtotal - discount;
  const shipping = subtotal > 2000 ? 0 : 50;
  return { rawSubtotal, discount, subtotal, shipping, total: subtotal + shipping };
};

export const buildOrderItems = (cart: CartItem[], discountRate = 0) => cart.map(item => {
  const unitPrice = item.product.price || 0;
  const discountedPrice = discountRate > 0 ? Math.round(unitPrice * (1 - discountRate / 100)) : unitPrice;
  return {
    productId: item.product.id || item.product._id,
    productName: item.product.name,
    productRef: item.product.reference || item.product.ref || '',
    qty: item.qty,
    price: discountedPrice,
  };
});

export const buildOrderPayload = (cart: CartItem[], info: GuestInfo, isGuest: boolean, discountRate = 0) => ({
  isGuest,
  discountRate,
  guestInfo: {
    firstName: info.firstName.trim(),
    lastName: info.lastName.trim(),
    email: info.email?.trim() || '',
    phone: info.phone.trim(),
    address: info.address.trim(),
    city: info.city.trim(),
    paymentMethod: info.paymentMethod || 'especes',
  },
  items: buildOrderItems(cart, discountRate),
  total: calculateOrderTotals(cart, discountRate).total,
});
