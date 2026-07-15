import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  X,
  Check,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

type StockStatus = 'ok' | 'proximo' | 'vencido';

interface ProductDate {
  id: string;
  name: string;
  category: string;
  unit: string;
  image: string;
  entryDate: string;
  expiryDate: string;
}

function getStatus(expiryDate: string): StockStatus {
  if (!expiryDate) return 'ok';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  const diffDays = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'vencido';
  if (diffDays <= 3) return 'proximo';
  return 'ok';
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(dateStr);
  return Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

const TODAY = new Date().toISOString().split('T')[0];

function offsetDate(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

import { useFruteria } from '../stores/FruteriaProvider';

const STATUS_CONFIG = {
  ok:      { label: 'Vigente',   bg: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-100', dot: 'bg-green-500',  icon: CheckCircle2 },
  proximo: { label: 'Por vencer',bg: 'bg-amber-50',  text: 'text-amber-600',  border: 'border-amber-100', dot: 'bg-amber-500',  icon: Clock },
  vencido: { label: 'Vencido',   bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-100',   dot: 'bg-red-500',    icon: AlertTriangle },
};

type FilterKey = 'Todos' | 'Vigente' | 'Por vencer' | 'Vencido';
const FILTERS: FilterKey[] = ['Todos', 'Vigente', 'Por vencer', 'Vencido'];

export const DateControl = () => {
  const navigate = useNavigate();
  const { products: contextProducts, updateProductDates } = useFruteria();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('Todos');

  // Fallback initial dates logic if missing in global store
  const getInitialEntryDate = (name: string, index: number) => {
    if (name.includes('Plátano')) return offsetDate(-5);
    if (name.includes('Naranja')) return offsetDate(-1);
    if (name.includes('Brócoli')) return offsetDate(-2);
    if (name.includes('Aguacate')) return offsetDate(-1);
    if (name.includes('Fresa')) return TODAY;
    if (name.includes('Jitomate')) return offsetDate(-4);
    if (name.includes('Limón')) return offsetDate(-6);
    return offsetDate(-3);
  };

  const getInitialExpiryDate = (name: string, index: number) => {
    if (name.includes('Plátano')) return offsetDate(2);
    if (name.includes('Naranja')) return offsetDate(14);
    if (name.includes('Brócoli')) return offsetDate(-1);
    if (name.includes('Aguacate')) return offsetDate(3);
    if (name.includes('Fresa')) return offsetDate(4);
    if (name.includes('Jitomate')) return offsetDate(-2);
    if (name.includes('Limón')) return offsetDate(20);
    return offsetDate(11);
  };

  const [products, setProducts] = useState<ProductDate[]>(() =>
    contextProducts.map((p, idx) => ({
      id: String(p.id),
      name: p.name,
      category: p.category,
      unit: p.unit,
      image: p.image,
      entryDate: p.entryDate || getInitialEntryDate(p.name, idx),
      expiryDate: p.expiryDate || getInitialExpiryDate(p.name, idx),
    }))
  );

  const [editing, setEditing] = useState<ProductDate | null>(null);
  const [draft, setDraft] = useState({ entryDate: '', expiryDate: '' });
  const [saving, setSaving] = useState(false);

  const filtered = products.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === 'Todos') return true;
    const s = getStatus(p.expiryDate);
    return (
      (filter === 'Vigente'    && s === 'ok') ||
      (filter === 'Por vencer' && s === 'proximo') ||
      (filter === 'Vencido'    && s === 'vencido')
    );
  });

  const counts = {
    vencido: products.filter(p => getStatus(p.expiryDate) === 'vencido').length,
    proximo: products.filter(p => getStatus(p.expiryDate) === 'proximo').length,
  };

  const openEdit = (p: ProductDate) => {
    setEditing(p);
    setDraft({ entryDate: p.entryDate, expiryDate: p.expiryDate });
  };

  const handleSave = () => {
    if (!editing) return;
    if (!draft.entryDate || !draft.expiryDate) {
      toast.error('Completa ambas fechas antes de guardar');
      return;
    }
    if (new Date(draft.expiryDate) <= new Date(draft.entryDate)) {
      toast.error('La fecha de vencimiento debe ser posterior al ingreso');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      // Save globally
      updateProductDates(Number(editing.id), draft.entryDate, draft.expiryDate);

      setProducts(prev =>
        prev.map(p =>
          p.id === editing.id
            ? { ...p, entryDate: draft.entryDate, expiryDate: draft.expiryDate }
            : p
        )
      );
      setSaving(false);
      setEditing(null);
      toast.success(`Fechas de "${editing.name}" actualizadas`);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-[#F8F9FE] relative">
      {/* Header */}
      <div className="bg-[#001540] text-white px-4 py-5 flex items-center gap-3 shrink-0">
        <button
          onClick={() => navigate('/employee')}
          className="p-1.5 hover:bg-white/10 rounded-full transition-colors active:scale-95"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold tracking-tight">Control de Fechas</h1>
          <p className="text-white/50 text-xs">Inventario y caducidad</p>
        </div>
        {(counts.vencido > 0 || counts.proximo > 0) && (
          <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {counts.vencido + counts.proximo} alerta{counts.vencido + counts.proximo > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Resumen de alertas */}
      {(counts.vencido > 0 || counts.proximo > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-4 bg-red-50 border border-red-100 rounded-[18px] px-4 py-3 flex items-center gap-3 shrink-0"
        >
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            {counts.vencido > 0 && <span className="font-black">{counts.vencido} vencido{counts.vencido > 1 ? 's' : ''}</span>}
            {counts.vencido > 0 && counts.proximo > 0 && ' · '}
            {counts.proximo > 0 && <span className="font-black">{counts.proximo} próximo{counts.proximo > 1 ? 's' : ''} a vencer</span>}
            {' '}— requieren atención inmediata.
          </p>
        </motion.div>
      )}

      {/* Buscador */}
      <div className="px-4 pt-4 shrink-0">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-[18px] py-3.5 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#001540]/10 transition-all text-sm font-medium"
          />
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 px-4 pt-3 pb-1 shrink-0">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${
              filter === f
                ? 'bg-[#001540] text-white'
                : 'bg-white text-gray-500 border border-gray-100'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto px-4 pb-8 pt-2">
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((product, i) => {
              const status = getStatus(product.expiryDate);
              const cfg = STATUS_CONFIG[status];
              const StatusIcon = cfg.icon;
              const days = daysUntil(product.expiryDate);

              return (
                <motion.button
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => openEdit(product)}
                  className={`w-full bg-white rounded-[22px] p-4 shadow-sm border text-left active:scale-[0.98] transition-transform ${
                    status !== 'ok' ? cfg.border : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Foto */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-[#1A1C1E] text-sm truncate">{product.name}</p>
                        <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${cfg.bg} ${cfg.text}`}>
                          <StatusIcon className="w-2.5 h-2.5" />
                          {cfg.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Ingreso</p>
                          <p className="text-xs font-bold text-[#1A1C1E]">{formatDate(product.entryDate)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Vencimiento</p>
                          <p className={`text-xs font-bold ${status !== 'ok' ? cfg.text : 'text-[#1A1C1E]'}`}>
                            {formatDate(product.expiryDate)}
                            {days !== null && (
                              <span className="font-medium ml-1">
                                {days < 0 ? `(hace ${Math.abs(days)}d)` : days === 0 ? '(hoy)' : `(en ${days}d)`}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-400 font-medium">Sin productos en esta categoría</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de edición */}
      <AnimatePresence>
        {editing && (
          <div className="absolute inset-0 z-50 flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditing(null)}
              className="absolute inset-0 bg-[#001540]/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full bg-white rounded-t-[32px] p-6 shadow-2xl"
            >
              {/* Handle */}
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

              {/* Título */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-[#1A1C1E]">Editar Fechas</h3>
                  <p className="text-sm text-gray-400">{editing.name}</p>
                </div>
                <button
                  onClick={() => setEditing(null)}
                  className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {/* Fecha de ingreso */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">
                    Fecha de Ingreso
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={draft.entryDate}
                      max={TODAY}
                      onChange={e => setDraft(d => ({ ...d, entryDate: e.target.value }))}
                      className="w-full bg-[#F8F9FE] border border-gray-100 rounded-[18px] py-3.5 pl-12 pr-4 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#001540]/10 transition-all"
                    />
                  </div>
                </div>

                {/* Fecha de vencimiento */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">
                    Fecha de Vencimiento
                  </label>
                  <div className="relative">
                    <AlertTriangle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={draft.expiryDate}
                      min={draft.entryDate || TODAY}
                      onChange={e => setDraft(d => ({ ...d, expiryDate: e.target.value }))}
                      className="w-full bg-[#F8F9FE] border border-gray-100 rounded-[18px] py-3.5 pl-12 pr-4 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#001540]/10 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Vista previa del estado */}
              {draft.expiryDate && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`mb-4 px-4 py-3 rounded-[16px] flex items-center gap-2 ${
                    STATUS_CONFIG[getStatus(draft.expiryDate)].bg
                  } border ${STATUS_CONFIG[getStatus(draft.expiryDate)].border}`}
                >
                  <div className={`w-2 h-2 rounded-full ${STATUS_CONFIG[getStatus(draft.expiryDate)].dot}`} />
                  <p className={`text-xs font-bold ${STATUS_CONFIG[getStatus(draft.expiryDate)].text}`}>
                    Estado resultante: {STATUS_CONFIG[getStatus(draft.expiryDate)].label}
                    {daysUntil(draft.expiryDate) !== null && daysUntil(draft.expiryDate)! >= 0
                      ? ` · vence en ${daysUntil(draft.expiryDate)} día${daysUntil(draft.expiryDate) !== 1 ? 's' : ''}`
                      : daysUntil(draft.expiryDate) !== null
                      ? ` · venció hace ${Math.abs(daysUntil(draft.expiryDate)!)} día${Math.abs(daysUntil(draft.expiryDate)!) !== 1 ? 's' : ''}`
                      : ''}
                  </p>
                </motion.div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setEditing(null)}
                  className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-[20px] font-bold text-sm active:scale-95 transition-transform"
                >
                  Cancelar
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-4 bg-[#001540] text-white rounded-[20px] font-bold text-sm shadow-lg shadow-[#001540]/20 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Guardar
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
