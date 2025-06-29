import React, { useState } from 'react';
import { CardBackground, CardBackgroundPack } from '../../types';
import LoadingSpinner from '../LoadingSpinner';
import CardBackgroundDisplay from '../CardBackgroundDisplay';
import TrashIcon from '../icons/TrashIcon';
import PlusIcon from '../icons/PlusIcon';

interface PackManagerProps {
    allBackgrounds: CardBackground[];
    packs: CardBackgroundPack[];
    onUpdatePacks: (newPacks: CardBackgroundPack[]) => void;
}

const PackManager: React.FC<PackManagerProps> = ({ allBackgrounds, packs, onUpdatePacks }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newPack, setNewPack] = useState<Partial<CardBackgroundPack>>({ name: '', description: '', cost: 500, backgroundIds: [], coverImageUrl: '', limit: null });
    const [fileProcessing, setFileProcessing] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileProcessing(true);
        const reader = new FileReader();
        reader.onload = (event) => { setNewPack(prev => ({ ...prev, coverImageUrl: event.target?.result as string })); setFileProcessing(false); };
        reader.onerror = () => { alert('Error reading file.'); setFileProcessing(false); };
        reader.readAsDataURL(file);
    };
    
    const handleBgSelection = (bgId: string) => {
        setNewPack(prev => {
            const currentIds = prev.backgroundIds || [];
            const newIds = currentIds.includes(bgId) ? currentIds.filter(id => id !== bgId) : [...currentIds, bgId];
            return { ...prev, backgroundIds: newIds };
        });
    };

    const handleAddPack = () => {
        if (!newPack.name || newPack.cost === undefined || !newPack.coverImageUrl) { alert('Pack Name, Cost, and Cover Image are required.'); return; }
        const finalPack: CardBackgroundPack = {
            id: `pack-${Date.now()}`, name: newPack.name, description: newPack.description || '', cost: newPack.cost,
            coverImageUrl: newPack.coverImageUrl, backgroundIds: newPack.backgroundIds || [],
            limit: newPack.limit || null,
            unlockCount: 0
        };
        onUpdatePacks([...packs, finalPack]);
        setNewPack({ name: '', description: '', cost: 500, backgroundIds: [], coverImageUrl: '', limit: null }); setIsAdding(false);
    };
    
    const handleDeletePack = (id: string) => { if (window.confirm('Are you sure you want to delete this pack? This will not delete the backgrounds inside it.')) onUpdatePacks(packs.filter(p => p.id !== id)); };

    const baseInput = "mt-1 w-full p-1.5 border border-gray-300/70 dark:border-slate-600/80 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 bg-white/70 dark:bg-slate-700/70 text-theme-primary placeholder-gray-500 dark:placeholder-slate-400";
    const baseLabel = "block text-xs font-medium text-theme-secondary";

    return (
        <section className="mt-8 p-4 rounded-lg shadow-xl glass-secondary">
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-semibold text-theme-primary">Card Background Pack Management</h3>{!isAdding && <button onClick={() => setIsAdding(true)} className="px-3 py-2 text-sm font-medium rounded-md shadow-sm flex items-center btn-accent"><PlusIcon className="w-4 h-4 mr-1.5"/> Add New Pack</button>}</div>
            {isAdding && (<div className="p-4 rounded-lg border border-gray-300/50 dark:border-slate-600/50 mb-4 space-y-3 bg-slate-50/50 dark:bg-slate-800/30">
                <h4 className="font-semibold text-lg text-theme-primary">New Pack Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className={baseLabel}>Pack Name</label><input type="text" value={newPack.name || ''} onChange={e => setNewPack({...newPack, name: e.target.value})} className={baseInput} /></div>
                    <div><label className={baseLabel}>Cost (Points)</label><input type="number" value={newPack.cost || 0} onChange={e => setNewPack({...newPack, cost: parseInt(e.target.value) || 0})} className={baseInput} /></div>
                    <div><label className={baseLabel}>Limit (0 for unlimited)</label><input type="number" value={newPack.limit === null ? '' : newPack.limit || 0} onChange={e => setNewPack({...newPack, limit: e.target.value === '' || parseInt(e.target.value) === 0 ? null : parseInt(e.target.value)})} className={baseInput}/></div>
                    <div className="md:col-span-2"><label className={baseLabel}>Description</label><input type="text" value={newPack.description || ''} onChange={e => setNewPack({...newPack, description: e.target.value})} className={baseInput} /></div>
                    <div><label className={baseLabel}>Cover Image</label><input type="file" onChange={handleFileChange} accept="image/*" className={`${baseInput} p-1`}/>{fileProcessing && <LoadingSpinner />}</div>
                    {newPack.coverImageUrl && <img src={newPack.coverImageUrl} alt="Cover preview" className="w-24 h-16 object-cover rounded-md"/>}
                </div>
                <div>
                    <h5 className="text-sm font-medium text-theme-secondary my-2">Select Backgrounds for Pack:</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-2 border border-gray-300/50 dark:border-slate-600/50 rounded-md">
                        {allBackgrounds.map(bg => (<div key={bg.id} className="flex items-center"><input type="checkbox" id={`pack-bg-${bg.id}`} checked={(newPack.backgroundIds || []).includes(bg.id)} onChange={() => handleBgSelection(bg.id)} className="h-4 w-4 rounded text-blue-500 focus:ring-blue-500" /><label htmlFor={`pack-bg-${bg.id}`} className="ml-2 text-xs text-theme-primary truncate">{bg.name}</label></div>))}
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-3"><button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md shadow-sm">Cancel</button><button onClick={handleAddPack} disabled={fileProcessing} className="px-4 py-2 text-sm font-medium rounded-md shadow-sm btn-accent">Add Pack</button></div>
            </div>)}
            <div className="space-y-3">{packs.map(pack => (<div key={pack.id} className="p-3 rounded-lg glass-secondary flex items-center gap-4"><img src={pack.coverImageUrl} alt={pack.name} className="w-24 h-16 object-cover rounded-md flex-shrink-0"/><div className="flex-grow"><p className="font-semibold text-theme-primary">{pack.name}</p><p className="text-xs text-theme-secondary">{pack.cost} pts | Contains {pack.backgroundIds.length} backgrounds</p><p className="text-xs text-theme-secondary">Unlocked: {pack.unlockCount || 0} | Limit: {pack.limit === null ? 'Unlimited' : pack.limit}</p></div><button onClick={() => handleDeletePack(pack.id)} className="p-2 text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm"><TrashIcon className="w-4 h-4" /></button></div>))}</div>
        </section>
    );
};

export default PackManager;
