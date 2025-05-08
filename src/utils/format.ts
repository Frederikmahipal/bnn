/**
 * Formats a number as Danish currency (DKK)
 * @param price - The price to format
 * @returns Formatted price string with DKK and thousand separators
 */
export function formatPrice(price: number | undefined): string {
  if (price === undefined) return '';
  
  // Use Danish locale for number formatting
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true // Ensure thousand separators are used
  }).format(price);
} 