import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Plus,
  Minus,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Check,
  X,
  FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

/* ─── Tipos ──────────────────────────────────────────────────────── */
type TxType = 'venta' | 'entrada' | 'retiro';

interface Transaction {
  id: string;
  type: TxType;
  title: string;
  time: string;
  note: string;
  amount: number;
}

import { useFruteria } from '../stores/FruteriaProvider';

/* ─── Datos iniciales simulados ──────────────────────────────────── */
const STARTING_BALANCE = 500.00;

const INITIAL_ADJUSTMENTS: Transaction[] = [
  { id: 't3', type: 'retiro',  title: 'Retiro Manual', time: '08:30 AM', note: 'Cambio para repartidor', amount: -50.00 },
  { id: 't2', type: 'entrada', title: 'Entrada Manual', time: '08:05 AM', note: 'Reposición de fondo inicial', amount: 100.00 },
];

/* ─── Utilidades ─────────────────────────────────────────────────── */
const TX_CONFIG: Record<TxType, { icon: React.ElementType; iconBg: string; iconColor: string; sign: string; amountColor: string }> = {
  venta:   { icon: ShoppingCart,  iconBg: 'bg-gray-100',  iconColor: 'text-gray-500', sign: '+', amountColor: 'text-green-600' },
  entrada: { icon: ArrowUpRight,  iconBg: 'bg-blue-50',   iconColor: 'text-blue-500', sign: '+', amountColor: 'text-blue-600'  },
  retiro:  { icon: ArrowDownLeft, iconBg: 'bg-red-50',    iconColor: 'text-red-500',  sign: '-', amountColor: 'text-red-500'   },
};

type ModalType = 'entrada' | 'retiro' | null;

/* ─── Componente principal ───────────────────────────────────────── */
export const CashDrawer = () => {
  const navigate = useNavigate();
  const { tickets } = useFruteria();
  const [adjustments, setAdjustments] = useState<Transaction[]>(INITIAL_ADJUSTMENTS);
  const [showAll, setShowAll] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Combine manual adjustments and tickets (formatted as transactions)
  const transactions = useMemo(() => {
    const ticketTxs: Transaction[] = tickets.map(ticket => ({
      id: `ticket-${ticket.id}`,
      type: 'venta',
      title: `Venta ${ticket.id}`,
      time: ticket.ago,
      note: ticket.method,
      amount: ticket.total,
    }));
    return [...adjustments, ...ticketTxs];
  }, [tickets, adjustments]);

  // Net sales of the turn (all registered ticket totals)
  const netSales = useMemo(() => {
    return tickets.reduce((acc, t) => acc + t.total, 0);
  }, [tickets]);

  // Cash sales of the turn (tickets paid in cash)
  const cashSales = useMemo(() => {
    return tickets
      .filter(t => t.method === 'Efectivo')
      .reduce((acc, t) => acc + t.total, 0);
  }, [tickets]);

  // Dynamic physical cash in drawer: starting balance + cash tickets + adjustments
  const currentBalance = useMemo(() => {
    const adjustmentsSum = adjustments.reduce((acc, adj) => acc + adj.amount, 0);
    return STARTING_BALANCE + cashSales + adjustmentsSum;
  }, [cashSales, adjustments]);

  const visibleTxs = showAll ? transactions : transactions.slice(0, 4);

  const openModal = (type: ModalType) => {
    setModal(type);
    setAmount('');
    setNote('');
  };

  const closeModal = () => {
    setModal(null);
    setAmount('');
    setNote('');
  };

  const handleSubmit = () => {
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) {
      toast.error('Ingresa un monto válido mayor a $0.00');
      return;
    }
    if (modal === 'retiro' && currentBalance - num < 0) {
      toast.error('El retiro resultaría en saldo negativo. Verifica el monto.');
      return;
    }

    setSaving(true);
    setTimeout(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
      const newTx: Transaction = {
        id: `t${Date.now()}`,
        type: modal!,
        title: modal === 'entrada' ? 'Entrada Manual' : 'Retiro Manual',
        time: timeStr,
        note: note.trim(),
        amount: modal === 'entrada' ? num : -num,
      };
      setAdjustments(prev => [newTx, ...prev]);
      setSaving(false);
      closeModal();
      toast.success(
        modal === 'entrada'
          ? `Entrada de $${num.toFixed(2)} registrada`
          : `Retiro de $${num.toFixed(2)} registrado`
      );
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-[#F8F9FE] relative">

      {/* ── Header ── */}
      <div className="bg-[#001540] text-white px-4 py-5 flex items-center gap-3 shrink-0">
        <button
          onClick={() => navigate('/admin')}
          className="p-1.5 hover:bg-white/10 rounded-full transition-colors active:scale-95"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold tracking-tight">Gestión de Caja</h1>
          <p className="text-white/50 text-xs">Lun Mañana 08:00 – 12:00 PM · Cajero: María G.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-36 pt-4 space-y-4">

        {/* ── Tarjeta de saldo ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#001540] rounded-[24px] px-5 pt-5 pb-6 relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-12 -mt-12" />
          <div className="absolute right-10 bottom-0 w-20 h-20 bg-white/5 rounded-full -mb-8" />
          <div className="relative z-10">
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">
              Efectivo en Caja
            </p>
            <div className="flex items-baseline gap-2 mb-4">
              <h2 className={`text-4xl font-black ${currentBalance < 0 ? 'text-red-400' : 'text-white'}`}>
                ${currentBalance.toFixed(2)}
              </h2>
              <span className="text-white/40 text-sm font-bold">MXN</span>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3">
              <button
                onClick={() => openModal('entrada')}
                className="flex-1 bg-white/15 hover:bg-white/25 active:scale-95 transition-all rounded-[16px] py-3 flex items-center justify-center gap-2 text-white font-bold text-sm"
              >
                <Plus className="w-4 h-4" />
                Entrada Manual
              </button>
              <button
                onClick={() => openModal('retiro')}
                className="flex-1 bg-white/15 hover:bg-white/25 active:scale-95 transition-all rounded-[16px] py-3 flex items-center justify-center gap-2 text-white font-bold text-sm"
              >
                <Minus className="w-4 h-4" />
                Retiro Manual
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Resumen del turno ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Saldo Inicial</p>
            <p className="text-xl font-black text-[#1A1C1E]">${STARTING_BALANCE.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Ventas Netas</p>
            <p className="text-xl font-black text-green-600">+${netSales.toFixed(2)}</p>
          </div>
        </motion.div>

        {/* ── Transacciones recientes ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-base font-bold text-[#1A1C1E]">Transacciones Recientes</h2>
            <button
              onClick={() => setShowAll(v => !v)}
              className="text-sm font-semibold text-[#002B7F] flex items-center gap-1"
            >
              {showAll ? 'Ver menos' : 'Ver todo'}
              <ChevronRight className={`w-4 h-4 transition-transform ${showAll ? 'rotate-90' : ''}`} />
            </button>
          </div>

          <div className="bg-white rounded-[22px] shadow-sm border border-gray-100 overflow-hidden">
            <AnimatePresence initial={false}>
              {visibleTxs.map((tx, i, arr) => {
                const cfg = TX_CONFIG[tx.type];
                const Icon = cfg.icon;
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`flex items-center gap-3 px-4 py-3.5 ${
                      i !== arr.length - 1 ? 'border-b border-gray-50' : ''
                    }`}
                  >
                    <div className={`w-9 h-9 ${cfg.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[#1A1C1E] truncate">{tx.title}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {tx.time}{tx.note ? ` · ${tx.note}` : ''}
                      </p>
                    </div>
                    <p className={`font-black text-sm shrink-0 ${cfg.amountColor}`}>
                      {tx.amount >= 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                    </p>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {showAll && (
              <div className="px-4 py-2.5 border-t border-gray-50 text-center">
                <p className="text-xs text-gray-400 font-medium">{transactions.length} transacciones en este turno</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Botón Resumen de Turno ── */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-gradient-to-t from-[#F8F9FE] via-[#F8F9FE]/90 to-transparent">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowSummary(true)}
          className="w-full py-4 rounded-[22px] font-bold text-base bg-[#001540] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#001540]/20"
        >
          <FileText className="w-5 h-5" />
          Resumen de Turno
        </motion.button>
      </div>

      {/* ── Modal: Entrada / Retiro Manual ── */}
      <AnimatePresence>
        {modal && (
          <div className="absolute inset-0 z-50 flex items-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
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

              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-[#1A1C1E]">
                    {modal === 'entrada' ? 'Entrada Manual' : 'Retiro Manual'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {modal === 'entrada'
                      ? 'Agrega efectivo a la caja'
                      : `Disponible: $${currentBalance.toFixed(2)}`}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="space-y-3 mb-5">
                {/* Monto */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">
                    Monto ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.50"
                      placeholder="0.00"
                      value={amount}
                      onChange={e => {
                        const v = e.target.value;
                        if (v === '' || parseFloat(v) >= 0) setAmount(v);
                      }}
                      autoFocus
                      className="w-full bg-[#F8F9FE] border border-gray-100 rounded-[18px] py-3.5 pl-8 pr-4 font-bold text-xl focus:outline-none focus:ring-2 focus:ring-[#001540]/10 transition-all"
                    />
                  </div>
                  {modal === 'retiro' && amount && parseFloat(amount) > currentBalance && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-red-500 font-bold ml-1 mt-1"
                    >
                      El monto excede el saldo disponible (${currentBalance.toFixed(2)})
                    </motion.p>
                  )}
                </div>

                {/* Motivo */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">
                    Motivo (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder={
                      modal === 'entrada'
                        ? 'Ej: Reposición de fondo'
                        : 'Ej: Cambio para repartidor'
                    }
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    className="w-full bg-[#F8F9FE] border border-gray-100 rounded-[18px] py-3.5 px-4 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#001540]/10 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-[20px] font-bold text-sm active:scale-95 transition-transform"
                >
                  Cancelar
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  disabled={saving || !amount || parseFloat(amount) <= 0}
                  className={`flex-1 py-4 rounded-[20px] font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                    !saving && amount && parseFloat(amount) > 0
                      ? modal === 'entrada'
                        ? 'bg-[#001540] text-white shadow-[#001540]/20'
                        : 'bg-red-500 text-white shadow-red-500/20'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {modal === 'entrada' ? 'Registrar Entrada' : 'Registrar Retiro'}
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal: Resumen de Turno ── */}
      <AnimatePresence>
        {showSummary && (
          <div className="absolute inset-0 z-50 flex items-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSummary(false)}
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
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-[#1A1C1E]">Resumen de Turno</h3>
                <button
                  onClick={() => setShowSummary(false)}
                  className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="space-y-1 mb-5">
                {[
                  { label: 'Saldo inicial',            value: `$${STARTING_BALANCE.toFixed(2)}`,  color: 'text-[#1A1C1E]' },
                  { label: 'Ventas netas en efectivo', value: `+$${cashSales.toFixed(2)}`,        color: 'text-green-600'  },
                  { label: 'Entradas manuales',
                    value: `+$${transactions.filter(t=>t.type==='entrada').reduce((a,t)=>a+t.amount,0).toFixed(2)}`,
                    color: 'text-blue-600' },
                  { label: 'Retiros manuales',
                    value: `-$${Math.abs(transactions.filter(t=>t.type==='retiro').reduce((a,t)=>a+t.amount,0)).toFixed(2)}`,
                    color: 'text-red-500' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center py-3 border-b border-gray-50">
                    <span className="text-sm text-gray-500">{row.label}</span>
                    <span className={`text-sm font-black ${row.color}`}>{row.value}</span>
                  </div>
                ))}

                <div className="flex justify-between items-center pt-4 bg-[#F8F9FE] rounded-[16px] px-4 py-3 mt-2">
                  <span className="text-sm font-bold text-[#1A1C1E]">Efectivo en caja ahora</span>
                  <span className={`text-xl font-black ${currentBalance < 0 ? 'text-red-500' : 'text-[#001540]'}`}>
                    ${currentBalance.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowSummary(false)}
                className="w-full py-4 rounded-[22px] font-bold text-base bg-[#001540] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#001540]/20 active:scale-[0.98] transition-transform"
              >
                Cerrar Resumen
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
