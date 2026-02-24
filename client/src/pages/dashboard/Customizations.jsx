
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle, XCircle } from 'lucide-react';
import customizationService from '../../api/services/customizationService';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Customizations = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await customizationService.getAll();
            setRequests(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await customizationService.updateStatus(id, status);
            fetchRequests();
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <DashboardHeader
                title="Bespoke Commissions"
                subtitle="Manage and track your custom verification requests."
            />

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {requests.length > 0 ? (
                        requests.map((req) => (
                            <div key={req._id} className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-md transition-all">
                                <div className="flex flex-col md:flex-row justify-between gap-8">
                                    {/* Product & Client Info */}
                                    <div className="flex gap-6">
                                        <div className="w-24 h-24 rounded-2xl bg-gray-50 overflow-hidden flex-shrink-0">
                                            {req.product?.images?.[0] && (
                                                <img src={req.product.images[0]} alt="" className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <div>
                                                <h3 className="font-black text-lg uppercase tracking-tight">{req.product?.name}</h3>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Client: {req.buyer?.name}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={`uppercase tracking-widest text-[10px] h-6 font-black border-none px-3 ${req.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                                                    req.status === 'Accepted' ? 'bg-green-50 text-green-600' :
                                                        req.status === 'Rejected' ? 'bg-red-50 text-red-600' :
                                                            'bg-blue-50 text-blue-600'
                                                    }`}>
                                                    {req.status}
                                                </Badge>
                                                <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                                                    Ref: #{req._id.slice(-6)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Customization Details */}
                                    <div className="flex-1 bg-gray-50/50 rounded-2xl p-6">
                                        <div className="mb-4 flex items-center gap-2 text-primary">
                                            <Sparkles size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Specifications</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {req.customizations?.map((c, idx) => (
                                                <div key={idx} className="bg-white p-3 rounded-xl border border-gray-100">
                                                    <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">{c.optionName}</p>
                                                    <p className="text-sm font-bold">{c.selectedValue}</p>
                                                </div>
                                            ))}
                                        </div>
                                        {req.notes && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-2">Client Notes</p>
                                                <p className="text-sm text-gray-600 italic leading-relaxed">"{req.notes}"</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col justify-center gap-3 md:min-w-[140px]">
                                        {req.status === 'Pending' && (
                                            <>
                                                <Button
                                                    onClick={() => handleStatusUpdate(req._id, 'Accepted')}
                                                    className="w-full h-12 bg-black text-white hover:bg-gray-800 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10"
                                                >
                                                    <CheckCircle size={14} className="mr-2" /> Accept
                                                </Button>
                                                <Button
                                                    onClick={() => handleStatusUpdate(req._id, 'Rejected')}
                                                    variant="outline"
                                                    className="w-full h-12 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest"
                                                >
                                                    <XCircle size={14} className="mr-2" /> Decline
                                                </Button>
                                            </>
                                        )}
                                        {req.status === 'Accepted' && (
                                            <Button
                                                onClick={() => handleStatusUpdate(req._id, 'Completed')}
                                                className="w-full h-12 bg-green-600 text-white hover:bg-green-700 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-200"
                                            >
                                                <CheckCircle size={14} className="mr-2" /> Complete
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-24 text-center border-2 border-dashed border-gray-100 rounded-[3rem]">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Sparkles size={24} className="text-gray-300" />
                            </div>
                            <h3 className="text-lg font-black uppercase tracking-tight mb-2">No active commissions</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Requests for bespoke work will appear here</p>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default Customizations;
