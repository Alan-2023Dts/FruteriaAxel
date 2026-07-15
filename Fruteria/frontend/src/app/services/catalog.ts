import naranjaSrc from '../../imports/naranja.jpg';
import type { Product, ProductCategory, TicketSummary } from '../types/fruteria';

export const CATEGORIES: Array<'Todos' | ProductCategory> = [
  'Todos',
  'Frutas',
  'Verduras',
  'Cítricos',
  'Temporada',
  'Abarrotes',
  'Lácteos',
  'Otros',
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: 'Manzana Roja', price: 35.00, unit: 'kg', stock: 24, category: 'Frutas', image: 'https://images.unsplash.com/photo-1630563451961-ac2ff27616ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { id: 2, name: 'Plátano Tabasco', price: 18.50, unit: 'kg', stock: 15, category: 'Frutas', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { id: 3, name: 'Sandía', price: 12.00, unit: 'kg', stock: 8, category: 'Frutas', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { id: 4, name: 'Piña Miel', price: 45.00, unit: 'pza', stock: 5, category: 'Frutas', image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { id: 5, name: 'Mango Manila', price: 32.00, unit: 'kg', stock: 12, category: 'Frutas', image: 'https://images.unsplash.com/photo-1587486936739-78df7470c7e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { id: 6, name: 'Papaya Maradol', price: 18.00, unit: 'kg', stock: 6, category: 'Frutas', image: 'https://images.unsplash.com/photo-1526318472351-c75fcf070305?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { id: 7, name: 'Pera Verde', price: 42.00, unit: 'kg', stock: 10, category: 'Frutas', image: 'https://images.unsplash.com/photo-1680559044009-bb031f8a2409?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { id: 8, name: 'Uva Verde', price: 55.00, unit: 'kg', stock: 7, category: 'Frutas', image: 'https://images.unsplash.com/photo-1725195398648-f3454b552b20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { id: 9, name: 'Limón Colima', price: 28.00, unit: 'kg', stock: 20, category: 'Cítricos', image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { id: 10, name: 'Naranja Valencia', price: 22.00, unit: 'kg', stock: 18, category: 'Cítricos', image: naranjaSrc },
  { id: 11, name: 'Toronja Roja', price: 20.00, unit: 'kg', stock: 9, category: 'Cítricos', image: 'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { id: 12, name: 'Mandarina', price: 30.00, unit: 'kg', stock: 14, category: 'Cítricos', image: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { id: 13, name: 'Zanahoria', price: 15.00, unit: 'kg', stock: 25, category: 'Verduras', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { id: 14, name: 'Aguacate Hass', price: 65.00, unit: 'kg', stock: 0, category: 'Verduras', image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { id: 15, name: 'Jitomate Bola', price: 22.00, unit: 'kg', stock: 11, category: 'Verduras', image: 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { id: 16, name: 'Pepino', price: 12.00, unit: 'kg', stock: 8, category: 'Verduras', image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { id: 17, name: 'Chile Verde', price: 35.00, unit: 'kg', stock: 5, category: 'Verduras', image: 'https://images.unsplash.com/photo-1622376242797-538aa64a9d38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { id: 18, name: 'Papa Blanca', price: 18.00, unit: 'kg', stock: 30, category: 'Verduras', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { id: 19, name: 'Cebolla Blanca', price: 16.00, unit: 'kg', stock: 22, category: 'Verduras', image: 'https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { id: 20, name: 'Calabacita', price: 20.00, unit: 'kg', stock: 6, category: 'Verduras', image: 'https://images.unsplash.com/photo-1615485499978-1279c3d6302f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { id: 21, name: 'Fresa', price: 65.00, unit: 'kg', stock: 4, category: 'Temporada', image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
  { id: 22, name: 'Durazno', price: 48.00, unit: 'kg', stock: 8, category: 'Temporada', image: 'https://images.unsplash.com/photo-1629828874514-c1e5103f2150?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400' },
];

export const INITIAL_TICKETS: TicketSummary[] = [
  { id: '#4521', ago: 'Hace 15 min', items: 3, total: 184.50, method: 'Efectivo' },
  { id: '#4520', ago: 'Hace 42 min', items: 1, total: 45.00, method: 'Tarjeta' },
  { id: '#4519', ago: 'Hace 1h 05m', items: 8, total: 512.20, method: 'Efectivo' },
  { id: '#4518', ago: 'Hace 1h 38m', items: 2, total: 93.75, method: 'Transferencia' },
  { id: '#4517', ago: 'Hace 2h 10m', items: 5, total: 267.00, method: 'Efectivo' },
  { id: '#4516', ago: 'Hace 2h 51m', items: 4, total: 138.50, method: 'Tarjeta' },
  { id: '#4515', ago: 'Hace 3h 20m', items: 7, total: 430.00, method: 'Efectivo' },
  { id: '#4514', ago: 'Hace 4h 05m', items: 1, total: 22.00, method: 'Tarjeta' },
  { id: '#4513', ago: 'Hace 5h 14m', items: 6, total: 318.90, method: 'Efectivo' },
  { id: '#4512', ago: 'Hace 6h 00m', items: 3, total: 155.00, method: 'Transferencia' },
];

export function getProductStatus(stock: number) {
  if (stock <= 0) {
    return 'Out of Stock' as const;
  }

  if (stock <= 4) {
    return 'Low Stock' as const;
  }

  return 'In Stock' as const;
}
