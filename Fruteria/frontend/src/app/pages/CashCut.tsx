import React, { useState } from 'react';
import {
  ArrowLeft,
  Scissors,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

import { useFruteria } from '../stores/FruteriaProvider';

/* ─── Fondo de cambio simulado ─────────────────────────────────── */
const FONDO_CAMBIO   = 500.00;   // fondo de cambio que queda en caja

/* ─── Denominaciones MXN ─────────────────────────────────────────── */
const DENOMINATIONS = [
  { label: '$500', value: 500 },
  { label: '$200', value: 200 },
  { label: '$100', value: 100 },
  { label: '$50',  value: 50  },
  { label: '$20',  value: 20  },
  { label: '$10',  value: 10  },
  { label: '$5',   value: 5   },
  { label: '$2',   value: 2   },
  { label: '$1',   value: 1   },
  { label: '¢50',  value: 0.5 },
];

type Step = 'count' | 'confirm' | 'done';

export const CashCut = () => {
  const navigate = useNavigate();
  const { tickets } = useFruteria();
  const [step, setStep] = useState<Step>('count');
  const [counts, setCounts] = useState<Record<number, string>>(
    Object.fromEntries(DENOMINATIONS.map(d => [d.value, '']))
  );
  const [processing, setProcessing] = useState(false);

  // Sum up all tickets sold to compute the actual session sales
  const sessionSales = tickets.reduce((acc, ticket) => acc + ticket.total, 0);
  const saldoTotal = sessionSales + FONDO_CAMBIO;

  /* Suma física contada */
  const physicalTotal = DENOMINATIONS.reduce((acc, d) => {
    const qty = parseFloat(counts[d.value] || '0');
    return acc + (isNaN(qty) ? 0 : qty * d.value);
  }, 0);

  /* Monto a entregar (no puede ser negativo) */
  const cutAmount   = Math.max(0, physicalTotal - FONDO_CAMBIO);
  /* Diferencia respecto al sistema */
  const difference  = physicalTotal - saldoTotal;
  const isShort     = difference < 0;
  const hasError    = physicalTotal < FONDO_CAMBIO;

  const setCount = (value: number, qty: string) => {
    const num = parseFloat(qty);
    if (qty !== '' && (isNaN(num) || num < 0)) return;
    setCounts(prev => ({ ...prev, [value]: qty }));
  };

  const handleConfirm = () => {
    if (hasError) {
      toast.error('El total contado es menor al fondo de cambio mínimo ($500)');
      return;
    }
    setStep('confirm');
  };

  const handleCut = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setStep('done');
    }, 1600);
  };

  const handleCorrect = () => {
    setStep('count');
  };

  const handleReset = () => {
    setCounts(Object.fromEntries(DENOMINATIONS.map(d => [d.value, ''])));
    setStep('count');
  };

  /* ─── Paso 1: Conteo ─── */
  if (step === 'count') {
    return (
      <div className="flex flex-col h-full bg-[#F8F9FE]">
        {/* Header */}
        <div className="bg-[#001540] text-white px-4 py-5 flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/sales')}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold tracking-tight">Corte de Caja</h1>
            <p className="text-white/50 text-xs">Cierre de turno · Paso 1 de 2</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-36 pt-4 space-y-4">
          {/* Resumen del sistema */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#001540] rounded-[24px] p-5 text-white relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-28 h-28 bg-white/5 rounded-full -mr-10 -mt-10" />
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Saldo del Sistema</p>
            <h2 className="text-4xl font-black mb-1">${saldoTotal.toFixed(2)}</h2>
            <div className="flex gap-4 text-white/60 text-xs mt-2">
              <span>Ventas: <strong className="text-white">${sessionSales.toFixed(2)}</strong></span>
              <span>Fondo: <strong className="text-white">${FONDO_CAMBIO.toFixed(2)}</strong></span>
            </div>
          </motion.div>

          {/* Instrucción */}
          <p className="text-sm text-gray-500 px-1">
            Ingresa la cantidad de cada denominación que tienes físicamente en caja.
          </p>

          {/* Denominaciones */}
          <div className="bg-white rounded-[22px] border border-gray-100 shadow-sm overflow-hidden">
            {DENOMINATIONS.map((d, i) => (
              <div
                key={d.value}
                className={`flex items-center gap-4 px-5 py-3.5 ${
                  i !== DENOMINATIONS.length - 1 ? 'border-b border-gray-50' : ''
                }`}
              >
                <span className="w-12 text-sm font-black text-[#1A1C1E] shrink-0">{d.label}</span>
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={counts[d.value]}
                    onChange={e => setCount(d.value, e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-[12px] py-2.5 px-3 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#001540]/10 transition-all"
                  />
                </div>
                <div className="w-24 text-right shrink-0">
                  {parseFloat(counts[d.value] || '0') > 0 && (
                    <span className="text-sm font-black text-[#001540]">
                      ${(parseFloat(counts[d.value]) * d.value).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer con totales y botón */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-gradient-to-t from-[#F8F9FE] via-[#F8F9FE]/95 to-transparent space-y-3">
          {/* Totales */}
          <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium">Total contado</p>
              <h3 className={`text-2xl font-black ${hasError ? 'text-red-500' : 'text-[#1A1C1E]'}`}>
                ${physicalTotal.toFixed(2)}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 font-medium">A entregar</p>
              <h3 className="text-2xl font-black text-[#001540]">${cutAmount.toFixed(2)}</h3>
            </div>
          </div>

          {hasError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-[16px] px-4 py-3"
            >
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-xs font-bold text-red-600">
                El monto contado no puede ser menor al fondo de cambio (${FONDO_CAMBIO.toFixed(2)})
              </p>
            </motion.div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleConfirm}
            disabled={physicalTotal === 0}
            className={`w-full py-4 rounded-[22px] font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg ${
              physicalTotal > 0 && !hasError
                ? 'bg-[#001540] text-white shadow-[#001540]/20'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            Revisar y Confirmar
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    );
  }

  /* ─── Paso 2: Confirmación ─── */
  if (step === 'confirm') {
    return (
      <div className="flex flex-col h-full bg-[#F8F9FE]">
        <div className="bg-[#001540] text-white px-4 py-5 flex items-center gap-3 shrink-0">
          <button
            onClick={handleCorrect}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold tracking-tight">Confirmar Corte</h1>
            <p className="text-white/50 text-xs">Paso 2 de 2 · Revisa antes de confirmar</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-36 pt-5 space-y-4">
          {/* Tarjeta resumen */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 space-y-4"
          >
            <h2 className="text-base font-bold text-[#1A1C1E]">Resumen del Corte</h2>

            {[
              { label: 'Saldo del sistema',  value: `$${saldoTotal.toFixed(2)}`,    bold: false },
              { label: 'Total contado',       value: `$${physicalTotal.toFixed(2)}`,  bold: false },
              { label: 'Fondo de cambio',     value: `$${FONDO_CAMBIO.toFixed(2)}`,   bold: false },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center border-b border-gray-50 pb-3">
                <span className="text-sm text-gray-500">{row.label}</span>
                <span className="text-sm font-bold text-[#1A1C1E]">{row.value}</span>
              </div>
            ))}

            {/* Diferencia */}
            <div className={`flex justify-between items-center rounded-[14px] px-3 py-2.5 ${
              isShort ? 'bg-red-50' : difference === 0 ? 'bg-gray-50' : 'bg-green-50'
            }`}>
              <span className={`text-sm font-bold ${
                isShort ? 'text-red-600' : difference === 0 ? 'text-gray-600' : 'text-green-600'
              }`}>Diferencia</span>
              <span className={`text-sm font-black ${
                isShort ? 'text-red-600' : difference === 0 ? 'text-gray-600' : 'text-green-600'
              }`}>
                {difference >= 0 ? '+' : ''}${difference.toFixed(2)}
              </span>
            </div>

            {/* Monto a entregar */}
            <div className="bg-[#001540] rounded-[18px] px-4 py-4 flex justify-between items-center">
              <span className="text-white/70 text-sm font-medium">Monto a entregar</span>
              <span className="text-white text-2xl font-black">${cutAmount.toFixed(2)}</span>
            </div>
          </motion.div>

          {/* Advertencia si hay diferencia */}
          {isShort && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-[18px] px-4 py-4"
            >
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-700">Faltante detectado</p>
                <p className="text-xs text-red-500 mt-0.5">
                  Hay una diferencia de ${Math.abs(difference).toFixed(2)} respecto al sistema. Verifica el conteo antes de confirmar.
                </p>
              </div>
            </motion.div>
          )}

          {difference > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-[18px] px-4 py-4"
            >
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-green-700">Sobrante detectado</p>
                <p className="text-xs text-green-600 mt-0.5">
                  Hay ${difference.toFixed(2)} adicionales. Se incluirán en el monto a entregar.
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Botones */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-gradient-to-t from-[#F8F9FE] via-[#F8F9FE]/95 to-transparent space-y-3">
          {/* Corregir */}
          <button
            onClick={handleCorrect}
            className="w-full py-3.5 rounded-[20px] font-bold text-sm text-gray-500 bg-white border border-gray-200 flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <RotateCcw className="w-4 h-4" />
            Corregir conteo
          </button>

          {/* Confirmar */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleCut}
            disabled={processing}
            className="w-full py-4 rounded-[22px] font-bold text-base bg-[#001540] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#001540]/20 active:scale-[0.98] transition-transform"
          >
            {processing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Scissors className="w-5 h-5" />
                Confirmar Corte
              </>
            )}
          </motion.button>
        </div>
      </div>
    );
  }

  /* ─── Paso 3: Resultado ─── */
  return (
    <div className="flex flex-col h-full bg-[#F8F9FE]">
      <div className="bg-[#001540] text-white px-4 py-5 flex items-center gap-3 shrink-0">
        <div className="flex-1 text-center">
          <h1 className="text-lg font-bold tracking-tight">Corte Realizado</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center space-y-6">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 200 }}
          className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center"
        >
          <CheckCircle2 className="w-14 h-14 text-green-500" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-black text-[#1A1C1E] mb-2">¡Corte Exitoso!</h2>
          <p className="text-gray-400 text-sm">El corte de caja se registró correctamente.</p>
        </motion.div>

        {/* Detalle del resultado */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 space-y-3 text-left"
        >
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Total entregado</span>
            <span className="text-xl font-black text-[#001540]">${cutAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center border-t border-gray-50 pt-3">
            <span className="text-sm text-gray-500">Fondo restante</span>
            <span className="text-sm font-bold text-[#1A1C1E]">${FONDO_CAMBIO.toFixed(2)}</span>
          </div>
          <div className={`flex justify-between items-center border-t border-gray-50 pt-3`}>
            <span className="text-sm text-gray-500">Diferencia</span>
            <span className={`text-sm font-black ${isShort ? 'text-red-500' : difference === 0 ? 'text-gray-500' : 'text-green-600'}`}>
              {difference >= 0 ? '+' : ''}${difference.toFixed(2)}
            </span>
          </div>
          <div className="border-t border-gray-50 pt-3 flex justify-between items-center text-gray-400 text-xs">
            <span>Turno cerrado</span>
            <span>{new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </motion.div>
      </div>

      {/* Botones finales */}
      <div className="px-4 pb-8 pt-2 space-y-3">
        <button
          onClick={handleReset}
          className="w-full py-3.5 rounded-[20px] font-bold text-sm text-gray-500 bg-white border border-gray-200 flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <RotateCcw className="w-4 h-4" />
          Nuevo corte
        </button>
        <button
          onClick={() => navigate('/sales')}
          className="w-full py-4 rounded-[22px] font-bold text-base bg-[#001540] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#001540]/20 active:scale-[0.98] transition-transform"
        >
          Volver al Panel
        </button>
      </div>
    </div>
  );
};
