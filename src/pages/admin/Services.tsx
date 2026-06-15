import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Service } from '../../types';
import { Plus, Edit2, Check, X, Clock, DollarSign, Image as ImageIcon, Upload, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageCropper from '../../components/ImageCropper';
import getCroppedImg from '../../lib/cropImage';

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Cropping State
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_minutes: 30,
    price: 0,
    is_active: true,
    image_url: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .neq('name', '__UI_SETTINGS__')
        .order('price', { ascending: true });

      if (error) throw error;
      if (data) setServices(data);
    } catch (err: any) {
      toast.error('Failed to load services.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description,
        duration_minutes: service.duration_minutes,
        price: service.price,
        is_active: service.is_active,
        image_url: service.image_url || ''
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        duration_minutes: 30,
        price: 0,
        is_active: true,
        image_url: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setImageFile(null);
    setImageToCrop(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageToCrop(reader.result?.toString() || null);
      });
      reader.readAsDataURL(file);
      e.target.value = ''; // Reset input to allow selecting same file again
    }
  };

  const handleCropComplete = async (croppedAreaPixels: any) => {
    if (!imageToCrop) return;
    
    try {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
      if (croppedImage) {
        setImageFile(croppedImage);
      } else {
         toast.error("Could not crop image.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error cropping image.");
    } finally {
        setImageToCrop(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      let finalImageUrl = formData.image_url;

      // Handle Image Upload First
      if (imageFile) {
        finalImageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(imageFile);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });
      }

      const { image_url, ...restData } = formData;
      const dataToSave = finalImageUrl ? { ...restData, image_url: finalImageUrl } : restData;

    if (editingService) {
      let { error } = await supabase
        .from('services')
        .update(dataToSave)
        .eq('id', editingService.id);
        
      if (error && (error.code === 'PGRST204' || error.message?.includes('image_url'))) {
         let fallbackDataToSave = { ...restData };
         const fallbackRes = await supabase
           .from('services')
           .update(fallbackDataToSave)
           .eq('id', editingService.id);
         
         if (!fallbackRes.error) {
             toast.success('Service updated (image ignored due to missing column in database)');
             handleCloseModal();
             fetchServices();
             return;
         } else {
             error = fallbackRes.error;
         }
      }
      if (error) throw error;
      toast.success('Service updated perfectly.');
    } else {
      let { error } = await supabase
        .from('services')
        .insert(dataToSave);

      if (error && (error.code === 'PGRST204' || error.message?.includes('image_url'))) {
         let fallbackDataToSave = { ...restData };
         const fallbackRes = await supabase
           .from('services')
           .insert(fallbackDataToSave);
         
         if (!fallbackRes.error) {
             toast.success('Service created (image ignored due to missing column in database)');
             handleCloseModal();
             fetchServices();
             return;
         } else {
             error = fallbackRes.error;
         }
      }
      if (error) throw error;
      toast.success('Service created perfectly.');
    }
      handleCloseModal();
      fetchServices();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save service.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Service deleted successfully.');
      setDeletingId(null);
      fetchServices();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete service. It might be linked to appointments.');
      console.error(err);
      setDeletingId(null);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      toast.success(`Service ${!currentStatus ? 'activated' : 'deactivated'}.`);
      fetchServices();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Clinic Services</h1>
          <p className="text-slate-500">Manage the procedures and treatments offered to patients.</p>
        </div>
        
        <button
          onClick={() => handleOpenModal()}
          className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-teal-200 flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Add New Service
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
         </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {services.map(service => (
            <div key={service.id} className={`bg-white rounded-2xl border ${service.is_active ? 'border-slate-200 shadow-sm' : 'border-slate-200/50 opacity-75'} p-6 transition-all relative overflow-hidden`}>
              {!service.is_active && (
                <div className="absolute top-4 right-4 text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-1 rounded">Inactive</div>
              )}
              <h3 className="text-lg font-bold text-slate-900 mb-2 pr-16">{service.name}</h3>
              <p className="text-sm text-slate-500 mb-6 line-clamp-2 h-10">{service.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-slate-700 font-medium mb-6">
                <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                  <Clock size={14} className="text-slate-400" /> {service.duration_minutes}m
                </div>
                <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                  <DollarSign size={14} className="text-slate-400" /> {service.price}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => toggleStatus(service.id, service.is_active)}
                  className={`text-sm font-medium transition-colors ${service.is_active ? 'text-rose-600 hover:text-rose-700' : 'text-emerald-600 hover:text-emerald-700'}`}
                >
                  {service.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <div className="flex items-center gap-4">
                  {deletingId === service.id ? (
                    <button
                      onClick={() => deleteService(service.id)}
                      className="flex items-center gap-1 text-sm font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded transition-colors mr-2 border border-rose-200"
                    >
                      Sure?
                    </button>
                  ) : (
                    <button
                      onClick={() => setDeletingId(service.id)}
                      className="flex items-center gap-1 text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors mr-2"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenModal(service)}
                    className="flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
          {services.length === 0 && (
             <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-slate-200 border-dashed text-slate-500">
                No services have been added yet. Click "Add New Service" to get started.
             </div>
          )}
        </div>
      )}

      {/* Editor Drawer / Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">{editingService ? 'Edit Service' : 'Add New Service'}</h2>
               <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 rounded-full p-1">
                 <X size={20} />
               </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Service Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 outline-none"
                    placeholder="e.g. Comprehensive Checkup"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea 
                    required
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 outline-none resize-none"
                    placeholder="Describe the procedure and benefits..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Duration (minutes)</label>
                    <input 
                      required
                      type="number" 
                      min="1"
                      value={formData.duration_minutes}
                      onChange={e => setFormData({...formData, duration_minutes: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
                    <input 
                      required
                      type="number" 
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Service Image</label>
                  
                  <div className="flex items-center gap-4">
                    {(formData.image_url || imageFile) && (
                       <div className="relative group">
                         <img 
                           src={imageFile ? URL.createObjectURL(imageFile) : formData.image_url} 
                           alt="Preview" 
                           className="w-16 h-16 object-cover rounded-xl border border-slate-200" 
                         />
                         <button 
                           type="button" 
                           onClick={() => { setImageFile(null); setFormData({...formData, image_url: ''}); }} 
                           className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                         >
                           <X size={12} />
                         </button>
                       </div>
                    )}
                    
                    <div className="flex-1 relative">
                       <input 
                          type="file" 
                          id="file-upload"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                       />
                       <label 
                         htmlFor="file-upload"
                         className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-teal-500 hover:bg-teal-50 transition-colors cursor-pointer text-slate-600 font-medium"
                       >
                         <Upload size={18} />
                         {imageFile ? imageFile.name : 'Upload custom image'}
                       </label>
                    </div>
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <input 
                    id="isActive"
                    type="checkbox" 
                    checked={formData.is_active}
                    onChange={e => setFormData({...formData, is_active: e.target.checked})}
                    className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-600"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-slate-700">
                    Active (visible to patients)
                  </label>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {isUploading && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>}
                  {isUploading ? 'Saving...' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {imageToCrop && (
        <ImageCropper
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setImageToCrop(null);
          }}
          aspectRatio={4 / 3} // Typical aspect ratio for service images
        />
      )}
    </div>
  );
}
