import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { INITIAL_PRODUCTS, INITIAL_TICKETS } from '../services/catalog';
import { readJsonStorage, writeJsonStorage } from '../utils/storage';
import type { PaymentMethod, Product, SaleCartItem, TicketSummary } from '../types/fruteria';
import { supabase } from '../services/supabase';

type FruteriaContextValue = {
  products: Product[];
  tickets: TicketSummary[];
  registerSale: (items: SaleCartItem[], paymentMethod: PaymentMethod) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  deleteProduct: (id: number) => void;
  updateProductPrice: (id: number, price: number) => void;
  updateProductStock: (id: number, stock: number) => void;
  updateProductDates: (id: number, entryDate: string, expiryDate: string) => void;
};

const STORAGE_KEYS = {
  products: 'fruteria.products.v1',
  tickets: 'fruteria.tickets.v1',
} as const;

const FruteriaContext = createContext<FruteriaContextValue | null>(null);

function paymentLabel(paymentMethod: PaymentMethod) {
  if (paymentMethod === 'efectivo') return 'Efectivo';
  if (paymentMethod === 'tarjeta') return 'Tarjeta';
  return 'Transferencia';
}

export function FruteriaProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() =>
    readJsonStorage(STORAGE_KEYS.products, INITIAL_PRODUCTS)
  );
  const [tickets, setTickets] = useState<TicketSummary[]>(() =>
    readJsonStorage(STORAGE_KEYS.tickets, INITIAL_TICKETS)
  );

  // Sync to local storage as safety fallback
  useEffect(() => {
    writeJsonStorage(STORAGE_KEYS.products, products);
  }, [products]);

  useEffect(() => {
    writeJsonStorage(STORAGE_KEYS.tickets, tickets);
  }, [tickets]);

  // Load initial data from Supabase on mount
  useEffect(() => {
    async function loadFromSupabase() {
      try {
        const { data: dbProducts, error: pError } = await supabase
          .from('products')
          .select('*')
          .order('id', { ascending: true });

        if (pError) throw pError;
        if (dbProducts && dbProducts.length > 0) {
          setProducts(dbProducts);
        }
      } catch (err) {
        console.warn('Could not load products from Supabase, using local fallback:', err);
      }

      try {
        const { data: dbTickets, error: tError } = await supabase
          .from('tickets')
          .select('*')
          .order('id', { ascending: false });

        if (tError) throw tError;
        if (dbTickets && dbTickets.length > 0) {
          setTickets(dbTickets);
        }
      } catch (err) {
        console.warn('Could not load tickets from Supabase, using local fallback:', err);
      }
    }
    
    // Only fetch if Supabase client is properly configured
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      loadFromSupabase();
    }
  }, []);

  const registerSale = async (items: SaleCartItem[], paymentMethod: PaymentMethod) => {
    if (items.length === 0) {
      return;
    }

    const saleTotal = items.reduce((accumulator, item) => {
      const product = products.find(current => current.id === item.id);
      return accumulator + (product?.price ?? 0) * item.quantity;
    }, 0);

    const saleItems = items.reduce((accumulator, item) => accumulator + item.quantity, 0);

    const updatedProducts = products.map(product => {
      const cartItem = items.find(item => item.id === product.id);
      if (!cartItem) {
        return product;
      }
      return {
        ...product,
        stock: Math.max(0, product.stock - cartItem.quantity),
      };
    });

    setProducts(updatedProducts);

    // Sync stock updates to Supabase
    for (const item of items) {
      const prod = updatedProducts.find(p => p.id === item.id);
      if (prod) {
        supabase
          .from('products')
          .update({ stock: prod.stock })
          .eq('id', prod.id)
          .then(({ error }) => {
            if (error) console.error('Error updating stock in Supabase:', error);
          });
      }
    }

    const nextTicketNumber = tickets.length > 0
      ? Number(tickets[0].id.replace('#', '')) + 1
      : 4522;

    const newTicket: TicketSummary = {
      id: `#${nextTicketNumber}`,
      ago: 'Hace unos momentos',
      items: saleItems,
      total: saleTotal,
      method: paymentLabel(paymentMethod),
    };

    setTickets(currentTickets => [newTicket, ...currentTickets]);

    // Insert ticket into Supabase
    supabase
      .from('tickets')
      .insert([newTicket])
      .then(({ error }) => {
        if (error) console.error('Error inserting ticket to Supabase:', error);
      });
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    const nextId = products.reduce((maxId, p) => Math.max(maxId, p.id), 0) + 1;
    const newProduct: Product = {
      ...product,
      id: nextId,
    };

    setProducts(currentProducts => [...currentProducts, newProduct]);

    // Insert into Supabase
    supabase
      .from('products')
      .insert([newProduct])
      .then(({ error }) => {
        if (error) console.error('Error inserting product to Supabase:', error);
      });
  };

  const deleteProduct = async (id: number) => {
    setProducts(currentProducts => currentProducts.filter(p => p.id !== id));

    // Delete from Supabase
    supabase
      .from('products')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.error('Error deleting product from Supabase:', error);
      });
  };

  const updateProductPrice = async (id: number, price: number) => {
    setProducts(currentProducts =>
      currentProducts.map(p => (p.id === id ? { ...p, price } : p))
    );

    // Update in Supabase
    supabase
      .from('products')
      .update({ price })
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.error('Error updating price in Supabase:', error);
      });
  };

  const updateProductStock = async (id: number, stock: number) => {
    setProducts(currentProducts =>
      currentProducts.map(p => (p.id === id ? { ...p, stock } : p))
    );

    // Update in Supabase
    supabase
      .from('products')
      .update({ stock })
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.error('Error updating stock in Supabase:', error);
      });
  };

  const updateProductDates = async (id: number, entryDate: string, expiryDate: string) => {
    setProducts(currentProducts =>
      currentProducts.map(p => (p.id === id ? { ...p, entryDate, expiryDate } : p))
    );

    // Update in Supabase
    supabase
      .from('products')
      .update({ entryDate, expiryDate })
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.error('Error updating dates in Supabase:', error);
      });
  };

  const value = useMemo(
    () => ({
      products,
      tickets,
      registerSale,
      addProduct,
      deleteProduct,
      updateProductPrice,
      updateProductStock,
      updateProductDates,
    }),
    [products, tickets]
  );

  return <FruteriaContext.Provider value={value}>{children}</FruteriaContext.Provider>;
}

export function useFruteria() {
  const context = useContext(FruteriaContext);

  if (!context) {
    throw new Error('useFruteria must be used within a FruteriaProvider');
  }

  return context;
}
