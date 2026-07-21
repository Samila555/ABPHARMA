import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { FiDownload, FiInfo, FiCopy } from 'react-icons/fi';
import { MdQrCode } from 'react-icons/md';
import toast from 'react-hot-toast';

export default function QRManagement() {
    // Use current origin for QR code URL to point to customer website
    const targetUrl = window.location.origin;
    const qrRef = useRef(null);

    const downloadQR = () => {
        const canvas = qrRef.current.querySelector('canvas');
        if (!canvas) return;
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = 'abpharma-store-qr.png';
        a.click();
        toast.success('QR Code downloaded!');
    };

    const copyUrl = () => {
        navigator.clipboard.writeText(targetUrl);
        toast.success('URL copied to clipboard!');
    };

    return (
        <div className="space-y-5 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">QR Code Generator</h1>
                <p className="text-slate-500 text-sm">Generate and download QR codes for physical store placement</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-8 flex flex-col items-center justify-center text-center bg-gradient-to-b from-white to-sky-50/50">
                    <div ref={qrRef} className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 mb-6">
                        <QRCodeCanvas
                            value={targetUrl}
                            size={250}
                            level="H"
                            imageSettings={{
                                src: '/logo192.png', // Fallback internal logo if present, else just a visual QR
                                x: undefined, y: undefined, height: 40, width: 40, excavate: true,
                            }}
                            fgColor="#0369a1" // Sky 700
                        />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-1">Scan to Browse & Order</h2>
                    <p className="text-slate-500 text-sm mb-6 max-w-xs">Place this QR code on your pharmacy counter or windows.</p>

                    <button onClick={downloadQR} className="btn-primary py-2.5 px-6 w-full justify-center">
                        <FiDownload size={18} /> Download High-Res QR
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="card p-5 border-l-4 border-l-sky-500">
                        <div className="flex items-start gap-3">
                            <FiInfo className="text-sky-500 mt-0.5 text-xl" />
                            <div>
                                <h3 className="font-semibold text-slate-800">How to use</h3>
                                <p className="text-sm text-slate-600 mt-1">1. Download the QR code image.<br />2. Print it on a sticker or display stand.<br />3. Customers scan it with their phone camera to instantly access the online pharmacy.<br />4. Customers can search medicines, view details, and place orders directly from their phones inside the store.</p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-5">
                        <h3 className="font-semibold text-slate-800 mb-3">Destination URL</h3>
                        <div className="flex items-center gap-2">
                            <input type="text" readOnly value={targetUrl} className="form-input bg-slate-50 flex-1 text-slate-500" />
                            <button onClick={copyUrl} className="btn-outline px-3" title="Copy URL">
                                <FiCopy size={16} />
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">This is the link the QR code points to. It automatically uses your current domain.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
