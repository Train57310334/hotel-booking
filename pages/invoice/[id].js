import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Printer, ArrowLeft, Download } from 'lucide-react';
import Head from 'next/head';

export default function InvoicePage() {
    const router = useRouter();
    const { id } = router.query;
    const { user, loading: authLoading } = useAuth();
    const [invoiceData, setInvoiceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id || authLoading) return;

        if (!user) {
            router.push('/auth/login?redirect=' + encodeURIComponent(router.asPath));
            return;
        }

        const fetchInvoice = async () => {
            try {
                const data = await apiFetch(`/bookings/${id}/invoice`);
                setInvoiceData(data);
            } catch (err) {
                console.error("Failed to load invoice:", err);
                setError(err.message || 'Failed to load invoice');
            } finally {
                setLoading(false);
            }
        };

        fetchInvoice();
    }, [id, user, authLoading, router]);

    const handlePrint = () => {
        window.print();
    };

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !invoiceData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-500">
                <p className="text-xl font-bold text-slate-800 mb-2">Oops!</p>
                <p>{error || 'Invoice not found'}</p>
                <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">Go Back</button>
            </div>
        );
    }

    const { invoiceId, date, hotel, guest, stay, lineItems, summary } = invoiceData;

    return (
        <div className="min-h-screen bg-slate-100 print:bg-white pb-20">
            <Head>
                <title>Invoice - {invoiceId}</title>
            </Head>

            {/* Non-Printable Header Actions */}
            <div className="max-w-4xl mx-auto px-4 py-8 print:hidden flex justify-between items-center">
                <button 
                    onClick={() => window.close()}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors"
                >
                    <ArrowLeft size={18} /> Close Window
                </button>
                <div className="flex gap-3">
                    <button 
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
                    >
                        <Printer size={18} /> Print Invoice
                    </button>
                </div>
            </div>

            {/* Printable A4 Container */}
            <div className="max-w-4xl mx-auto bg-white shadow-xl print:shadow-none print:max-w-full overflow-hidden sm:rounded-2xl">
                
                {/* Header Section */}
                <div className="p-8 md:p-12 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start gap-8">
                    <div>
                        {hotel?.logoUrl ? (
                            <img src={hotel.logoUrl} alt={hotel.name} className="h-16 w-auto object-contain mb-4" />
                        ) : (
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2 uppercase">{hotel?.name || 'BookingKub'}</h1>
                        )}
                        <p className="text-sm text-slate-500 max-w-[250px] leading-relaxed">
                            {hotel?.address || 'Hotel Address Not Provided'}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            {hotel?.phone && <span>Tel: {hotel.phone} </span>}
                            {hotel?.taxId && <span>• Tax ID: {hotel.taxId}</span>}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            {hotel?.email && <span>Email: {hotel.email}</span>}
                        </p>
                    </div>

                    <div className=" md:text-right">
                        <h2 className="text-4xl font-black text-indigo-600 tracking-tighter mb-2 uppercase">INVOICE</h2>
                        <div className="flex flex-col gap-1 text-sm md:items-end">
                            <div className="flex justify-between md:justify-end gap-8">
                                <span className="text-slate-500 font-medium">Invoice No:</span>
                                <span className="font-bold text-slate-900 border-b border-dashed border-slate-300">{invoiceId}</span>
                            </div>
                            <div className="flex justify-between md:justify-end gap-8">
                                <span className="text-slate-500 font-medium">Date:</span>
                                <span className="font-bold text-slate-900">{new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Billed To</h3>
                        <p className="text-lg font-bold text-slate-900 mb-1">{guest.name}</p>
                        <p className="text-sm text-slate-600 mb-1">{guest.email}</p>
                        <p className="text-sm text-slate-600">{guest.phone}</p>
                    </div>
                    <div className="md:text-right">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Stay Details</h3>
                        <div className="flex flex-col gap-2 md:items-end">
                            <p className="text-sm"><span className="text-slate-500">Check-in:</span> <span className="font-bold">{new Date(stay.checkIn).toLocaleDateString('en-GB')}</span></p>
                            <p className="text-sm"><span className="text-slate-500">Check-out:</span> <span className="font-bold">{new Date(stay.checkOut).toLocaleDateString('en-GB')}</span></p>
                            <p className="text-sm"><span className="text-slate-500">Guests:</span> <span className="font-bold">{stay.guests}</span></p>
                            <p className="text-sm"><span className="text-slate-500">Room:</span> <span className="font-bold">{stay.roomNumber} ({stay.nights} Nights)</span></p>
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <div className="p-8 md:p-12">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-slate-200">
                                <th className="py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                                <th className="py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Qty</th>
                                <th className="py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {lineItems.map((item, idx) => (
                                <tr key={idx} className="group">
                                    <td className="py-5 font-medium text-slate-800">{item.description}</td>
                                    <td className="py-5 text-center text-slate-600">{item.quantity}</td>
                                    <td className="py-5 text-right font-bold text-slate-900">
                                        ฿{item.amount.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals Section */}
                    <div className="mt-8 flex justify-end">
                        <div className="w-full md:w-1/2 rounded-2xl bg-slate-50 p-6 border border-slate-100">
                            <div className="flex justify-between items-center mb-3 text-slate-600">
                                <span className="text-sm font-medium">Subtotal</span>
                                <span className="font-bold">฿{(summary.subtotal || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center mb-4 text-slate-600">
                                <span className="text-sm font-medium">Tax & Fees (7% VAT)</span>
                                <span className="font-bold">฿{(summary.tax || 0).toLocaleString()}</span>
                            </div>
                            <div className="pt-4 border-t-2 border-slate-200 flex justify-between items-center">
                                <span className="text-base font-bold text-slate-900 uppercase">Grand Total</span>
                                <span className="text-3xl font-black text-indigo-600 tracking-tight">฿{(summary.total || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="p-8 md:p-12 text-center text-sm text-slate-500 border-t border-slate-100 bg-slate-50">
                    <p className="font-medium text-slate-700 mb-1">Thank you for your business!</p>
                    <p>If you have any questions concerning this invoice, please contact the hotel directly.</p>
                </div>
            </div>

            {/* Print Styles injected locally */}
            <style jsx global>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        background-color: white !important;
                    }
                    nav, header, aside, .sidebar { display: none !important; }
                }
            `}</style>
        </div>
    );
}
