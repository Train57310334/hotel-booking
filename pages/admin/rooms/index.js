import AdminLayout from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Search, Plus, BedDouble, Trash2, Edit, Upload, X, Check, Image as ImageIcon, ChevronDown, ChevronRight, Globe } from 'lucide-react'
import { InfoTooltip } from '@/components/Tooltip'
import { useAdmin } from '@/contexts/AdminContext'
import toast from 'react-hot-toast'
import { useRoleAccess } from '@/hooks/useRoleAccess'

export default function RoomManagement() {
  const { searchQuery, currentHotel, openUpgradeModal } = useAdmin() || { searchQuery: '' }
  const [activeTab, setActiveTab] = useState('inventory') // 'inventory' | 'types'
  const [rooms, setRooms] = useState([])
  const [roomTypes, setRoomTypes] = useState([])
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const { isReception } = useRoleAccess()

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false)
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false)

  // Generic Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null) // { id, type: 'room' | 'type', name }

  const [editRoom, setEditRoom] = useState(null)
  const [editType, setEditType] = useState(null)

  const [expandedTypes, setExpandedTypes] = useState({}); // { [typeId]: boolean }

  // Form States
  const [roomFormData, setRoomFormData] = useState({
    roomTypeId: '',
    roomNumber: '', // Single
    prefix: '', // Bulk
    startNumber: '101', // Bulk
    count: '10', // Bulk
    isBulk: false // Toggle
  })
  const [typeFormData, setTypeFormData] = useState({
    name: '',
    price: '',
    images: [], // Array of URLs
    description: '',
    hotelId: '',
    bedConfig: 'King Bed',
    sizeSqm: '',
    maxAdults: 2,
    maxChildren: 0,
    isFeatured: false,
    amenities: [], // Array of strings
    icalUrl: '' // External calendar import
  })

  // Upload State
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [currentHotel?.id])

  const fetchData = async () => {
    try {
      const hotelId = currentHotel?.id;

      if (!hotelId) return;

      const [rData, tData, hData] = await Promise.all([
        apiFetch(`/rooms?hotelId=${hotelId}`),
        apiFetch(`/room-types?hotelId=${hotelId}`),
        apiFetch('/hotels')
      ])
      setRooms(rData)
      // Sort by Name for stability
      setRoomTypes(tData.sort((a, b) => {
        const nameCompare = a.name.localeCompare(b.name);
        if (nameCompare !== 0) return nameCompare;
        return a.id.localeCompare(b.id);
      }))
      setHotels(hData)
      if (hData.length > 0) {
        setTypeFormData(prev => ({ ...prev, hotelId: currentHotel?.id || hData[0].id }))
      }

      // Auto-expand all types initially if total rooms < 50, otherwise collapse
      const initialExpanded = {};
      tData.forEach(t => initialExpanded[t.id] = rData.length < 50);
      setExpandedTypes(initialExpanded);

    } catch (error) { console.error(error) } finally { setLoading(false) }
  }

  const timeAgo = (date) => {
    if (!date) return '';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + "h ago";
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + "m ago";
    return "Just now";
  };

  const toggleAccordion = (typeId) => {
    setExpandedTypes(prev => ({ ...prev, [typeId]: !prev[typeId] }));
  }

  // --- Filtering Logic ---
  const filteredRoomTypes = roomTypes.filter(type => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();

    // Match Type Name
    if (type.name.toLowerCase().includes(q)) return true;

    // Match Room Number in this Type
    const hasMatchingRoom = rooms.some(r => r.roomTypeId === type.id && r.roomNumber.toLowerCase().includes(q));
    if (hasMatchingRoom) return true;

    return false;
  });

  const getFilteredRooms = (typeId) => {
    return rooms
      .filter(r => r.roomTypeId === typeId)
      .filter(r => !searchQuery || r.roomNumber.toLowerCase().includes(searchQuery))
      .sort((a, b) => (a.roomNumber || '').localeCompare(b.roomNumber || ''));
  }

  // --- Image Upload Logic ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api'}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()

      setTypeFormData(prev => ({ ...prev, images: [...prev.images, data.url] }))
    } catch (error) {
      toast.error('Upload Error: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index) => {
    setTypeFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  // --- CRUD Handlers ---

  // Room Inventory
  const handleSubmitRoom = async (e) => {
    e.preventDefault()
    if (!roomFormData.roomTypeId) {
      toast.error('Error: No Room Type selected');
      return;
    }
    if (roomFormData.isBulk) {
      if (!roomFormData.startNumber || !roomFormData.count) {
        toast.error('Error: Start Number and Count are required');
        return;
      }
    } else if (!roomFormData.roomNumber) {
      toast.error('Error: Room Number is required');
      return;
    }

    try {
      if (roomFormData.isBulk) {
        await apiFetch('/rooms/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomTypeId: roomFormData.roomTypeId,
            prefix: roomFormData.prefix,
            startNumber: parseInt(roomFormData.startNumber),
            count: parseInt(roomFormData.count)
          })
        })
      } else {
        const endpoint = editRoom ? `/rooms/${editRoom.id}` : '/rooms'
        await apiFetch(endpoint, {
          method: editRoom ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomTypeId: roomFormData.roomTypeId,
            roomNumber: roomFormData.roomNumber
          })
        })
      }
      setIsRoomModalOpen(false)
      fetchData()
      toast.success(roomFormData.isBulk ? 'Rooms generated successfully' : 'Room saved successfully');
    } catch (e) {
      console.error(e);
      // Check for Limit Reached
      if (e.status === 409 || e.status === 400 || e.message?.includes('limited') || e.message?.includes('upgrade')) {
        setIsRoomModalOpen(false) // Close the room modal so they see the upgrade modal
        openUpgradeModal()
        return
      }
      toast.error('Failed to save room: ' + (e.message || 'Unknown error'));
    }
  }

  const handleDeleteClick = (e, id, type, name = '') => {
    if (e) e.stopPropagation();
    setItemToDelete({ id, type, name })
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.type === 'room') {
        await apiFetch(`/rooms/${itemToDelete.id}`, { method: 'DELETE' })
      } else {
        await apiFetch(`/room-types/${itemToDelete.id}`, { method: 'DELETE' })
      }
      setIsDeleteModalOpen(false)
      setItemToDelete(null)
      fetchData()
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete: ' + err.message);
    }
  }

  const openRoomModal = (room = null) => {
    // Check if it's a real room (has ID) or just a preset for creation
    const isEdit = room && room.id;
    setEditRoom(isEdit ? room : null);

    if (isEdit) {
      setRoomFormData({
        roomTypeId: room.roomTypeId,
        roomNumber: room.roomNumber || ''
      })
    } else {
      setRoomFormData({
        roomTypeId: room?.roomTypeId || roomTypes[0]?.id || '',
        roomNumber: '',
        prefix: '',
        startNumber: '101',
        count: '10',
        isBulk: false
      })
    }
    setIsRoomModalOpen(true)
  }

  // Room Types
  const handleSubmitType = async (e) => {
    e.preventDefault()

    // Validation
    if (!typeFormData.name) return toast.error('Name is required');
    if (!typeFormData.price) return toast.error('Price is required');

    // Ensure Hotel ID
    let currentHotelId = typeFormData.hotelId;
    if (!currentHotelId) {
      currentHotelId = currentHotel?.id || (hotels.length > 0 ? hotels[0].id : null);
    }

    if (!currentHotelId) return toast.error('Error: No Hotel selected. Please create a hotel first.');

    try {
      const endpoint = editType ? `/room-types/${editType.id}` : '/room-types'
      const payload = {
        ...typeFormData,
        price: parseFloat(typeFormData.price),
        sizeSqm: parseInt(typeFormData.sizeSqm) || 0,
        maxAdults: parseInt(typeFormData.maxAdults) || 2,
        maxChildren: parseInt(typeFormData.maxChildren) || 0,
        isFeatured: typeFormData.isFeatured,
        hotelId: currentHotelId,
        images: typeFormData.images, // Explicitly include images
        icalUrl: typeFormData.icalUrl || null
      }

      console.log('Submitting Room Type:', payload); // DEBUG

      await apiFetch(endpoint, {
        method: editType ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      toast.success(editType ? 'Room Type Updated' : 'Room Type Created');
      setIsTypeModalOpen(false)
      fetchData()
    } catch (e) {
      console.error(e);
      if (e.status === 400 && e.message?.includes('limited')) {
        setIsTypeModalOpen(false);
        openUpgradeModal();
        return;
      }
      toast.error('Failed to save Room Type: ' + e.message)
    }
  }

  const openTypeModal = (type = null) => {
    setEditType(type)
    if (type) {
      setTypeFormData({
        name: type.name,
        price: type.basePrice || '',
        images: type.images || [],
        description: type.description || '',
        hotelId: type.hotelId || (currentHotel?.id || ''), // Use Data
        bedConfig: type.bedConfig || 'King Bed',
        sizeSqm: type.sizeSqm || '',
        maxAdults: type.maxAdults || 2,
        maxChildren: type.maxChildren || 0,
        isFeatured: type.isFeatured || false,
        amenities: type.amenities || [],
        icalUrl: type.icalUrl || ''
      })
    } else {
      setTypeFormData({
        name: '',
        price: '',
        images: [],
        description: '',
        hotelId: currentHotel?.id || (hotels.length > 0 ? hotels[0].id : ''), // Preference for current
        bedConfig: 'King Bed',
        sizeSqm: '',
        maxAdults: 2,
        maxChildren: 0,
        isFeatured: false,
        amenities: [],
        icalUrl: ''
      })
    }
    setIsTypeModalOpen(true)
  }

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Room Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage Rooms, Types, and Images</p>
        </div>
        <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'inventory' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            Room Inventory
          </button>
          <button
            onClick={() => setActiveTab('types')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'types' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            Room Types & Images
          </button>
        </div>
      </div>

      {/* Plan Limits Usage Indicators */}
      {currentHotel && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Room Limits</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                {rooms.length} <span className="text-sm font-normal text-slate-400">/ {currentHotel.maxRooms} used</span>
              </div>
            </div>
            <div className="w-1/2">
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${rooms.length >= currentHotel.maxRooms ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, (rooms.length / currentHotel.maxRooms) * 100)}%` }}
                />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Room Type Limits</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                {roomTypes.length} <span className="text-sm font-normal text-slate-400">/ {currentHotel.maxRoomTypes} used</span>
              </div>
            </div>
            <div className="w-1/2">
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${roomTypes.length >= currentHotel.maxRoomTypes ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, (roomTypes.length / currentHotel.maxRoomTypes) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Indicator */}
      {searchQuery && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
          <Search size={18} />
          <span>Showing results for: <strong>{searchQuery}</strong></span>
        </div>
      )}

      {/* --- INVENTORY TAB --- */}
      {activeTab === 'inventory' && (
        <>
          {!isReception && (
            <div className="flex justify-end mb-4">
              <button onClick={() => openRoomModal()} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
                <Plus size={18} /> Add Physical Room
              </button>
            </div>
          )}

          <div className="space-y-6">
            {filteredRoomTypes.map(type => {
              const typeRooms = getFilteredRooms(type.id);
              const isExpanded = expandedTypes[type.id];
              return (
                <div key={type.id} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden transition-all duration-300">
                  <div
                    className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => toggleAccordion(type.id)}
                  >
                    <div className="flex items-center gap-4">
                      <button className="text-slate-400 hover:text-slate-600 transition-colors">
                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      </button>

                      {type.images?.[0] && <img src={type.images[0]} className="w-10 h-10 rounded-lg object-cover" />}
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {type.name}
                          <span className="text-xs text-slate-400 font-normal">#{type.id.slice(-4)}</span>
                        </h3>
                        <p className="text-xs text-slate-500">{typeRooms.length} Rooms &bull; Max {type.maxAdults} Adults</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full">
                        {typeRooms.length} Rooms
                      </span>
                      <div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>
                      {!isReception && (
                        <button
                          onClick={(e) => { e.stopPropagation(); openRoomModal({ roomTypeId: type.id }); }}
                          className="text-emerald-600 hover:text-emerald-700 text-sm font-bold bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-500/20"
                        >
                          + Add Room
                        </button>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-1 duration-200">
                      {typeRooms.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                          {typeRooms.map(r => (
                            <div key={r.id} className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-between hover:shadow-md transition-shadow group">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 shadow-inner text-sm">
                                  {r.roomNumber}
                                </div>
                                <div onClick={(e) => { e.stopPropagation(); openRoomModal(r); }} className="cursor-pointer">
                                  <div className="font-bold text-sm text-slate-900 dark:text-white hover:text-emerald-500 transition-colors">Room {r.roomNumber}</div>
                                  {!isReception && (
                                    <div className="flex gap-1">
                                      <button onClick={(e) => { e.stopPropagation(); openRoomModal(r); }} className="p-1 text-slate-300 hover:text-blue-500"><Edit size={12} /></button>
                                      <button onClick={(e) => handleDeleteClick(e, r.id, 'room', r.roomNumber)} className="p-1 text-slate-300 hover:text-red-500"><Trash2 size={12} /></button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-1">
                                <select
                                  className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 transition-all
                                    ${(r.status === 'CLEAN' || r.status === 'INSPECTED') ? 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                                      r.status === 'DIRTY' ? 'bg-red-50 text-red-700 border-red-200 focus:ring-red-500 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' :
                                        r.status === 'CLEANING' ? 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-500 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' :
                                          r.status === 'OOO' ? 'bg-slate-100 text-slate-500 border-slate-200 focus:ring-slate-500 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600' :
                                            'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'
                                    }`}
                                  value={r.status || 'CLEAN'}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={async (e) => {
                                    e.stopPropagation();
                                    const newStatus = e.target.value;
                                    const oldStatus = r.status;

                                    // Optimistic
                                    const now = new Date().toISOString();
                                    setRooms(prev => prev.map(room =>
                                      room.id === r.id ? {
                                        ...room,
                                        status: newStatus,
                                        statusLogs: [{ createdAt: now }]
                                      } : room
                                    ));

                                    const tId = toast.loading('Updating...');
                                    try {
                                      await apiFetch(`/rooms/${r.id}/status`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ status: newStatus })
                                      });
                                      toast.dismiss(tId);
                                      fetchData();
                                    } catch (err) {
                                      console.error(err);
                                      toast.error('Failed', { id: tId });
                                      setRooms(prev => prev.map(room => room.id === r.id ? { ...room, status: oldStatus } : room));
                                    }
                                  }}
                                >
                                  <option value="DIRTY" className="bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200">Dirty</option>
                                  <option value="CLEANING" className="bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200">Cleaning</option>
                                  <option value="CLEAN" className="bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200">Clean (Done)</option>
                                  <option value="INSPECTED" className="bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200">Inspected (Ready)</option>
                                  <option value="OOO" className="bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200">Out of Order</option>
                                </select>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {r.statusLogs?.[0] ? timeAgo(r.statusLogs[0].createdAt) : ''}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-slate-400 italic bg-slate-50/50 dark:bg-slate-900/20">
                          {searchQuery ? 'No rooms match your search.' : 'No physical rooms added for this type yet.'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* --- ROOM TYPES TAB --- */}
      {activeTab === 'types' && (
        <>
          {!isReception && (
            <div className="flex justify-end mb-4">
              <button onClick={() => openTypeModal()} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                <Plus size={18} /> Add Room Type
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoomTypes.map(type => (
              <div key={type.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="h-48 bg-slate-100 dark:bg-slate-900 relative">
                  {type.images && type.images.length > 0 ? (
                    <img src={type.images[0]} className="w-full h-full object-cover" alt={type.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ImageIcon size={48} />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs font-bold backdrop-blur-md">
                    {type.images?.length || 0} Photos
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg dark:text-white line-clamp-1" title={type.name}>{type.name} <span className="text-xs text-slate-400 font-normal">#{type.id.slice(-4)}</span></h3>
                    <span className="text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg text-sm">
                      ฿{type.basePrice?.toLocaleString()}
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-3 min-h-[3rem]">
                    {type.description || 'No description available for this room type.'}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {type.bedConfig && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <BedDouble size={14} /> {type.bedConfig}
                      </span>
                    )}
                    {type.sizeSqm && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {type.sizeSqm}m²
                      </span>
                    )}
                    {(type.maxAdults > 0) && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Max {type.maxAdults} Adults
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 mt-auto">
                    {!isReception && (
                      <button
                        onClick={() => openTypeModal(type)}
                        className="flex-1 py-2.5 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-emerald-500 hover:text-white transition-all shadow-sm hover:shadow-emerald-500/25"
                      >
                        Edit Details
                      </button>
                    )}
                    {!isReception && (
                      <button
                        onClick={(e) => handleDeleteClick(e, type.id, 'type', type.name)}
                        className="px-4 py-2.5 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all shadow-sm hover:shadow-red-500/25"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )
      }

      {/* --- TYPE MODAL --- */}
      {
        isTypeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b dark:border-slate-700 flex justify-between">
                <h3 className="text-xl font-bold dark:text-white">{editType ? 'Edit Room Type' : 'New Room Type'}</h3>
                <button onClick={() => setIsTypeModalOpen(false)}><X className="text-slate-400" /></button>
              </div>
              <div className="p-6 space-y-6">

                {/* Row 1: Name & Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1 dark:text-slate-300">Name</label>
                    <input
                      type="text"
                      value={typeFormData.name}
                      onChange={e => setTypeFormData({ ...typeFormData, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                      placeholder="e.g. Deluxe Room"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold mb-1 dark:text-slate-300">
                      Base Price (THB)
                      <InfoTooltip content="Starting price per night. Seasonal rates can override this." />
                    </label>
                    <input
                      type="number"
                      value={typeFormData.price}
                      onChange={e => setTypeFormData({ ...typeFormData, price: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                      placeholder="e.g. 1500"
                    />
                  </div>
                </div>

                {/* Row 2: Bed & Size */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1 dark:text-slate-300">Bed Configuration</label>
                    <select
                      value={typeFormData.bedConfig}
                      onChange={e => setTypeFormData({ ...typeFormData, bedConfig: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    >
                      <option value="King Bed">King Bed</option>
                      <option value="Queen Bed">Queen Bed</option>
                      <option value="Twin Beds">Twin Beds</option>
                      <option value="Double Bed">Double Bed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 dark:text-slate-300">Room Size (sqm)</label>
                    <input
                      type="number"
                      value={typeFormData.sizeSqm}
                      onChange={e => setTypeFormData({ ...typeFormData, sizeSqm: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                      placeholder="e.g. 32"
                    />
                  </div>
                </div>

                {/* Row 3: Occupancy */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold mb-1 dark:text-slate-300">
                      Max Adults
                      <InfoTooltip content="Maximum number of adults allowed in this room type." />
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={typeFormData.maxAdults}
                      onChange={e => setTypeFormData({ ...typeFormData, maxAdults: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 dark:text-slate-300">Max Children</label>
                    <input
                      type="number"
                      min="0"
                      value={typeFormData.maxChildren}
                      onChange={e => setTypeFormData({ ...typeFormData, maxChildren: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Row 4: Amenities */}
                <div>
                  <label className="block text-sm font-bold mb-2 dark:text-slate-300">Room Amenities</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['Wi-Fi', 'Air Conditioning', 'TV', 'Minibar', 'Bathtub', 'Balcony', 'Safe', 'Hair Dryer', 'Desk'].map(amenity => (
                      <label key={amenity} className="flex items-center space-x-2 text-sm dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={typeFormData.amenities.includes(amenity)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTypeFormData(prev => ({ ...prev, amenities: [...prev.amenities, amenity] }))
                            } else {
                              setTypeFormData(prev => ({ ...prev, amenities: prev.amenities.filter(a => a !== amenity) }))
                            }
                          }}
                          className="rounded text-emerald-500 focus:ring-emerald-500"
                        />
                        <span>{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Gallery */}
                <div>
                  <label className="block text-sm font-bold mb-2 dark:text-slate-300">Gallery</label>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    {typeFormData.images.map((url, idx) => (
                      <div key={idx} className="aspect-square rounded-xl overflow-hidden relative group">
                        <img src={url} className="w-full h-full object-cover" />
                        <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                      </div>
                    ))}
                    <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors">
                      {uploading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div> : <Upload className="text-slate-400" />}
                      <span className="text-xs font-bold text-slate-400 mt-2">Add Photo</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={typeFormData.isFeatured}
                      onChange={(e) => setTypeFormData({ ...typeFormData, isFeatured: e.target.checked })}
                      className="rounded text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                    />
                    Display this room on Homepage (Featured)
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1 dark:text-slate-300">Description</label>
                  <textarea
                    value={typeFormData.description}
                    onChange={e => setTypeFormData({ ...typeFormData, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border dark:border-slate-600 dark:bg-slate-700 dark:text-white h-24"
                    placeholder="Describe the room experience..."
                  />
                </div>

                {/* iCal Channel Manager */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-500/30">
                  <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <Globe size={16} /> Channel Manager Sync (iCal)
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mb-4">
                    Sync availability with Agoda, Booking.com, Airbnb, etc. to prevent overbookings.
                  </p>

                  {editType && (
                    <div className="mb-4">
                      <label className="block text-xs font-bold mb-1 text-blue-800 dark:text-blue-300">Export Calendar (Paste this INTO Agoda)</label>
                      <input
                        type="text"
                        readOnly
                        value={typeof window !== 'undefined' ? `${window.location.origin}/api/ical/export/${currentHotel?.id}.ics` : ''}
                        className="w-full px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-700 bg-white/50 dark:bg-slate-800 text-xs font-mono text-slate-500 cursor-copy"
                        onClick={(e) => {
                          e.target.select();
                          navigator.clipboard.writeText(e.target.value);
                          toast.success('Copied Export URL!');
                        }}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold mb-1 text-blue-800 dark:text-blue-300">Import Calendar URL (Paste FROM Agoda)</label>
                    <input
                      type="url"
                      value={typeFormData.icalUrl}
                      onChange={e => setTypeFormData({ ...typeFormData, icalUrl: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-slate-800 text-sm"
                      placeholder="https://www.agoda.com/ical/..."
                    />
                  </div>
                </div>

                <button onClick={handleSubmitType} className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20">Save Changes</button>
              </div>
            </div>
          </div>
        )
      }

      {/* --- ROOM MODAL --- */}
      {
        isRoomModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-sm">
              <h3 className="text-xl font-bold mb-4 dark:text-white">{editRoom ? 'Edit Room' : 'Add Physical Room'}</h3>
              {/* Mode Toggle */}
              {!editRoom && (
                <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg mb-4">
                  <button
                    onClick={() => setRoomFormData({ ...roomFormData, isBulk: false })}
                    className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${!roomFormData.isBulk ? 'bg-white shadow text-emerald-600' : 'text-slate-500'}`}
                  >
                    Single Room
                  </button>
                  <button
                    onClick={() => setRoomFormData({ ...roomFormData, isBulk: true })}
                    className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${roomFormData.isBulk ? 'bg-white shadow text-emerald-600' : 'text-slate-500'}`}
                  >
                    Bulk Generate
                  </button>
                </div>
              )}

              {!roomFormData.isBulk ? (
                <>
                  <label className="block text-sm font-bold mb-1 dark:text-slate-300">Room Number</label>
                  <input
                    type="text"
                    className="w-full mb-4 px-4 py-2 border rounded-lg dark:bg-slate-700 dark:text-white dark:border-slate-600"
                    value={roomFormData.roomNumber}
                    onChange={e => setRoomFormData({ ...roomFormData, roomNumber: e.target.value })}
                    placeholder="e.g. 101, 204"
                  />
                </>
              ) : (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-bold mb-1 dark:text-slate-300">Prefix</label>
                    <input
                      type="text"
                      className="w-full px-2 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"
                      value={roomFormData.prefix}
                      onChange={e => setRoomFormData({ ...roomFormData, prefix: e.target.value })}
                      placeholder="Rm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 dark:text-slate-300">Start No.</label>
                    <input
                      type="number"
                      className="w-full px-2 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"
                      value={roomFormData.startNumber}
                      onChange={e => setRoomFormData({ ...roomFormData, startNumber: e.target.value })}
                      placeholder="101"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 dark:text-slate-300">Count</label>
                    <input
                      type="number"
                      className="w-full px-2 py-2 border rounded-lg dark:bg-slate-700 dark:text-white"
                      value={roomFormData.count}
                      onChange={e => setRoomFormData({ ...roomFormData, count: e.target.value })}
                      placeholder="10"
                    />
                  </div>
                  <div className="col-span-3 text-xs text-slate-500">
                    Example: Prefix "A", Start "101", Count "5" → A101, A102, A103, A104, A105
                  </div>
                </div>
              )}
              <label className="block text-sm font-bold mb-1 dark:text-slate-300">Room Type</label>
              <select
                className="w-full mb-4 px-4 py-2 border rounded-lg dark:bg-slate-700 dark:text-white dark:border-slate-600"
                value={roomFormData.roomTypeId}
                onChange={e => setRoomFormData({ ...roomFormData, roomTypeId: e.target.value })}
              >
                {roomTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <button onClick={handleSubmitRoom} className="w-full bg-emerald-500 text-white py-2 rounded-lg font-bold hover:bg-emerald-600 transition-colors">
                {editRoom ? 'Update Room' : 'Create Room'}
              </button>
              <button onClick={() => setIsRoomModalOpen(false)} className="w-full mt-2 text-slate-500 hover:text-slate-700">Cancel</button>
            </div>
          </div>
        )
      }

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {
        isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl transform transition-all scale-100">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                  <Trash2 size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2 dark:text-white">
                  Delete {itemToDelete?.type === 'type' ? 'Room Type' : 'Room'}?
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  Are you sure you want to delete <strong>{itemToDelete?.name || 'this item'}</strong>?
                  {itemToDelete?.type === 'type'
                    ? ' This may affect future availability and reports.'
                    : ' This action cannot be undone.'}
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 shadow-lg shadow-red-500/20 transition-colors"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </AdminLayout >
  )
}
