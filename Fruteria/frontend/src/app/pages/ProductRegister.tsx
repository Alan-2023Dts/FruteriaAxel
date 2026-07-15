import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Camera, 
  Tag, 
  DollarSign, 
  Package, 
  Layers,
  ChevronRight,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useFruteria } from '../stores/FruteriaProvider';
import type { ProductCategory } from '../types/fruteria';

const CATEGORY_IMAGES: Record<ProductCategory, string> = {
  Frutas: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  Verduras: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  Cítricos: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  Temporada: 'https://images.unsplash.com/photo-1610397613657-3b853a79d345?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  Abarrotes: 'https://images.unsplash.com/photo-1542838132-92c53300491e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  Lácteos: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
  Otros: 'https://images.unsplash.com/photo-1542838132-92c53300491e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
};

export const ProductRegister = () => {
  const navigate = useNavigate();
  const { addProduct } = useFruteria();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Frutas',
    price: '',
    unit: 'kg',
    stock: '',
    description: ''
  });

  const categories: ProductCategory[] = ['Frutas', 'Verduras', 'Cítricos', 'Temporada', 'Abarrotes', 'Lácteos', 'Otros'];
  const units = ['kg', 'pza', 'manojo', 'litro', 'paquete'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const selectedCategory = formData.category as ProductCategory;
      addProduct({
        name: formData.name,
        category: selectedCategory,
        price: parseFloat(formData.price),
        unit: formData.unit,
        stock: parseFloat(formData.stock),
        image: CATEGORY_IMAGES[selectedCategory] || CATEGORY_IMAGES.Otros,
      });

      setLoading(false);
      toast.success('Producto registrado correctamente');
      navigate('/admin');
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[#F8F9FE]">
      {/* Header */}
      <div className="bg-[#001540] text-white px-4 py-6 flex items-center gap-4 shadow-md sticky top-0 z-20">
        <button 
          onClick={() => navigate('/admin')}
          className="p-1 hover:bg-white/10 rounded-full transition-colors active:scale-95"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Registro de Producto</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-10 no-scrollbar">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload Mock */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full aspect-video bg-white rounded-[32px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#001540]/30 transition-colors"
          >
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center">
              <Camera className="w-7 h-7 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="font-bold text-[#1A1C1E] text-sm">Añadir foto del producto</p>
              <p className="text-xs text-gray-400">Formatos: JPG, PNG (Max 5MB)</p>
            </div>
          </motion.div>

          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#1A1C1E] ml-1">Nombre del Producto *</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Ej. Manzana Golden"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white border border-gray-100 rounded-[20px] py-4 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#001540]/10 transition-all font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#1A1C1E] ml-1">Categoría</label>
                <div className="relative">
                  <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-white border border-gray-100 rounded-[20px] py-4 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#001540]/10 transition-all font-medium appearance-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Unit */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#1A1C1E] ml-1">Unidad</label>
                <div className="relative">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select 
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full bg-white border border-gray-100 rounded-[20px] py-4 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#001540]/10 transition-all font-medium appearance-none"
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Price */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#1A1C1E] ml-1">Precio Unitario *</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full bg-white border border-gray-100 rounded-[20px] py-4 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#001540]/10 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Stock */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#1A1C1E] ml-1">Stock Inicial *</label>
                <div className="relative">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="number"
                    placeholder="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="w-full bg-white border border-gray-100 rounded-[20px] py-4 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#001540]/10 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#1A1C1E] ml-1">Descripción (Opcional)</label>
              <textarea 
                rows={3}
                placeholder="Detalles adicionales del producto..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-white border border-gray-100 rounded-[24px] p-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#001540]/10 transition-all font-medium resize-none"
              />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className={`w-full py-5 rounded-[24px] font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#001540]/20 ${
              loading ? 'bg-gray-400 text-white' : 'bg-[#001540] text-white'
            }`}
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-6 h-6" />
                Registrar Producto
              </>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
};
