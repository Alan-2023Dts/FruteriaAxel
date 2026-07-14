import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Check,
  ChevronRight,
  Scale,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useFruteria } from '../stores/FruteriaProvider';

interface PriceEntry {
  id: number;
  name: string;
  category: string;
  unit: string;
  image: string;
  currentPrice: number;
  newPrice: string;
}

export const WeightRegister = () => {
  const navigate = useNavigate();
  const { products, updateProductPrice } = useFruteria();
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const [entries, setEntries] = useState<PriceEntry[]>(() =>
    products.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      unit: p.unit,
      image: p.image,
      currentPrice: p.price,
      newPrice: '',
    }))
  );

  const [selected, setSelected] = useState<PriceEntry | null>(null);
  const [draftPrice, setDraftPrice] = useState('');
  const [draftWeight, setDraftWeight] = useState('');

  const filtered = entries.filter(
    e =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase())
  );

  const editedCount = entries.filter(e => e.newPrice !== '').length;

  const openSheet = (entry: PriceEntry) => {
    setSelected(entry);
    setDraftPrice(entry.newPrice !== '' ? entry.newPrice : String(entry.currentPrice));
    setDraftWeight('1');
  };

  const closeSheet = () => {
    setSelected(null);
    setDraftPrice('');
    setDraftWeight('');
  };

  const applyPrice = () => {
    if (!selected) return;
    const price = parseFloat(draftPrice);
    if (isNaN(price) || price < 0) {
      toast.error('El precio no puede ser negativo');
      return;
    }
    setEntries(prev =>
      prev.map(e =>
        e.id === selected.id ? { ...e, newPrice: draftPrice } : e
      )
    );
    toast.success(`Precio de "${selected.name}" actualizado`);
    closeSheet();
  };

  const handleSaveAll = () => {
    if (editedCount === 0) {
      toast.error('No hay precios nuevos para guardar');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      // Save changes to the global store
      entries.forEach(e => {
        if (e.newPrice !== '') {
          updateProductPrice(e.id, parseFloat(e.newPrice));
        }
      });

      setEntries(prev =>
        prev.map(e =>
          e.newPrice !== ''
            ? { ...e, currentPrice: parseFloat(e.newPrice), newPrice: '' }
            : e
        )
      );
      setSaving(false);
      toast.success(`${editedCount} precio${editedCount > 1 ? 's' : ''} actualizado${editedCount > 1 ? 's' : ''} correctamente`);
    }, 1400);
  };

  /* Precio calculado para la vista previa */
  const previewTotal =
    selected && draftPrice !== '' && draftWeight !== ''
      ? parseFloat(draftPrice) * parseFloat(draftWeight)
      : null;

  return (
    <div className="flex flex-col h-full bg-[#F8F9FE] relative">
      {/* Header */}
      <div className="bg-[#001540] text-white px-4 py-5 flex items-center gap-3 shrink-0">
        <button
          onClick={() => navigate('/sales')}
          className="p-1.5 hover:bg-white/10 rounded-full transition-colors active:scale-95"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold tracking-tight">Registro de Pesaje</h1>
          <p className="text-white/50 text-xs">Actualiza precios por kilogramo</p>
        </div>
        {editedCount > 0 && (
          <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {editedCount} editado{editedCount > 1 ? 's' : ''}
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
            className="w-full bg-white border border-gray-100 rounded-[18px] py-3.5 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#001540]/10 text-sm font-medium"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto px-4 pb-32 pt-1">
        <div className="space-y-3">
          {filtered.map((entry, i) => {
            const hasEdit = entry.newPrice !== '';
            const displayPrice = hasEdit ? parseFloat(entry.newPrice) : entry.currentPrice;

            return (
              <motion.button
                key={entry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => openSheet(entry)}
                className={`w-full bg-white rounded-[20px] p-4 flex items-center gap-3 shadow-sm border text-left active:scale-[0.98] transition-transform ${
                  hasEdit ? 'border-purple-200 ring-1 ring-purple-100' : 'border-gray-100'
                }`}
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                  <img src={entry.image} alt={entry.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1A1C1E] text-sm truncate">{entry.name}</p>
                  <p className="text-xs text-gray-400">{entry.category}</p>
                </div>

                <div className="text-right shrink-0 mr-1">
                  <p className={`font-black text-base ${hasEdit ? 'text-purple-600' : 'text-[#1A1C1E]'}`}>
                    ${displayPrice.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-gray-400">/{entry.unit}</p>
                  {hasEdit && (
                    <p className="text-[10px] text-gray-400 line-through">
                      ${entry.currentPrice.toFixed(2)}
                    </p>
                  )}
                </div>

                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Botón guardar */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-gradient-to-t from-[#F8F9FE] via-[#F8F9FE]/90 to-transparent">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSaveAll}
          disabled={saving || editedCount === 0}
          className={`w-full py-4 rounded-[22px] font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg ${
            editedCount > 0 && !saving
              ? 'bg-[#001540] text-white shadow-[#001540]/20'
              : 'bg-gray-200 text-gray-400'
          }`}
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Check className="w-5 h-5" />
              {editedCount > 0
                ? `Guardar ${editedCount} cambio${editedCount > 1 ? 's' : ''}`
                : 'Sin cambios por guardar'}
            </>
          )}
        </motion.button>
      </div>

      {/* Bottom sheet — editar precio */}
      <AnimatePresence>
        {selected && (
          <div className="absolute inset-0 z-50 flex items-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSheet}
              className="absolute inset-0 bg-[#001540]/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full bg-white rounded-t-[32px] p-6 shadow-2xl"
            >
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

              {/* Producto */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-50 shrink-0">
                  <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1A1C1E]">{selected.name}</h3>
                  <p className="text-xs text-gray-400">
                    Precio actual:{' '}
                    <span className="font-black text-[#1A1C1E]">
                      ${selected.currentPrice.toFixed(2)}/{selected.unit}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-4">
                {/* Nuevo precio */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">
                    Nuevo precio por {selected.unit} ($)
                  </label>
                  <div className="relative">
                    <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder={String(selected.currentPrice)}
                      value={draftPrice}
                      onChange={e => {
                        const v = e.target.value;
                        if (v === '' || parseFloat(v) >= 0) setDraftPrice(v);
                      }}
                      className="w-full bg-[#F8F9FE] border border-gray-100 rounded-[18px] py-3.5 pl-12 pr-4 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#001540]/10 transition-all"
                    />
                  </div>
                </div>

                {/* Peso de prueba */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">
                    Peso de referencia ({selected.unit}) — para cálculo
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    placeholder="1"
                    value={draftWeight}
                    onChange={e => {
                      const v = e.target.value;
                      if (v === '' || parseFloat(v) >= 0) setDraftWeight(v);
                    }}
                    className="w-full bg-[#F8F9FE] border border-gray-100 rounded-[18px] py-3.5 px-4 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#001540]/10 transition-all"
                  />
                </div>
              </div>

              {/* Vista previa del costo */}
              {previewTotal !== null && !isNaN(previewTotal) && parseFloat(draftWeight) > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-5 bg-purple-50 border border-purple-100 rounded-[16px] px-4 py-3 flex items-center justify-between"
                >
                  <p className="text-sm text-purple-600 font-medium">
                    {draftWeight} {selected.unit} × ${parseFloat(draftPrice || '0').toFixed(2)}
                  </p>
                  <p className="text-lg font-black text-purple-700">${previewTotal.toFixed(2)}</p>
                </motion.div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={closeSheet}
                  className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-[20px] font-bold text-sm active:scale-95 transition-transform"
                >
                  Cancelar
                </button>
                <button
                  onClick={applyPrice}
                  className="flex-1 py-4 bg-[#001540] text-white rounded-[20px] font-bold text-sm shadow-lg shadow-[#001540]/20 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <Check className="w-4 h-4" />
                  Aplicar precio
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
