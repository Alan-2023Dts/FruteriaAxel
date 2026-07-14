import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Check,
  Plus,
  Minus,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useFruteria } from '../stores/FruteriaProvider';

interface ProductCount {
  id: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  newCount: number | '';
  image: string;
}

export const QuantityRegister = () => {
  const navigate = useNavigate();
  const { products: contextProducts, updateProductStock } = useFruteria();
  const [search, setSearch] = useState('');
  
  const [products, setProducts] = useState<ProductCount[]>(() =>
    contextProducts.map(p => ({
      id: String(p.id),
      name: p.name,
      category: p.category,
      unit: p.unit,
      currentStock: p.stock,
      newCount: '',
      image: p.image,
    }))
  );

  const [saving, setSaving] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const updatedCount = products.filter(p => p.newCount !== '').length;

  const setCount = (id: string, value: number | '') => {
    setProducts(prev =>
      prev.map(p => p.id === id ? { ...p, newCount: value } : p)
    );
  };

  const adjust = (id: string, delta: number) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const base = p.newCount !== '' ? Number(p.newCount) : p.currentStock;
        return { ...p, newCount: Math.max(0, base + delta) };
      })
    );
  };

  const handleSaveAll = () => {
    if (updatedCount === 0) {
      toast.error('No hay cantidades nuevas para guardar');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      // Save changes to global store
      products.forEach(p => {
        if (p.newCount !== '') {
          updateProductStock(Number(p.id), Number(p.newCount));
        }
      });

      const ids = new Set(products.filter(p => p.newCount !== '').map(p => p.id));
      setSavedIds(ids);
      setProducts(prev =>
        prev.map(p =>
          p.newCount !== '' ? { ...p, currentStock: Number(p.newCount), newCount: '' } : p
        )
      );
      setSaving(false);
      toast.success(`${updatedCount} producto${updatedCount > 1 ? 's' : ''} actualizado${updatedCount > 1 ? 's' : ''} correctamente`);
    }, 1400);
  };

  return (
    <div className="flex flex-col h-full bg-[#F8F9FE]">
      {/* Header */}
      <div className="bg-[#001540] text-white px-4 py-5 flex items-center gap-3 shrink-0">
        <button
          onClick={() => navigate('/employee')}
          className="p-1.5 hover:bg-white/10 rounded-full transition-colors active:scale-95"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold tracking-tight">Registro de Cantidades</h1>
          <p className="text-white/50 text-xs">Conteo físico de inventario</p>
        </div>
        {updatedCount > 0 && (
          <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {updatedCount} editado{updatedCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Buscador */}
      <div className="px-4 pt-4 pb-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar producto o categoría..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-[18px] py-3.5 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#001540]/10 transition-all text-sm font-medium"
          />
        </div>
      </div>

      {/* Instrucción */}
      <div className="px-4 pb-2 shrink-0">
        <p className="text-xs text-gray-400 ml-1">
          Ingresa la cantidad física contada. Pulsa <strong>+</strong> / <strong>−</strong> o escribe directamente.
        </p>
      </div>

      {/* Lista de productos */}
      <div className="flex-1 overflow-y-auto px-4 pb-32">
        <div className="space-y-3 pt-1">
          <AnimatePresence>
            {filtered.map((product, i) => {
              const hasEdit = product.newCount !== '';
              const displayVal = hasEdit ? Number(product.newCount) : product.currentStock;
              const wasSaved = savedIds.has(product.id);

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`bg-white rounded-[22px] p-4 shadow-sm border transition-all ${
                    hasEdit ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {/* Foto */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-[#1A1C1E] text-sm truncate">{product.name}</p>
                        {wasSaved && !hasEdit && (
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{product.category}</p>
                    </div>

                    {/* Stock actual */}
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Actual</p>
                      <p className="font-black text-sm text-[#1A1C1E]">
                        {product.currentStock} {product.unit}
                      </p>
                    </div>
                  </div>

                  {/* Control de cantidad */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => adjust(product.id, -1)}
                      className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center active:scale-90 transition-transform shrink-0"
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>

                    <div className="flex-1 relative">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder={`${product.currentStock}`}
                        value={product.newCount}
                        onChange={e => {
                          const v = e.target.value;
                          setCount(product.id, v === '' ? '' : Math.max(0, Number(v)));
                        }}
                        className={`w-full text-center rounded-[14px] py-2.5 border text-sm font-black focus:outline-none focus:ring-2 transition-all ${
                          hasEdit
                            ? 'bg-blue-50 border-blue-200 text-blue-700 focus:ring-blue-200'
                            : 'bg-gray-50 border-gray-100 text-gray-500 focus:ring-[#001540]/10'
                        }`}
                      />
                      {hasEdit && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-400">
                          {product.unit}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => adjust(product.id, 1)}
                      className="w-10 h-10 bg-[#001540] rounded-xl flex items-center justify-center active:scale-90 transition-transform shrink-0"
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  {/* Diferencia */}
                  {hasEdit && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 flex items-center gap-1.5 px-1"
                    >
                      <span className="text-[11px] text-gray-400">Diferencia:</span>
                      <span className={`text-[11px] font-black ${
                        Number(product.newCount) > product.currentStock
                          ? 'text-green-600'
                          : Number(product.newCount) < product.currentStock
                          ? 'text-red-500'
                          : 'text-gray-400'
                      }`}>
                        {Number(product.newCount) >= product.currentStock ? '+' : ''}
                        {(Number(product.newCount) - product.currentStock).toFixed(1)} {product.unit}
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-400 font-medium">No se encontraron productos</p>
            </div>
          )}
        </div>
      </div>

      {/* Botón guardar fijo */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-gradient-to-t from-[#F8F9FE] via-[#F8F9FE]/90 to-transparent">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSaveAll}
          disabled={saving || updatedCount === 0}
          className={`w-full py-4 rounded-[22px] font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg ${
            updatedCount > 0 && !saving
              ? 'bg-[#001540] text-white shadow-[#001540]/20'
              : 'bg-gray-200 text-gray-400'
          }`}
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Check className="w-5 h-5" />
              {updatedCount > 0
                ? `Guardar ${updatedCount} cambio${updatedCount > 1 ? 's' : ''}`
                : 'Sin cambios por guardar'}
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};
