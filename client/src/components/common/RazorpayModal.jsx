import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, CreditCard, Smartphone, Building, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RazorpayModal({ isOpen, onClose, amount = 1199, bookingDetails = {}, onSuccess }) {
  const [method, setMethod] = useState('upi');
  const [upiId, setUpiId] = useState('customer@okhdfcbank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Fire celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        setIsSuccess(false);
        onSuccess({
          paymentId: `pay_RZP_${Math.floor(100000000 + Math.random() * 900000000)}`,
          amount,
          method
        });
        onClose();
      }, 1400);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Razorpay Brand Header */}
        <div className="bg-[#0c2340] px-5 py-4 border-b border-blue-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white text-sm">
              ₹
            </div>
            <div>
              <div className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                SkillServe Marketplace
              </div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                Razorpay Secure Checkout
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount bar */}
        <div className="px-6 py-4 bg-slate-950 flex items-center justify-between border-b border-slate-800">
          <div>
            <span className="text-[11px] text-slate-400 font-medium uppercase block">Total Payable</span>
            <span className="text-xs text-slate-300">{bookingDetails.serviceTitle || 'Service Booking'}</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black font-display text-emerald-400">
              ₹{amount.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-500 block">Incl. GST & Tier Guarantee</span>
          </div>
        </div>

        {/* Success Screen */}
        {isSuccess ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-500/20 border-2 border-emerald-400 rounded-full flex items-center justify-center text-emerald-400 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-white">Payment Pre-Authorized!</h3>
            <p className="text-xs text-slate-400">
              Funds held safely in escrow. Released only after customer sign-off.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Payment Method Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('upi')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  method === 'upi'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                    : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                UPI Apps
              </button>

              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  method === 'card'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                    : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Cards
              </button>

              <button
                type="button"
                onClick={() => setMethod('netbanking')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  method === 'netbanking'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                    : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building className="w-4 h-4" />
                Netbanking
              </button>
            </div>

            {/* UPI Option */}
            {method === 'upi' && (
              <div className="space-y-3">
                <div className="flex gap-2 text-xs">
                  {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                    <span key={app} className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                      {app}
                    </span>
                  ))}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">
                    Virtual Payment Address (VPA / UPI ID)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder="name@upi"
                  />
                </div>
              </div>
            )}

            {/* Card Option */}
            {method === 'card' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Card Number</label>
                  <input
                    type="text"
                    disabled
                    value="•••• •••• •••• 4242 (Demo Mode)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Expiry</label>
                    <input type="text" disabled value="12/28" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">CVV</label>
                    <input type="password" disabled value="•••" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-300 rounded-lg" />
                  </div>
                </div>
              </div>
            )}

            {/* Netbanking Option */}
            {method === 'netbanking' && (
              <div className="text-xs text-slate-400 space-y-2">
                <span>Select Bank:</span>
                <div className="grid grid-cols-2 gap-2">
                  {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((bank) => (
                    <div key={bank} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 cursor-pointer hover:border-blue-500">
                      {bank}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Guarantee notice */}
            <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 text-[11px] text-blue-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span>SkillServe Fair Guarantee: 100% money back if service does not match verified skill tier.</span>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing Bank Authorization...
                </>
              ) : (
                `Pay ₹${amount.toLocaleString('en-IN')}`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
