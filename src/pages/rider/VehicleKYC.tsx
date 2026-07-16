import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { EmeraldButton } from '@/src/components/ui/EmeraldButton';
import { Car, Bike, Send, Minus, Plus, Upload, FileText, CreditCard } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function VehicleKYC() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('EV Car');
  const [seats, setSeats] = useState(4);

  const vehicleTypes = [
    { id: 'EV Car', icon: <Car size={18} /> },
    { id: 'eBike', icon: <Bike size={18} /> },
    { id: 'CNG', icon: <Send size={18} /> }
  ];

  const docs = [
    { label: 'Vehicle Registration Papers (PDF)', icon: <FileText size={16} /> },
    { label: 'Driving License — Front Side', icon: <CreditCard size={16} /> },
    { label: 'Driving License — Back Side', icon: <CreditCard size={16} /> }
  ];

  return (
    <DashboardLayout userType="rider" userName="Nasrin Akter">
      <div className="max-w-4xl mx-auto py-4">
        <header className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Vehicle Registration & KYC</h1>
          <p className="text-slate-500">Complete your vehicle setup to start accepting rides</p>
        </header>

        <GlassCard className="p-10 space-y-10">
          {/* Vehicle Type & Seats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Choose EV Type</label>
              <div className="flex gap-3">
                {vehicleTypes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedType(t.id)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-bold text-sm",
                      selectedType === t.id 
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200" 
                        : "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200"
                    )}
                  >
                    {t.icon}
                    {t.id}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Seat Capacity</label>
              <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl border border-slate-100">
                <button 
                  onClick={() => setSeats(Math.max(1, seats - 1))}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 shadow-sm"
                >
                  <Minus size={18} className="text-slate-400" />
                </button>
                <div className="text-center">
                   <span className="text-xl font-black text-slate-800 block">{seats}</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Excluding driver</span>
                </div>
                <button 
                  onClick={() => setSeats(Math.min(6, seats + 1))}
                  className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 shadow-lg shadow-emerald-100"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">EV Photo</label>
            <div className="border-2 border-dashed border-emerald-200 bg-emerald-50/20 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:bg-emerald-50 transition-all">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-500 transition-transform group-hover:scale-110">
                <Car size={32} />
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-800">Drag and drop your EV photo</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">JPG or PNG, min 800×600px</p>
              </div>
              <EmeraldButton variant="secondary" className="px-8 py-2.5 text-xs">
                Browse Files
              </EmeraldButton>
            </div>
          </div>

          {/* Documents */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Required Documents</label>
            <div className="space-y-3">
              {docs.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-white hover:border-emerald-200 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                      {doc.icon}
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{doc.label}</span>
                  </div>
                  <button className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700">
                    <Upload size={14} />
                    Upload
                  </button>
                </div>
              ))}
            </div>
          </div>

          <EmeraldButton 
            className="w-full py-5 text-lg"
            onClick={() => navigate('/rider/dashboard')}
          >
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Submit Vehicle for Approval
          </EmeraldButton>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
