import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Trash2, 
  AlertTriangle,
  X,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useFruteria } from '../stores/FruteriaProvider';
import type { Product } from '../types/fruteria';

export const ProductRemove = () => {
  const navigate = useNavigate();
  const { products, deleteProduct } = useFruteria();
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = () => {
    if (!selectedProduct) return;
    
    setIsDeleting(true);
    setTimeout(() => {
      deleteProduct(selectedProduct.id);
      setIsDeleting(false);
      setSelectedProduct(null);
      toast.success('Producto eliminado correctamente');
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full bg-[#F8F9FE] relative">
      {/* Header */}
      <div className="bg-[#001540] text-white px-4 py-6 flex items-center gap-4 shadow-md sticky top-0 z-20">
        <button 
          onClick={() => navigate('/admin')}
          className="p-1 hover:bg-white/10 rounded-full transition-colors active:scale-95"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Baja de Producto</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-10 no-scrollbar">
        <div className="p-6 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Buscar producto a eliminar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-[20px] py-4 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#001540]/10 transition-all font-medium"
            />
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, x: -20 }}
                  className="bg-white rounded-[28px] p-4 flex items-center gap-4 shadow-sm border border-gray-50"
                >
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                    <ImageWithFallback 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#1A1C1E] text-base truncate">{product.name}</h3>
                    <p className="text-xs text-gray-400 font-bold">{product.category}</p>
                    <p className="text-[#001540] font-black text-sm mt-1">${product.price.toFixed(2)} / {product.unit}</p>
                  </div>

                  <button 
                    onClick={() => setSelectedProduct(product)}
                    className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-100 active:scale-90 transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredProducts.length === 0 && (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-400 font-medium">No se encontraron productos</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-[#001540]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-[#1A1C1E] mb-2">¿Confirmar Baja?</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-8 px-4">
                  Estás a punto de eliminar <span className="font-bold text-[#1A1C1E]">"{selectedProduct.name}"</span> del sistema. Esta acción no se puede deshacer.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-[20px] font-bold text-sm hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 py-4 bg-red-500 text-white rounded-[20px] font-bold text-sm shadow-lg shadow-red-500/20 hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    {isDeleting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Sí, Eliminar'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
