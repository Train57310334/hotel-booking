// components/PromptPayQR.js
// Generates a real Thai PromptPay EMV QR Code using promptpay-qr + qrcode
// promptPayId: phone number (0812345678) or tax ID (0123456789012)
// amount: number in THB (optional — QR WITHOUT amount is always preferred for hotels)
import { useEffect, useRef, useState } from 'react';

const generatePromptPayPayload = (promptPayId, amount) => {
    try {
        // PromptPay EMV QR payload builder
        // Spec: EMVCo Merchant Presented QR Code
        const sanitized = promptPayId.replace(/[-\s]/g, '');
        const isPhone = /^[0-9]{10}$/.test(sanitized);
        const isTaxId = /^[0-9]{13}$/.test(sanitized);

        let accountIdentifier;
        if (isPhone) {
            // Phone: prefix 0066 instead of leading 0
            accountIdentifier = '0066' + sanitized.slice(1);
        } else if (isTaxId) {
            accountIdentifier = sanitized;
        } else {
            throw new Error('Invalid PromptPay ID format');
        }

        const format = (id, value) => {
            const len = String(value.length).padStart(2, '0');
            return `${id}${len}${value}`;
        };

        const aid = '0416A000000677010111';
        const merchantAccountInfo = format('00', aid) + format('01', accountIdentifier);
        const giinField = format('29', merchantAccountInfo);

        let payload =
            format('00', '01') +           // Payload format indicator
            format('01', '12') +           // Point of initiation (12 = static, 11 = dynamic)
            giinField +
            format('52', '0000') +         // Merchant Category Code
            format('53', '764') +          // Currency: 764 = THB
            (amount ? format('54', amount.toFixed(2)) : '') + // Amount (optional)
            format('58', 'TH') +           // Country code
            format('59', 'N/A') +          // Merchant name
            format('60', 'Bangkok');       // City

        // CRC16 checksum
        const crc = format('63', '0000');
        payload = payload + crc;

        // Calculate real CRC16
        const crcValue = crc16(payload.slice(0, -4));
        return payload.slice(0, -4) + format('63', crcValue.toString(16).toUpperCase().padStart(4, '0'));
    } catch (e) {
        console.error('PromptPay payload error:', e);
        return null;
    }
};

const crc16 = (str) => {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
        crc ^= str.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            if (crc & 0x8000) crc = (crc << 1) ^ 0x1021;
            else crc <<= 1;
            crc &= 0xFFFF;
        }
    }
    return crc;
};

export default function PromptPayQR({ promptPayId, amount, hotelName }) {
    const canvasRef = useRef(null);
    const [error, setError] = useState(null);
    const [dataUrl, setDataUrl] = useState(null);

    useEffect(() => {
        if (!promptPayId) {
            setError('PromptPay ID not configured');
            return;
        }

        const generateQR = async () => {
            try {
                let qrcode;
                try {
                    // Try to use the promptpay-qr library first (cleaner)
                    const generatePayload = (await import('promptpay-qr')).default;
                    qrcode = generatePayload(promptPayId, { amount });
                } catch {
                    // Fallback to manual builder
                    qrcode = generatePromptPayPayload(promptPayId, amount);
                }

                if (!qrcode) throw new Error('Could not generate QR payload');

                // Render as data URL using qrcode library
                const QRCode = (await import('qrcode')).default;
                const url = await QRCode.toDataURL(qrcode, {
                    width: 240,
                    margin: 2,
                    color: { dark: '#1e293b', light: '#ffffff' },
                    errorCorrectionLevel: 'M',
                });
                setDataUrl(url);
                setError(null);
            } catch (e) {
                console.error('QR generation failed:', e);
                setError('Failed to generate QR code');
            }
        };

        generateQR();
    }, [promptPayId, amount]);

    if (error) {
        return (
            <div className="w-60 h-60 mx-auto flex flex-col items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 text-center p-4">
                <span className="text-3xl mb-2">⚠️</span>
                <p className="text-sm font-medium">{error}</p>
                {!promptPayId && (
                    <p className="text-xs mt-1 text-slate-400">Please configure PromptPay ID in hotel settings</p>
                )}
            </div>
        );
    }

    if (!dataUrl) {
        return (
            <div className="w-60 h-60 mx-auto flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-3">
            {/* QR Container with Thai PromptPay branding */}
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 relative">
                {/* PromptPay header badge */}
                <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="flex gap-0.5">
                        <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
                        <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
                    </div>
                    <span className="text-xs font-extrabold text-slate-600 tracking-widest uppercase">PromptPay</span>
                </div>

                {/* Real QR Code */}
                <img
                    src={dataUrl}
                    alt="PromptPay QR Code"
                    className="w-56 h-56 mx-auto"
                />

                {/* Amount overlay at bottom */}
                {amount && (
                    <div className="mt-3 bg-emerald-50 rounded-xl px-4 py-2 text-center border border-emerald-100">
                        <p className="text-xs text-slate-500">Amount</p>
                        <p className="text-xl font-extrabold text-emerald-700">
                            ฿{amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                )}
            </div>

            {/* Hotel name & PromptPay ID */}
            <div className="text-center">
                <p className="font-bold text-slate-900">{hotelName || 'Hotel'}</p>
                <p className="text-sm text-slate-500">
                    PromptPay: <span className="font-mono">{promptPayId}</span>
                </p>
            </div>
        </div>
    );
}
