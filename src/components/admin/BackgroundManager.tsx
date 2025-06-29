import React, { useState, DragEvent } from 'react';
import { CardBackground, CardBackgroundType, CardTier } from '../../types';
import LoadingSpinner from '../LoadingSpinner';
import CardBackgroundDisplay from '../CardBackgroundDisplay';
import TrashIcon from '../icons/TrashIcon';
import PlusIcon from '../icons/PlusIcon';

interface BackgroundManagerProps {
    backgrounds: CardBackground[];
    onUpdate: (newBgs: CardBackground[]) => void;
}

const BackgroundManager: React.FC<BackgroundManagerProps> = ({ backgrounds, onUpdate }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newBg, setNewBg] = useState<Partial<CardBackground>>({ name: '', cost: 100, type: 'css', tier: 'Common', description: '', limit: null });
    const [fileProcessing, setFileProcessing] = useState(false);
    const [editStates, setEditStates] = useState<Record<string, Partial<CardBackground>>>({});
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileProcessing(true);
        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            setNewBg(prev => ({
                ...prev,
                imageUrl: prev.type === 'image' ? dataUrl : undefined,
                lottieUrl: prev.type === 'lottie' ? dataUrl : undefined,
            }));
            setFileProcessing(false);
        };
        reader.onerror = () => { alert('Error reading file.'); setFileProcessing(false); };
        reader.readAsDataURL(file);
    };

    const handleAdd = () => {
        if (!newBg.name || newBg.cost === undefined || !newBg.type || !newBg.tier) { alert('Please fill all required fields.'); return; }
        if (newBg.type === 'css' && !newBg.cssClass) { alert('CSS Class name is required for CSS type backgrounds.'); return; }
        if ((newBg.type === 'image' && !newBg.imageUrl) || (newBg.type === 'lottie' && !newBg.lottieUrl)) { alert('File must be uploaded for Image or Lottie types.'); return; }

        const finalBg: CardBackground = {
            id: `bg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: newBg.name, cost: newBg.cost, type: newBg.type, tier: newBg.tier, description: newBg.description || '',
            cssClass: newBg.type === 'css' ? newBg.cssClass : undefined, imageUrl: newBg.type === 'image' ? newBg.imageUrl : undefined, lottieUrl: newBg.type === 'lottie' ? newBg.lottieUrl : undefined,
            limit: newBg.limit || null,
            unlockCount: 0,
        };
        onUpdate([...backgrounds, finalBg]);
        setNewBg({ name: '', cost: 100, type: 'css', tier: 'Common', description: '', limit: null }); setIsAdding(false);
    };

    const handleDelete = (id: string) => { if (window.confirm('Are you sure you want to delete this background? This action cannot be undone.')) onUpdate(backgrounds.filter(bg => bg.id !== id)); };
    const handleStartEdit = (bg: CardBackground) => setEditStates(prev => ({ ...prev, [bg.id]: { ...bg } }));
    const handleCancelEdit = (id: string) => setEditStates(prev => { const next = { ...prev }; delete next[id]; return next; });
    const handleSaveEdit = (id: string) => { const editedBg = editStates[id]; if (editedBg) { onUpdate(backgrounds.map(bg => bg.id === id ? (editedBg as CardBackground) : bg)); handleCancelEdit(id); } };
    
    const onDragStart = (e: DragEvent<HTMLDivElement>, id: string) => { e.dataTransfer.setData('text/plain', id); setDraggedItemId(id); };
    const onDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault();
    const onDrop = (e: DragEvent<HTMLDivElement>, dropOnId: string) => {
        const draggedId = e.dataTransfer.getData('text/plain');
        if (!draggedId || draggedId === dropOnId) { setDraggedItemId(null); return; }
        const items = [...backgrounds];
        const draggedIdx = items.findIndex(item => item.id === draggedId);
        const targetIdx = items.findIndex(item => item.id === dropOnId);
        const [removed] = items.splice(draggedIdx, 1);
        items.splice(targetIdx, 0, removed);
        onUpdate(items); setDraggedItemId(null);
    };

    const baseInput = "mt-1 w-full p-1.5 border border-gray-300/70 dark:border-slate-600/80 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 bg-white/70 dark:bg-slate-700/70 text-theme-primary placeholder-gray-500 dark:placeholder-slate-400";
    const baseLabel = "block text-xs font-medium text-theme-secondary";
    const tiers: CardTier[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

    const renderBgRow = (bg: CardBackground) => {
        const isEditing = !!editStates[bg.id]; const editData = editStates[bg.id] || {};
        return (
            <div key={bg.id} draggable onDragStart={(e) => onDragStart(e, bg.id)} onDragOver={onDragOver} onDrop={(e) => onDrop(e, bg.id)} onDragEnd={() => setDraggedItemId(null)}
                className={`p-3 rounded-lg glass-secondary flex flex-col md:flex-row md:items-center gap-4 cursor-grab ${draggedItemId === bg.id ? 'dragging-item' : ''}`}>
                <div className="w-full md:w-24 h-16 rounded-md overflow-hidden flex-shrink-0"><CardBackgroundDisplay background={bg} /></div>
                <div className="flex-grow space-y-1">{isEditing ? (<div className="grid grid-cols-1 sm:grid-cols-2 gap-2"><input type="text" value={editData.name || ''} onChange={e => setEditStates({...editStates, [bg.id]: {...editData, name: e.target.value}})} className={baseInput}/><input type="number" value={editData.cost || 0} onChange={e => setEditStates({...editStates, [bg.id]: {...editData, cost: parseInt(e.target.value) || 0}})} className={baseInput}/><select value={editData.tier || 'Common'} onChange={e => setEditStates({...editStates, [bg.id]: {...editData, tier: e.target.value as CardTier}})} className={baseInput}>{tiers.map(t => <option key={t} value={t}>{t}</option>)}</select><input type="text" value={editData.description || ''} onChange={e => setEditStates({...editStates, [bg.id]: {...editData, description: e.target.value}})} className={`${baseInput}`} placeholder="Description"/><input type="number" placeholder="Limit (0=unlimited)" value={editData.limit === null ? '' : editData.limit || 0} onChange={e => setEditStates({...editStates, [bg.id]: {...editData, limit: e.target.value === '' || parseInt(e.target.value) === 0 ? null : parseInt(e.target.value)}})} className={`${baseInput} sm:col-span-2`} /></div>) : (<><p className="font-semibold text-theme-primary">{bg.name} <span className="text-xs font-normal text-theme-secondary">({bg.tier})</span></p><p className="text-xs text-theme-secondary">{bg.cost} pts | {bg.description}</p><p className="text-xs text-theme-secondary">Unlocked: {bg.unlockCount || 0} | Limit: {bg.limit === null ? 'Unlimited' : bg.limit}</p></>)}</div>
                <div className="flex-shrink-0 flex items-center gap-2">{isEditing ? (<><button onClick={() => handleSaveEdit(bg.id)} className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm">Save</button><button onClick={() => handleCancelEdit(bg.id)} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md shadow-sm">Cancel</button></>) : (<button onClick={() => handleStartEdit(bg)} className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm">Edit</button>)}<button onClick={() => handleDelete(bg.id)} className="p-2 text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm"><TrashIcon className="w-4 h-4" /></button></div>
            </div>
        )
    };
    return (<section className="mt-8 p-4 rounded-lg shadow-xl glass-secondary"><div className="flex justify-between items-center mb-4"><h3 className="text-xl font-semibold text-theme-primary">Card Background Management</h3>{!isAdding && <button onClick={() => setIsAdding(true)} className="px-3 py-2 text-sm font-medium rounded-md shadow-sm flex items-center btn-accent"><PlusIcon className="w-4 h-4 mr-1.5"/> Add New</button>}</div>{isAdding && (<div className="p-4 rounded-lg border border-gray-300/50 dark:border-slate-600/50 mb-4 space-y-3 bg-slate-50/50 dark:bg-slate-800/30"><h4 className="font-semibold text-lg text-theme-primary">New Background Details</h4><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"><div><label className={baseLabel}>Name</label><input type="text" value={newBg.name || ''} onChange={e => setNewBg({...newBg, name: e.target.value})} className={baseInput} /></div><div><label className={baseLabel}>Cost (Hikmah Points)</label><input type="number" value={newBg.cost || 0} onChange={e => setNewBg({...newBg, cost: parseInt(e.target.value) || 0})} className={baseInput} /></div><div><label className={baseLabel}>Rarity Tier</label><select value={newBg.tier} onChange={e => setNewBg({...newBg, tier: e.target.value as CardTier})} className={baseInput}>{tiers.map(t => <option key={t} value={t}>{t}</option>)}</select></div><div className="md:col-span-2"><label className={baseLabel}>Description</label><input type="text" value={newBg.description || ''} onChange={e => setNewBg({...newBg, description: e.target.value})} className={baseInput} /></div><div><label className={baseLabel}>Limit (0 for unlimited)</label><input type="number" value={newBg.limit === null ? '' : newBg.limit || 0} onChange={e => setNewBg({...newBg, limit: e.target.value === '' || parseInt(e.target.value) === 0 ? null : parseInt(e.target.value)})} className={baseInput}/></div><div><label className={baseLabel}>Type</label><select value={newBg.type} onChange={e => setNewBg({...newBg, type: e.target.value as CardBackgroundType})} className={baseInput}><option value="css">CSS</option><option value="image">Image</option><option value="lottie">Lottie</option></select></div>{newBg.type === 'css' && <div><label className={baseLabel}>CSS Class Name</label><input type="text" value={newBg.cssClass || ''} onChange={e => setNewBg({...newBg, cssClass: e.target.value})} className={baseInput} placeholder="e.g., takeaway-new-style"/></div>}{(newBg.type === 'image' || newBg.type === 'lottie') && (<div><label className={baseLabel}>{newBg.type === 'image' ? 'Upload Image' : 'Upload Lottie JSON'}</label><input type="file" onChange={handleFileChange} accept={newBg.type === 'image' ? 'image/*' : '.json'} className={`${baseInput} p-1`}/>{fileProcessing && <LoadingSpinner />}</div>)}</div><div className="flex justify-end gap-3 mt-3"><button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md shadow-sm">Cancel</button><button onClick={handleAdd} disabled={fileProcessing} className="px-4 py-2 text-sm font-medium rounded-md shadow-sm btn-accent">Add Background</button></div></div>)}<div className="space-y-3">{[...backgrounds].map(renderBgRow)}</div></section>);
};

export default BackgroundManager;
