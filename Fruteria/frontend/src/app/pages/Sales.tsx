import React, { useState } from 'react';
import {
  ShoppingBasket,
  Scale,
  Scissors,
  ChevronRight,
  CheckCircle2,
  Search,
  Plus,
  Minus,
  Filter,
  Banknote,
  CreditCard,
  Smartphone,
  Trash2,
  ArrowLeft,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { CATEGORIES } from '../services/catalog';
import { useFruteria } from '../stores/FruteriaProvider';
import type { PaymentMethod, SaleCartItem, Product } from '../types/fruteria';

type CatalogStep = 'catalog' | 'checkout' | 'success';

/* ─── Vista catálogo + checkout ───────────────────────────────────── */
function CatalogView({ onBack }: { onBack: () => void }) {
  const { products, registerSale } = useFruteria();
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [search, setSearch] = useState('');
  const [step, setStep] = useState<CatalogStep>('catalog');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [cashGiven, setCashGiven] = useState('');
  const [processing, setProcessing] = useState(false);

  const [cart, setCart] = useState<SaleCartItem[]>([]);

  const filtered = products.filter(p =>
    (activeCategory === 'Todos' || p.category === activeCategory) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const [weighingProduct, setWeighingProduct] = useState<Product | null>(null);
  const [manualWeight, setManualWeight] = useState('');

  const closeWeighingModal = () => {
    setWeighingProduct(null);
    setManualWeight('');
  };

  const submitManualWeight = () => {
    if (!weighingProduct) return;
    const weight = parseFloat(manualWeight);
    if (isNaN(weight) || weight <= 0) {
      toast.error('Ingresa un peso válido');
      return;
    }
    if (weight > weighingProduct.stock) {
      toast.error(`Stock insuficiente (${weighingProduct.stock} kg disponibles)`);
      return;
    }

    setCart(prev => {
      const ex = prev.find(i => i.id === weighingProduct.id);
      if (ex) {
        return prev.map(i => i.id === weighingProduct.id ? { ...i, quantity: +weight.toFixed(3) } : i);
      } else {
        return [...prev, { id: weighingProduct.id, quantity: +weight.toFixed(3) }];
      }
    });

    toast.success(`Peso de "${weighingProduct.name}" registrado: ${weight} kg`);
    closeWeighingModal();
  };

  const addStandardToCart = (id: number, quantityToAdd: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const available = product.stock;
    const inCart = cart.find(i => i.id === id)?.quantity ?? 0;
    
    if (inCart + quantityToAdd > available) {
      toast.error('Stock insuficiente para agregar más unidades');
      return;
    }
    
    setCart(prev => {
      const ex = prev.find(i => i.id === id);
      return ex
        ? prev.map(i => i.id === id ? { ...i, quantity: +(i.quantity + quantityToAdd).toFixed(2) } : i)
        : [...prev, { id, quantity: quantityToAdd }];
    });
  };

  const handleProductClick = (product: Product) => {
    if (product.unit.toLowerCase() === 'kg') {
      setWeighingProduct(product);
      const inCart = cart.find(c => c.id === product.id);
      setManualWeight(inCart ? String(inCart.quantity) : '');
    } else {
      addStandardToCart(product.id, 1);
    }
  };

  const addToCart = (id: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    if (product.unit.toLowerCase() === 'kg') {
      setWeighingProduct(product);
      const inCart = cart.find(c => c.id === product.id);
      setManualWeight(inCart ? String(inCart.quantity) : '');
    } else {
      addStandardToCart(id, 1);
    }
  };

  const decreaseCart = (id: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    if (product.unit.toLowerCase() === 'kg') {
      const inCart = cart.find(i => i.id === id);
      if (inCart && inCart.quantity <= 0.1) {
        removeFromCart(id);
      } else {
        setCart(prev =>
          prev.map(i => i.id === id ? { ...i, quantity: +(i.quantity - 0.1).toFixed(2) } : i)
        );
      }
    } else {
      setCart(prev =>
        prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i)
          .filter(i => i.quantity > 0)
      );
    }
  };

  const removeFromCart = (id: number) => setCart(prev => prev.filter(i => i.id !== id));

  const total = cart.reduce((acc, item) => {
    const p = products.find(product => product.id === item.id);
    return acc + (p?.price ?? 0) * item.quantity;
  }, 0);

  const cashGivenNum = parseFloat(cashGiven) || 0;
  const change = cashGivenNum - total;
  const cashValid = paymentMethod !== 'efectivo' || cashGivenNum >= total;

  const confirmSale = () => {
    if (!cashValid) {
      toast.error('El monto recibido es menor al total de la venta');
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      registerSale(cart, paymentMethod);
      setCart([]);
      setCashGiven('');
      setProcessing(false);
      setStep('success');
    }, 1200);
  };

  /* ── Pantalla de éxito ── */
  if (step === 'success') {
    return (
      <div className="flex flex-col h-full bg-[#F8F9FE] items-center justify-center px-8 text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 200 }}
          className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-14 h-14 text-green-500" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-2xl font-black text-[#1A1C1E] mb-2">¡Venta Completada!</h2>
          <p className="text-gray-400 text-sm mb-1">El stock fue actualizado correctamente.</p>
          <p className="text-gray-400 text-sm capitalize">Pago: {paymentMethod}</p>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          onClick={() => setStep('catalog')}
          className="mt-10 w-full bg-[#001540] text-white py-4 rounded-[22px] font-bold text-base shadow-lg shadow-[#001540]/20"
        >
          Nueva Venta
        </motion.button>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          onClick={onBack}
          className="mt-3 w-full py-3.5 text-gray-400 font-bold text-sm"
        >
          Volver al Panel
        </motion.button>
      </div>
    );
  }

  /* ── Pantalla de checkout ── */
  if (step === 'checkout') {
    const PAYMENT_OPTIONS: { key: PaymentMethod; label: string; icon: React.ElementType }[] = [
      { key: 'efectivo',      label: 'Efectivo',      icon: Banknote    },
      { key: 'tarjeta',       label: 'Tarjeta',       icon: CreditCard  },
      { key: 'transferencia', label: 'Transferencia', icon: Smartphone  },
    ];

    return (
      <div className="flex flex-col h-full bg-[#F8F9FE]">
        {/* Header */}
        <div className="bg-[#001540] text-white px-4 py-5 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setStep('catalog')}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Confirmar Venta</h1>
            <p className="text-white/50 text-xs">{cart.length} producto{cart.length !== 1 ? 's' : ''} en el carrito</p>
          </div>
          <button
            onClick={() => { setCart([]); setStep('catalog'); }}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-56 space-y-4">
          {/* Items del carrito */}
          <div className="bg-white rounded-[22px] border border-gray-100 shadow-sm overflow-hidden">
            {cart.map((item, i, arr) => {
              const p = products.find(product => product.id === item.id)!;
              const available = p.stock;
              const subtotal = p.price * item.quantity;
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 px-4 py-3.5 ${i !== arr.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                    <img src={p.image as string} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#1A1C1E] truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">${p.price.toFixed(2)}/{p.unit}</p>
                    {/* Controles cantidad */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        onClick={() => decreaseCart(item.id)}
                        className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center active:scale-90 transition-transform"
                      >
                        <Minus className="w-3 h-3 text-gray-600" />
                      </button>
                      <button
                        onClick={() => {
                          if (p.unit.toLowerCase() === 'kg') {
                            setWeighingProduct(p);
                            setManualWeight(String(item.quantity));
                          }
                        }}
                        className={`text-sm font-black text-[#1A1C1E] min-w-[36px] text-center rounded px-1.5 py-0.5 hover:bg-gray-100/80 active:scale-95 transition-all ${
                          p.unit.toLowerCase() === 'kg' ? 'cursor-pointer hover:text-[#002B7F]' : 'cursor-default'
                        }`}
                      >
                        {item.quantity} {p.unit}
                      </button>
                      <button
                        onClick={() => addToCart(item.id)}
                        disabled={item.quantity >= available}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center active:scale-90 transition-transform ${
                          item.quantity >= available ? 'bg-gray-50 text-gray-300' : 'bg-[#001540] text-white'
                        }`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-sm text-[#001540]">${subtotal.toFixed(2)}</p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="mt-1.5 p-1 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Método de pago */}
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1 mb-3">
              Método de Pago
            </p>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const active = paymentMethod === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => { setPaymentMethod(opt.key); setCashGiven(''); }}
                    className={`rounded-[18px] py-4 flex flex-col items-center gap-2 border transition-all active:scale-95 ${
                      active
                        ? 'bg-[#001540] border-[#001540] text-white shadow-lg shadow-[#001540]/20'
                        : 'bg-white border-gray-100 text-gray-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[11px] font-bold">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Campo efectivo */}
          <AnimatePresence>
            {paymentMethod === 'efectivo' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-4 space-y-3"
              >
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                    Monto Recibido ($)
                  </p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                    <input
                      type="number"
                      min={total}
                      step="1"
                      placeholder={total.toFixed(2)}
                      value={cashGiven}
                      onChange={e => setCashGiven(e.target.value)}
                      className="w-full bg-[#F8F9FE] border border-gray-100 rounded-[16px] py-3.5 pl-8 pr-4 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#001540]/10 transition-all"
                    />
                  </div>
                </div>
                {cashGivenNum > 0 && (
                  <div className={`flex justify-between items-center rounded-[14px] px-4 py-3 ${
                    change >= 0 ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <span className={`text-sm font-bold ${change >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                      {change >= 0 ? 'Cambio a devolver' : 'Falta'}
                    </span>
                    <span className={`text-lg font-black ${change >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                      ${Math.abs(change).toFixed(2)}
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer fijo: total + confirmar */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-gradient-to-t from-[#F8F9FE] via-[#F8F9FE]/95 to-transparent space-y-3">
          <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm px-5 py-3.5 flex justify-between items-center">
            <span className="text-sm text-gray-500 font-medium">Total a pagar</span>
            <span className="text-2xl font-black text-[#001540]">${total.toFixed(2)}</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={confirmSale}
            disabled={processing || !cashValid}
            className={`w-full py-4 rounded-[22px] font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg ${
              cashValid && !processing
                ? 'bg-[#001540] text-white shadow-[#001540]/20'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            {processing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Confirmar Venta · ${total.toFixed(2)}
              </>
            )}
          </motion.button>
        </div>
      </div>
    );
  }

  /* ── Catálogo de productos ── */
  return (
    <div className="flex flex-col h-full bg-[#F5F7FA] relative">
      {/* Header buscador */}
      <div className="bg-white px-6 pt-4 pb-6 rounded-b-[40px] shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="p-2 -ml-2">
            <ChevronRight className="w-6 h-6 text-[#1A1C1E] rotate-180" />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              className="w-full bg-[#F0F2F5] border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#002B7F]"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="bg-[#F0F2F5] p-3 rounded-2xl">
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto -mx-6 px-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-[#002B7F] text-white shadow-lg shadow-blue-900/20'
                  : 'bg-white text-gray-500 border border-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de productos */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-40">
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((product, i) => {
            const available = product.stock;
            const inCart = cart.find(c => c.id === product.id)?.quantity ?? 0;
            const isOut = available === 0;
            const isLow = available > 0 && available <= 4;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => !isOut && handleProductClick(product)}
                className={`bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 flex flex-col transition-transform ${
                  isOut ? 'opacity-50' : 'active:scale-[0.98]'
                }`}
              >
                <div className="h-32 w-full relative overflow-hidden bg-gray-50">
                  <img src={product.image as string} alt={product.name} className="w-full h-full object-cover" />
                  {/* Badge categoría */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-[#002B7F]">
                    {product.category}
                  </div>
                  {/* Badge stock */}
                  {isOut ? (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase">Agotado</span>
                    </div>
                  ) : isLow ? (
                    <div className="absolute top-3 right-3 bg-amber-400 text-white text-[10px] font-black px-2 py-1 rounded-lg">
                      ¡Últimas!
                    </div>
                  ) : null}
                  {/* En carrito */}
                  {inCart > 0 && (
                    <div className="absolute bottom-2 right-2 bg-[#002B7F] text-white text-[10px] font-black px-2 py-1 rounded-full">
                      {inCart} {product.unit}
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-[15px] font-bold text-[#1A1C1E] mb-0.5 line-clamp-1">{product.name}</h3>
                  <p className="text-[10px] text-gray-400 mb-auto">
                    Stock: {available} {product.unit}
                  </p>
                  <div className="flex items-end justify-between mt-2">
                    <div>
                      <span className="text-lg font-black text-[#002B7F]">${product.price.toFixed(2)}</span>
                      <span className="text-[10px] text-gray-400 ml-1">/{product.unit}</span>
                    </div>
                    <div className={`p-1.5 rounded-xl ${isOut ? 'bg-gray-100' : 'bg-[#E9EDFF]'}`}>
                      <Plus className={`w-4 h-4 ${isOut ? 'text-gray-300' : 'text-[#002B7F]'}`} />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Barra de carrito flotante */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 200 }}
            animate={{ y: 0 }}
            exit={{ y: 200 }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.08)] px-6 pt-5 pb-8 z-30"
          >
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#E9EDFF] rounded-2xl flex items-center justify-center relative">
                  <ShoppingBasket className="w-5 h-5 text-[#002B7F]" />
                  <span className="absolute -top-1 -right-1 bg-[#D32F2F] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                    {cart.length}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Total a pagar</p>
                  <h2 className="text-2xl font-black text-[#1A1C1E]">${total.toFixed(2)}</h2>
                </div>
              </div>
              <button onClick={() => setCart([])} className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors">
                Limpiar
              </button>
            </div>
            <button
              onClick={() => setStep('checkout')}
              className="w-full bg-[#002B7F] text-white py-4 rounded-[22px] font-bold text-base flex items-center justify-center gap-3 shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-all"
            >
              Continuar al Pago
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal de Pesaje Manual ── */}
      <AnimatePresence>
        {weighingProduct && (
          <div className="absolute inset-0 z-50 flex items-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeWeighingModal}
              className="absolute inset-0 bg-[#001540]/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full bg-white rounded-t-[32px] p-6 shadow-2xl z-50"
            >
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                    <Scale className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1A1C1E]">
                      Pesaje de Producto
                    </h3>
                    <p className="text-xs text-gray-400">
                      {weighingProduct.name} · Precio: ${weighingProduct.price.toFixed(2)}/{weighingProduct.unit}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeWeighingModal}
                  className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">
                    Peso de Báscula (kg)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      min="0.005"
                      placeholder="0.000"
                      value={manualWeight}
                      onChange={e => setManualWeight(e.target.value)}
                      autoFocus
                      className="w-full bg-[#F8F9FE] border border-gray-100 rounded-[18px] py-4 px-4 font-bold text-2xl focus:outline-none focus:ring-2 focus:ring-[#001540]/10 transition-all text-center"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">kg</span>
                  </div>
                  {parseFloat(manualWeight) > weighingProduct.stock && (
                    <p className="text-xs text-red-500 font-bold ml-1 mt-1">
                      El peso ingresado excede el stock disponible ({weighingProduct.stock} kg)
                    </p>
                  )}
                </div>

                {/* Subtotal preview */}
                {parseFloat(manualWeight) > 0 && (
                  <div className="bg-purple-50/50 rounded-2xl p-4 flex justify-between items-center border border-purple-100/50">
                    <span className="text-sm text-purple-700 font-medium">Subtotal calculado</span>
                    <span className="text-xl font-black text-purple-700">
                      ${(weighingProduct.price * parseFloat(manualWeight)).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeWeighingModal}
                  className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-[20px] font-bold text-sm active:scale-95 transition-transform"
                >
                  Cancelar
                </button>
                <button
                  onClick={submitManualWeight}
                  disabled={!manualWeight || parseFloat(manualWeight) <= 0 || parseFloat(manualWeight) > weighingProduct.stock}
                  className={`flex-1 py-4 rounded-[20px] font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                    manualWeight && parseFloat(manualWeight) > 0 && parseFloat(manualWeight) <= weighingProduct.stock
                      ? 'bg-[#002B7F] text-white shadow-blue-900/20'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Agregar al Carrito
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Panel principal de Ventas ────────────────────────────────────── */
export const Sales = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'panel' | 'catalog'>('panel');
  const [showAllTickets, setShowAllTickets] = useState(false);
  const { tickets } = useFruteria();

  const visibleTickets = showAllTickets ? tickets : tickets.slice(0, 3);
  const currentSalesTotal = tickets.reduce((acc, t) => acc + t.total, 0);

  if (view === 'catalog') {
    return <CatalogView onBack={() => setView('panel')} />;
  }

  return (
    <div className="flex flex-col h-full bg-[#F8F9FE]">
      {/* Hero de caja */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-4 mt-4 bg-[#001540] rounded-[28px] px-6 pt-5 pb-7 relative overflow-hidden shrink-0"
      >
        <div className="absolute right-0 top-0 w-36 h-36 bg-white/5 rounded-full -mr-12 -mt-12" />
        <div className="absolute right-8 bottom-0 w-24 h-24 bg-white/5 rounded-full -mb-10" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-green-400 text-[10px] font-black uppercase tracking-widest">Caja Abierta</span>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <h2 className="text-4xl font-black text-white">${currentSalesTotal.toFixed(2)}</h2>
            <span className="text-white/50 text-sm font-bold">MXN</span>
          </div>
          <p className="text-white/40 text-xs font-medium">Venta Actual de Turno</p>
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto px-4 pb-8 pt-5 space-y-5">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <h1 className="text-[26px] font-bold text-[#1A1C1E] px-2">Panel de Ventas</h1>
        </motion.div>

        {/* Nueva Venta */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          onClick={() => setView('catalog')}
          className="w-full bg-white rounded-[22px] px-5 py-5 flex items-center gap-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform text-left"
        >
          <div className="w-14 h-14 bg-[#EDEEF5] rounded-2xl flex items-center justify-center shrink-0">
            <ShoppingBasket className="w-7 h-7 text-[#4B5FBF]" />
          </div>
          <div>
            <p className="text-xl font-bold text-[#1A1C1E]">Nueva Venta</p>
            <p className="text-sm text-gray-400">PLU / Nombre de producto</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 ml-auto shrink-0" />
        </motion.button>

        {/* Cuadrícula: Pesaje y Corte */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.16 }}
            onClick={() => navigate('/weight-register')}
            className="bg-white rounded-[22px] p-6 flex flex-col gap-4 shadow-sm border border-gray-100 active:scale-[0.97] transition-transform text-left"
          >
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
              <Scale className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="font-bold text-[#1A1C1E] text-sm leading-snug">Registro de Pesaje</p>
              <p className="text-xs text-gray-400 mt-1">Precios por kilo</p>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate('/cash-cut')}
            className="bg-white rounded-[22px] p-6 flex flex-col gap-4 shadow-sm border border-gray-100 active:scale-[0.97] transition-transform text-left"
          >
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
              <Scissors className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="font-bold text-[#1A1C1E] text-sm leading-snug">Corte de Caja</p>
              <p className="text-xs text-gray-400 mt-1">Cierre de turno</p>
            </div>
          </motion.button>
        </div>

        {/* Ventas Recientes */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-lg font-bold text-[#1A1C1E]">Ventas Recientes</h2>
            <button
              onClick={() => setShowAllTickets(v => !v)}
              className="text-sm font-semibold text-[#002B7F]"
            >
              {showAllTickets ? 'Ver menos' : 'Ver todo'}
            </button>
          </div>

          <div className="bg-white rounded-[22px] shadow-sm border border-gray-100 overflow-hidden">
            <AnimatePresence initial={false}>
              {visibleTickets.map((t, i, arr) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-4 px-5 py-4 ${i !== arr.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  <div className="w-10 h-10 bg-[#1A1C1E] rounded-xl flex items-center justify-center shrink-0">
                    <ShoppingBasket className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#1A1C1E]">Ticket {t.id}</p>
                    <p className="text-xs text-gray-400">
                      {t.ago} · {t.items} {t.items === 1 ? 'Artículo' : 'Artículos'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm text-[#1A1C1E]">${t.total.toFixed(2)}</p>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      <span className="text-[11px] font-bold text-green-500">Completado</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {showAllTickets && (
              <div className="px-5 py-3 border-t border-gray-50 text-center">
                <p className="text-xs text-gray-400 font-medium">{tickets.length} ventas en este turno</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
