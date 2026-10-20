export const kpis = [
  { label: 'TOTAL GROSS SALES', value: 42850, unit: 'EGP', icon: 'wallet', tone: 'pink', change: '+14.2%', changeTone: 'mint', detail: 'vs. yesterday (37,520 EGP)' },
  { label: 'TOTAL ORDERS FULFILLED', value: 168, unit: 'Orders', icon: 'orders', tone: 'mint', change: 'Daily Target: 200', changeTone: 'grey', detail: '84% achieved', detailTone: 'accent' },
  { label: 'AVERAGE ORDER VALUE', value: 255, unit: 'EGP', icon: 'bag', tone: 'beige', change: '+8.5%', changeTone: 'mint', detail: 'upsell peak post-lunch' },
  { label: 'OCCUPIED FLOOR TABLES', value: '6 / 8', unit: 'Tables', icon: 'chair', tone: 'cream', change: '75% Occupancy', changeTone: 'occupancy', detail: '2 tables vacant' },
]

export const salesTrend = [
  { day: 'Sat', total: '17,000 EGP', orders: 208 },
  { day: 'Sun', total: '17,000 EGP', orders: 224 },
  { day: 'Mon', total: '28,000 EGP', orders: 248 },
  { day: 'Tue', total: '21,200 EGP', orders: 260 },
  { day: 'Wed', total: '28,000 EGP', orders: 276 },
  { day: 'Thu', total: '39,000 EGP', orders: 290 },
  { day: 'Fri', total: '39,000 EGP', orders: 302 },
]

export const paymentMethods = [
  { label: 'Wallet', value: 1840, color: '#1F8A6B' },
  { label: 'Split', value: 860, color: '#B9A5AB' },
  { label: 'Card', value: 7920, color: '#78263D' },
  { label: 'Cash', value: 3120, color: '#DC9A33' },
]

export const recentOrders = [
  { id: '#1051', time: '17:58', type: 'Delivery', zone: '', items: '1× Rose Cardamom Latte, 1× Pistachio Kunafa Tart', status: 'New', total: 349.2 },
  { id: '#1045', time: '17:58', type: 'Dine-in', zone: 'Z-04', items: '2× Cappuccino, 1× Halloumi Brioche Toast', status: 'Preparing', total: 349.2 },
  { id: '#1049', time: '17:11', type: 'Dine-in', zone: 'Z-04', items: '2× V60 Specialty Pour Over, 1× San Sebastian Cheesecake', status: 'Served', total: 837.9 },
  { id: '#1040', time: '16:02', type: 'Delivery', zone: '', items: '1× Iced Caramel Macchiato', status: 'Cancelled', total: 183.9 },
  { id: '#1036', time: '15:22', type: 'Takeaway', zone: '', items: '2× Spanish Latte', status: 'Served', total: 273.6 },
  { id: '#1032', time: '14:27', type: 'Dine-in', zone: 'Z-03', items: '3× Flat White, 2× Salted Caramel Brownie', status: 'Served', total: 573.3 },
]

export const bestSellers = [
  { name: 'V60 Specialty Pour Over', sold: 26, revenue: 3640, image: 'v60-pour-over.jpg' },
  { name: 'Spanish Latte', sold: 30, revenue: 3640, image: 'spanish-latte.jpg' },
  { name: 'Rose Cardamom Latte', sold: 22, revenue: 2860, image: 'rose-cardamom-latte.jpg' },
  { name: 'San Sebastian Cheesecake', sold: 13, revenue: 2590, image: 'san-sebastian-cheesecake.jpg' },
  { name: 'Cold Brew Hibiscus', sold: 13, revenue: 2160, image: 'cold-brew-hibiscus.jpg' },
]

export const branches = [
  { name: 'Cairo Downtown', orders: 153, aov: 120, revenue: 18360 },
  { name: 'Zamalek', orders: 111, aov: 124, revenue: 13740, viewing: true },
  { name: 'New Cairo', orders: 70, aov: 117, revenue: 8150 },
]

export const staffOnShift = [
  { name: 'Youssef Gamal', initials: 'YG', hours: '5h 14m', amount: 8240 },
  { name: 'Nour Hassan', initials: 'NH', hours: '4h 38m', amount: 6930 },
  { name: 'Omar Khaled', initials: 'OK', hours: '6h 02m', amount: 6180 },
  { name: 'Mariam Adel', initials: 'MA', hours: '3h 47m', amount: 5720 },
  { name: 'Karim Sami', initials: 'KS', hours: '5h 26m', amount: 4910 },
]
