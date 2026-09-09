export const ORDER_STATUSES = [
  'En attente',
  'En préparation',
  'Payée',
  'Expédié',
  'Livré',
  'Retour',
  'Annulé',
] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];

export const getOrderStatusClass = (status: string): string => {
  switch (status) {
    case 'Livré':
      return 'bg-green-100 text-green-800';
    case 'Payée':
      return 'bg-emerald-100 text-emerald-800';
    case 'Retour':
    case 'Annulé':
      return 'bg-red-100 text-red-800';
    case 'Expédié':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-amber-100 text-amber-800';
  }
};
