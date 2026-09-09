import type { CartItem, GuestInfo } from '../types';

export const calculateOrderTotals = (cart: CartItem[]) => {
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price || 0) * item.qty, 0);
  const shipping = subtotal > 2000 ? 0 : 50;
  return { subtotal, shipping, total: subtotal + shipping };
};

export const buildOrderItems = (cart: CartItem[]) => cart.map(item => ({
  productId: item.product.id || item.product._id,
  productName: item.product.name,
  productRef: item.product.reference || item.product.ref || '',
  qty: item.qty,
  price: item.product.price || 0,
}));

export const buildOrderPayload = (cart: CartItem[], info: GuestInfo, isGuest: boolean) => ({
  isGuest,
  guestInfo: {
    firstName: info.firstName.trim(),
    lastName: info.lastName.trim(),
    email: info.email?.trim() || '',
    phone: info.phone.trim(),
    address: info.address.trim(),
    city: info.city.trim(),
    paymentMethod: info.paymentMethod || 'especes',
  },
  items: buildOrderItems(cart),
  total: calculateOrderTotals(cart).total,
});
