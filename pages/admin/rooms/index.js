import AdminLayout from '@/components/AdminLayout'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { Search, Plus, BedDouble, Trash2, Edit, Upload, X, Check, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RoomManagement() {
  const [activeTab, setActiveTab] = useState('inventory') // 'inventory' | 'types'
  const [rooms, setRooms] = useState([])
  const [roomTypes, setRoomTypes] = useState([])
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false)
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false)

  // Generic Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null) // { id, type: 'room' | 'type', name }

  const [editRoom, setEditRoom] = useState(null)
  const [editType, setEditType] = useState(null)

  // Form States
  const [roomFormData, setRoomFormData] = useState({ roomTypeId: '' })
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
    amenities: [] // Array of strings
  })

  // Upload State
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [rData, tData, hData] = await Promise.all([
        apiFetch('/rooms'),
        apiFetch('/room-types'),
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
        setTypeFormData(prev => ({ ...prev, hotelId: hData[0].id }))
      }
    } catch (error) { console.error(error) } finally { setLoading(false) }
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
      alert('Upload Error: ' + error.message)
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
      alert('Error: No Room Type selected');
      return;
    }
    if (!roomFormData.roomNumber) {
      alert('Error: Room Number is required');
      return;
    }

    try {
      const endpoint = editRoom ? `/rooms/${editRoom.id}` : '/rooms'

      await apiFetch(endpoint, {
        method: editRoom ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomFormData)
      })
      setIsRoomModalOpen(false)
      fetchData()
    } catch (e) {
      console.error(e);
      alert('Failed to save room: ' + e.message);
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
      alert('Failed to delete: ' + err.message);
    }
  }

  const openRoomModal = (room = null) => {
    setEditRoom(room)
    if (room) {
      setRoomFormData({
        roomTypeId: room.roomTypeId,
        roomNumber: room.roomNumber || ''
      })
    } else {
      setRoomFormData({
        roomTypeId: roomTypes[0]?.id || '',
        roomNumber: ''
      })
    }
    setIsRoomModalOpen(true)
  }

  // Room Types
  const handleSubmitType = async (e) => {
    e.preventDefault()

    // Validation
    if (!typeFormData.name) return alert('Name is required');
    if (!typeFormData.price) return alert('Price is required');

    // Ensure Hotel ID
    let currentHotelId = typeFormData.hotelId;
    if (!currentHotelId && hotels.length > 0) {
      currentHotelId = hotels[0].id;
    }
    if (!currentHotelId) return alert('Error: No Hotel selected. Please create a hotel first.');

    try {
      const endpoint = editType ? `/room-types/${editType.id}` : '/room-types'
      const payload = {
        ...typeFormData,
        price: parseFloat(typeFormData.price),
        sizeSqm: parseInt(typeFormData.sizeSqm) || 0,
        maxAdults: parseInt(typeFormData.maxAdults) || 2,
        maxChildren: parseInt(typeFormData.maxChildren) || 0,
        isFeatured: typeFormData.isFeatured,
        hotelId: currentHotelId
      }

      console.log('Submitting Room Type:', payload); // DEBUG

      await apiFetch(endpoint, {
        method: editType ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      alert(editType ? 'Room Type Updated' : 'Room Type Created');
      setIsTypeModalOpen(false)
      fetchData()
    } catch (e) {
      console.error(e);
      alert('Failed to save Room Type: ' + e.message)
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
        hotelId: type.hotelId || (hotels.length > 0 ? hotels[0].id : ''),
        bedConfig: type.bedConfig || 'King Bed',
        sizeSqm: type.sizeSqm || '',
        maxAdults: type.maxAdults || 2,
        maxChildren: type.maxChildren || 0,
        isFeatured: type.isFeatured || false,
        amenities: type.amenities || []
      })
    } else {
      setTypeFormData({
        name: '',
        price: '',
        images: [],
        description: '',
        hotelId: hotels.length > 0 ? hotels[0].id : '',
        bedConfig: 'King Bed',
        sizeSqm: '',
        maxAdults: 2,
        maxChildren: 0,
        isFeatured: false,
        amenities: []
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

      {/* --- INVENTORY TAB --- */}
      {activeTab === 'inventory' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => openRoomModal()} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
              <Plus size={18} /> Add Physical Room
            </button>
          </div>

          <div className="space-y-6">
            {roomTypes.map(type => {
              const typeRooms = rooms.filter(r => r.roomTypeId === type.id).sort((a, b) => (a.roomNumber || '').localeCompare(b.roomNumber || ''));
              return (
                <div key={type.id} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {type.images?.[0] && <img src={type.images[0]} className="w-10 h-10 rounded-lg object-cover" />}
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">{type.name} <span className="text-xs text-slate-400 font-normal">#{type.id.slice(-4)}</span></h3>
                        <p className="text-xs text-slate-500">{typeRooms.length} Rooms &bull; Max {type.maxAdults} Adults</p>
                      </div>
                    </div>
                    <button onClick={() => openRoomModal({ roomTypeId: type.id })} className="text-emerald-600 hover:text-emerald-700 text-sm font-bold bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                      + Add Room
                    </button>
                  </div>

                  {typeRooms.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                      {typeRooms.map(r => (
                        <div key={r.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 shadow-inner">
                              {r.roomNumber}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white">Room {r.roomNumber}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${(r.status || 'clean') === 'clean' ? 'bg-emerald-100 text-emerald-700' :
                                  (r.status || 'clean') === 'occupied' ? 'bg-blue-100 text-blue-700' :
                                    'bg-amber-100 text-amber-700'
                                  }`}>
                                  {r.status || 'Available'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400">ID: #{r.id.slice(-4)}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Status Toggle Mockup - Functional in next step if needed */}
                            <select
                              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium"
                              value={r.status || 'clean'}
                              onChange={async (e) => {
                                const newStatus = e.target.value;
                                // Optimistic Update
                                const oldRooms = [...rooms];
                                setRooms(prev => prev.map(room => room.id === r.id ? { ...room, status: newStatus } : room));

                                const tId = toast.loading('Updating status...');
                                try {
                                  await apiFetch(`/rooms/${r.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ ...r, status: newStatus })
                                  });
                                  toast.success('Status updated', { id: tId });
                                } catch (err) {
                                  console.error(err);
                                  toast.error('Failed to update', { id: tId });
                                  setRooms(oldRooms); // Revert
                                }
                              }}
                            >
                              <option value="clean">Available (Clean)</option>
                              <option value="occupied">Occupied</option>
                              <option value="dirty">Dirty / Maintenance</option>
                            </select>

                            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

                            <button onClick={() => openRoomModal(r)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors" title="Edit Room">
                              <Edit size={16} />
                            </button>
                            <button onClick={(e) => handleDeleteClick(e, r.id, 'room', r.roomNumber)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Delete Room">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400 italic bg-slate-50/50 dark:bg-slate-900/20">
                      No physical rooms added for this type yet.
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
          <div className="flex justify-end mb-4">
            <button onClick={() => openTypeModal()} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
              <Plus size={18} /> Add Room Type
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roomTypes.map(type => (
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
                    <button
                      onClick={() => openTypeModal(type)}
                      className="flex-1 py-2.5 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-emerald-500 hover:text-white transition-all shadow-sm hover:shadow-emerald-500/25"
                    >
                      Edit Details
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, type.id, 'type', type.name)}
                      className="px-4 py-2.5 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all shadow-sm hover:shadow-red-500/25"
                    >
                      <Trash2 size={18} />
                    </button>
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
                    <label className="block text-sm font-bold mb-1 dark:text-slate-300">Base Price (THB)</label>
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
                    <label className="block text-sm font-bold mb-1 dark:text-slate-300">Max Adults</label>
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
              <label className="block text-sm font-bold mb-1 dark:text-slate-300">Room Number</label>
              <input
                type="text"
                className="w-full mb-4 px-4 py-2 border rounded-lg dark:bg-slate-700 dark:text-white dark:border-slate-600"
                value={roomFormData.roomNumber}
                onChange={e => setRoomFormData({ ...roomFormData, roomNumber: e.target.value })}
                placeholder="e.g. 101, 204"
              />
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
