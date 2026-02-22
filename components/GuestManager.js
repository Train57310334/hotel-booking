import { useState, useRef } from 'react'
import { Plus, Trash2, CreditCard, Upload, ScanLine, Camera } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import Tesseract from 'tesseract.js'
import { parse } from 'mrz'
import toast from 'react-hot-toast'
import ConfirmationModal from '@/components/ConfirmationModal'

export default function GuestManager({ bookingId, guests, onUpdate }) {
    const [isAdding, setIsAdding] = useState(false)
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [scanning, setScanning] = useState(false)
    const [scanProgress, setScanProgress] = useState(0)
    const fileInputRef = useRef(null)
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, guestId: null })

    const [newGuest, setNewGuest] = useState({
        name: '',
        idType: 'passport',
        idNumber: '',
        documentUrl: ''
    })

    // Thai ID Validator & Fixer
    const validateThaiID = (id) => {
        if (!id || id.length !== 13) return false
        let sum = 0
        for (let i = 0; i < 12; i++) sum += parseFloat(id.charAt(i)) * (13 - i)
        const checkDigit = (11 - (sum % 11)) % 10
        return checkDigit === parseFloat(id.charAt(12))
    }

    const repairThaiID = (id) => {
        if (validateThaiID(id)) return id
        // Common OCR errors: 9 <-> 0, 1 <-> 7, 3 <-> 8
        const alternatives = { '0': '9', '9': '0', '1': '7', '7': '1', '3': '8', '8': '3' }
        for (let i = 0; i < 13; i++) {
            const char = id[i]
            if (alternatives[char]) {
                const newId = id.substring(0, i) + alternatives[char] + id.substring(i + 1)
                if (validateThaiID(newId)) return newId
            }
        }
        return id
    }

    // MRZ Parsing Helper
    const parseOCRResult = (text) => {
        console.log("OCR Text:", text) // Debugging

        // 1. Try to find MRZ lines (Passports have 2 lines of 44 chars usually)
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5)
        const mrzLines = lines.filter(l => l.length >= 30 && (l.startsWith('P<') || l.startsWith('V<') || l.match(/^[A-Z0-9<]+$/)))

        if (mrzLines.length >= 2) {
            // Very basic heuristic: take the last two reasonably long lines looking like MRZ
            const line2 = mrzLines[mrzLines.length - 1]
            const line1 = mrzLines[mrzLines.length - 2]

            try {
                // Clean common OCR errors in MRZ
                // Standard MRZ is 44 chars for Passport (TD3)
                const cleanLine = (l) => l.replace(/ /g, '').toUpperCase()

                const result = parse([cleanLine(line1), cleanLine(line2)])
                if (result.valid || result.fields.surname) {
                    return {
                        name: `${result.fields.firstName} ${result.fields.surname}`.replace(/<+/g, ' ').trim(),
                        idNumber: result.fields.documentNumber,
                        idType: 'passport'
                    }
                }
            } catch (e) {
                console.log("MRZ Parse Error", e)
            }
        }

        // 2. Fallback: Thai ID Card (13 Digits)
        const cleanText = text
            .replace(/O/g, '0')
            .replace(/[Il]/g, '1')
            .replace(/S/g, '5')
            .replace(/B/g, '8')

        const looseRegex = /\d[\s-]?\d{4}[\s-]?\d{5}[\s-]?\d{2}[\s-]?\d/g
        let matches = []
        let match
        while ((match = looseRegex.exec(cleanText)) !== null) {
            matches.push(match[0])
        }

        if (matches.length > 0) {
            const scored = matches.map(raw => {
                let score = 0
                if (raw.includes(' ') || raw.includes('-')) score += 10
                if (['1', '2', '3', '4', '5', '6', '7', '8'].includes(raw[0])) score += 5

                const digits = raw.replace(/[^\d]/g, '')
                if (digits.length === 13) return { raw, digits, score }
                return null
            }).filter(Boolean).sort((a, b) => b.score - a.score)

            if (scored.length > 0) {
                const best = scored[0]
                console.log("OCR Candidates:", scored)

                // Repair ID
                const finalID = repairThaiID(best.digits)

                // Improved Name Extraction (Neme/Nome/Mo.)
                // 1. Regex for First Name (Exclude newlines)
                const nameRegex = /(?:Name|Neme|Nome)\s+(?:Mr\.|Mrs\.|Miss|Master|Ms\.)?\s*([A-Za-z ]+)/i
                // 2. Regex for Last Name (Exclude newlines)
                const lastNameRegex = /(?:Last\s*name|Lastname)\s*([A-Za-z0-9 ]+)/i

                const nameMatch = text.match(nameRegex)
                const lastNameMatch = text.match(lastNameRegex)

                let fullName = ''
                if (nameMatch) fullName += nameMatch[1].trim()

                if (lastNameMatch) {
                    // Fix common OCR errors (0->o, 5->s) instead of just removing digits
                    const rawLast = lastNameMatch[1]
                        .replace(/0/g, 'o')
                        .replace(/5/g, 's')
                        .replace(/1/g, 'l')
                        .trim()
                    fullName += ' ' + rawLast
                }

                // Helper to Title Case
                const toTitleCase = (str) => {
                    return str.toLowerCase().split(' ').map(word => {
                        return word.charAt(0).toUpperCase() + word.slice(1)
                    }).join(' ')
                }

                return {
                    idNumber: finalID,
                    idType: 'national_id',
                    name: toTitleCase(fullName.trim())
                }
            }
        }

        return null
    }

    // Handle file upload & Scan
    const handleFileUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        // 1. Upload Immediately
        const formData = new FormData()
        formData.append('file', file)

        setUploading(true)
        setScanning(true)
        setScanProgress(0)

        // Parallel Process: Upload + OCR
        try {
            // A. Upload Process
            const uploadPromise = async () => {
                const token = localStorage.getItem('token')
                // Fix: Use consistent API_BASE from env or localhost default
                const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api'

                const res = await fetch(`${API_BASE}/guests/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                })
                if (!res.ok) throw new Error('Upload failed')
                return await res.json()
            }

            // B. OCR Process
            const ocrPromise = async () => {
                const worker = await Tesseract.createWorker('eng', 1, {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setScanProgress(Math.floor(m.progress * 100))
                        }
                    }
                })

                await worker.setParameters({
                    tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.< ',
                })

                const { data: { text } } = await worker.recognize(file)
                await worker.terminate()

                return { data: { text } }
            }

            const [uploadResult, ocrResult] = await Promise.all([
                uploadPromise(),
                ocrPromise()
            ])

            // Update State with Upload URL
            setNewGuest(prev => ({
                ...prev,
                documentUrl: uploadResult.url
            }))

            // Attempt to Auto-fill from OCR
            const scannedData = parseOCRResult(ocrResult.data.text)
            if (scannedData) {
                setNewGuest(prev => ({
                    ...prev,
                    idType: scannedData.idType,
                    idNumber: scannedData.idNumber || prev.idNumber,
                    name: scannedData.name || prev.name
                }))
                toast.success(`Scanned: ${scannedData.name || 'ID Number Found'}`, { duration: 4000 })
            } else {
                toast.error('Could not find ID details. Please tap to fill manually.', { duration: 5000 })
                console.log("OCR Failed to parse:", ocrResult.data.text)
            }

        } catch (error) {
            console.error('Process Error:', error)
            toast.error('Error processing document')
        } finally {
            setUploading(false)
            setScanning(false)
        }
    }

    // Add guest to backend
    const handleAddGuest = async () => {
        if (!newGuest.name) return

        setLoading(true)
        try {
            await apiFetch('/guests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newGuest, bookingId })
            })
            setIsAdding(false)
            setNewGuest({ name: '', idType: 'passport', idNumber: '', documentUrl: '' })
            if (onUpdate) onUpdate()
        } catch (error) {
            console.error(error)
            toast.error('Failed to add guest')
        } finally {
            setLoading(false)
        }
    }

    // Remove guest
    const handleRemoveClick = (guestId) => {
        setConfirmModal({ isOpen: true, guestId })
    }

    const handleRemoveGuest = async () => {
        if (!confirmModal.guestId) return

        try {
            await apiFetch(`/guests/${confirmModal.guestId}`, { method: 'DELETE' })
            toast.success('Guest removed')
            if (onUpdate) onUpdate()
        } catch (error) {
            console.error(error)
            toast.error('Failed to remove guest')
        } finally {
            setConfirmModal({ isOpen: false, guestId: null })
        }
    }

    return (
        <div className="mt-8 border-t border-slate-100 dark:border-slate-700 pt-6">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
                    <CreditCard size={16} /> Guest Verification & Check-in
                </h4>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 transition-colors"
                >
                    {isAdding ? 'Cancel' : '+ Add Guest'}
                </button>
            </div>

            <div className="space-y-3">
                {/* Existing Guests List */}
                {guests && guests.length > 0 ? (
                    guests.map(guest => (
                        <div key={guest.id} className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl flex justify-between items-center border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-600 flex items-center justify-center text-slate-500 text-sm font-bold border border-slate-100 dark:border-slate-500 shadow-sm">
                                    {guest.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{guest.name}</p>
                                    <p className="text-xs text-slate-500 capitalize">{guest.idType} • {guest.idNumber || 'No ID'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {guest.documentUrl && (
                                    <a
                                        href={`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api'}${guest.documentUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100"
                                    >
                                        View Doc
                                    </a>
                                )}
                                <button
                                    onClick={() => handleRemoveClick(guest.id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    !isAdding && <p className="text-sm text-slate-400 italic text-center py-4">No guests registered yet.</p>
                )}

                {/* Add Guest Form */}
                {isAdding && (
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-600">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            {/* Scan Button (Mobile Friendly) */}
                            <div className="md:col-span-2 mb-2">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={scanning || uploading}
                                    className="w-full py-3 bg-blue-50 text-blue-600 rounded-lg border-2 border-dashed border-blue-200 hover:bg-blue-100 transition-all flex items-center justify-center gap-2 font-bold"
                                >
                                    {scanning ? (
                                        <>
                                            <ScanLine className="animate-pulse" size={18} />
                                            Scanning... {scanProgress > 0 && `${scanProgress}%`}
                                        </>
                                    ) : (
                                        <>
                                            <Camera size={18} /> Scan Passport / ID & Upload
                                        </>
                                    )}
                                </button>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </div>

                            <input
                                type="text"
                                placeholder="Full Name"
                                className="p-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                value={newGuest.name}
                                onChange={e => setNewGuest({ ...newGuest, name: e.target.value })}
                            />
                            <select
                                className="p-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                value={newGuest.idType}
                                onChange={e => setNewGuest({ ...newGuest, idType: e.target.value })}
                            >
                                <option value="passport">Passport</option>
                                <option value="national_id">National ID Card</option>
                                <option value="driving_license">Driving License</option>
                            </select>
                            <input
                                type="text"
                                placeholder="ID Number"
                                className="p-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                value={newGuest.idNumber}
                                onChange={e => setNewGuest({ ...newGuest, idNumber: e.target.value })}
                            />

                            {/* Upload Status */}
                            {newGuest.documentUrl && (
                                <p className="text-xs text-emerald-600 flex items-center gap-1 md:col-span-2">
                                    <Upload size={12} /> Document attached
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleAddGuest}
                            disabled={loading || !newGuest.name}
                            className="w-full py-2 bg-emerald-500 text-white rounded-lg font-bold text-sm hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : 'Save Guest'}
                        </button>
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, guestId: null })}
                onConfirm={handleRemoveGuest}
                title="Remove Guest"
                message="Are you sure you want to remove this guest?"
                type="danger"
                confirmText="Remove"
            />
        </div>
    )
}
