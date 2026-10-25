import React, { useState, useEffect } from 'react';
import {
  Pill,
  ShoppingCart,
  ShieldAlert,
  CheckCircle2,
  FileText,
  Upload,
  Plus,
  Minus,
  Trash2,
  Search,
  Sparkles,
  Receipt,
  X,
  CreditCard,
  Truck,
  IndianRupee,
} from 'lucide-react';
import { Medicine } from '../data/mockHealthcareData.js';
import { CartCalculationResult, CartItem } from '../utils/healthcareLogic.js';

interface Props {
  onAskMedicineAI?: (medicineName: string) => void;
}

export const PharmacyView: React.FC<Props> = ({ onAskMedicineAI }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [cart, setCart] = useState<{ id: string; quantity: number }[]>([]);
  const [calculation, setCalculation] = useState<CartCalculationResult | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  // Checkout Form State
  const [patientName, setPatientName] = useState('Rameshwar Kumar Singh');
  const [patientPhone, setPatientPhone] = useState('+91-9876543210');
  const [deliveryAddress, setDeliveryAddress] = useState('Flat 402, Ganga Heights, Bailey Road, Patna, Bihar - 800014');
  const [prescriptionAttached, setPrescriptionAttached] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [orderSuccessInvoice, setOrderSuccessInvoice] = useState<any | null>(null);
  const [discountCode, setDiscountCode] = useState<string>('VITAL10');
  const [selectedMedicineForDetail, setSelectedMedicineForDetail] = useState<Medicine | null>(null);

  useEffect(() => {
    fetch('/api/medicines')
      .then(res => res.json())
      .then(data => setMedicines(data || []))
      .catch(err => console.error(err));
  }, []);

  // Update authoritative cart calculation from server
  const recalculateCart = async (cartItems: { id: string; quantity: number }[]) => {
    if (cartItems.length === 0) {
      setCalculation(null);
      return;
    }
    try {
      const res = await fetch('/api/orders/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          discountCode,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCalculation(data.calculation);
      }
    } catch (e) {
      console.error('Cart calc failed', e);
    }
  };

  const addToCart = (medId: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === medId);
      let updated;
      if (existing) {
        updated = prev.map(i => (i.id === medId ? { ...i, quantity: i.quantity + 1 } : i));
      } else {
        updated = [...prev, { id: medId, quantity: 1 }];
      }
      recalculateCart(updated);
      return updated;
    });
  };

  const updateQuantity = (medId: string, delta: number) => {
    setCart(prev => {
      const updated = prev
        .map(i => {
          if (i.id === medId) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean) as { id: string; quantity: number }[];
      recalculateCart(updated);
      return updated;
    });
  };

  const removeFromCart = (medId: string) => {
    setCart(prev => {
      const updated = prev.filter(i => i.id !== medId);
      recalculateCart(updated);
      return updated;
    });
  };

  const categories = ['All', 'Cardiac', 'Diabetes', 'Analgesic', 'Antibiotic', 'Gastroenterology', 'Respiratory', 'Vitamins'];

  const filteredMedicines = medicines.filter(m => {
    if (selectedCategory !== 'All' && m.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.genericName.toLowerCase().includes(q) ||
        m.brand.toLowerCase().includes(q) ||
        m.composition.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calculation) return;

    if (calculation.requiresPrescription && !prescriptionAttached) {
      alert('Prescription verification required! Please check the prescription attachment box.');
      return;
    }

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          patientName,
          patientPhone,
          deliveryAddress,
          prescriptionUploaded: prescriptionAttached,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (res.ok && data.order) {
        setOrderSuccessInvoice(data.order);
        setCart([]);
        setCalculation(null);
      } else {
        alert(data.error || 'Failed to place order');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="glass rounded-2xl p-6 shadow-glass border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <Pill className="w-4 h-4 text-primary" />
            Verified Pharmaceutical Dispensary
          </div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight mt-1">
            Authoritative Medicine Catalog
          </h2>
          <p className="text-muted-foreground text-xs mt-0.5">
            Licensed pharmaceuticals, server-enforced pricing, 12% statutory GST, and certified cold-chain delivery.
          </p>
        </div>

        {/* Cart Drawer Trigger */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative px-5 py-3 rounded-xl bg-gold text-primary-foreground font-bold text-xs flex items-center gap-2 transition-all shadow-gold hover:opacity-90"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Cart & Checkout</span>
          {cart.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-background text-primary text-[11px] font-black flex items-center justify-center">
              {cart.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass rounded-2xl p-4 border-border/80 space-y-3 shadow-glass">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by brand name (e.g. Dolo, Atorva, Augmentin), generic molecule, or composition..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background/60 border border-input text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-gold text-primary-foreground font-bold shadow-gold'
                    : 'bg-background/60 text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Medicine Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredMedicines.map(med => {
          const inCartItem = cart.find(i => i.id === med.id);

          return (
            <div
              key={med.id}
              className="glass rounded-2xl p-5 border-border/80 hover:border-primary/40 transition-all flex flex-col justify-between shadow-glass space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-card text-muted-foreground border border-border">
                    {med.category}
                  </span>
                  {med.prescriptionRequired ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive/15 text-destructive border border-destructive/30">
                      Rx Required
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      OTC
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-foreground mt-2 line-clamp-1">{med.name}</h3>
                <div className="text-xs text-muted-foreground font-mono line-clamp-1 mt-0.5">{med.genericName}</div>
                <div className="text-[11px] text-primary mt-1 font-medium">{med.brand}</div>

                {/* Dosage Form & Strength */}
                <div className="mt-3 p-2.5 rounded-xl bg-background/50 border border-border text-xs flex items-center justify-between">
                  <span className="text-muted-foreground">{med.dosageForm}</span>
                  <span className="text-foreground font-mono font-semibold">{med.strength}</span>
                </div>

                {/* Price Display */}
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-lg font-black text-foreground flex items-center">
                    <IndianRupee className="w-4 h-4 mr-0.5 text-primary" />
                    {med.price}
                  </span>
                  <span className="text-xs text-muted-foreground line-through flex items-center">
                    <IndianRupee className="w-3 h-3 mr-0.5" />
                    {med.mrp}
                  </span>
                  <span className="text-[11px] font-bold text-primary">
                    {Math.round(((med.mrp - med.price) / med.mrp) * 100)}% OFF
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                {inCartItem ? (
                  <div className="flex items-center justify-between p-1.5 rounded-xl bg-background/60 border border-primary/40">
                    <button
                      onClick={() => updateQuantity(med.id, -1)}
                      className="w-7 h-7 rounded-lg bg-card text-foreground flex items-center justify-center hover:bg-muted"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-primary font-mono">{inCartItem.quantity} in cart</span>
                    <button
                      onClick={() => updateQuantity(med.id, 1)}
                      className="w-7 h-7 rounded-lg bg-gold text-primary-foreground flex items-center justify-center font-bold hover:opacity-90"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(med.id)}
                    className="w-full py-2 px-3 rounded-xl bg-gold hover:opacity-90 text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-gold"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Add to Cart
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedMedicineForDetail(med)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-[11px] font-medium border border-border"
                  >
                    Clinical Info
                  </button>
                  {onAskMedicineAI && (
                    <button
                      onClick={() => onAskMedicineAI(med.name)}
                      className="p-1.5 rounded-xl bg-card hover:bg-muted text-primary border border-border hover:border-primary/40"
                      title="Ask Gemini Assistant about indications and side effects"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Medicine Clinical Detail Modal */}
      {selectedMedicineForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl glass border-border/80 p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedMedicineForDetail(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground text-lg font-bold"
            >
              ×
            </button>

            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Verified Drug Monograph
              </span>
              <h3 className="text-xl font-bold text-foreground mt-2">{selectedMedicineForDetail.name}</h3>
              <p className="text-xs text-muted-foreground font-mono">{selectedMedicineForDetail.composition}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-foreground block mb-1">Therapeutic Indications:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMedicineForDetail.therapeuticUses.map(use => (
                    <span key={use} className="px-2 py-1 rounded-lg bg-card text-primary border border-border">
                      {use}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-semibold text-foreground block mb-1">Precautions & Contraindications:</span>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {selectedMedicineForDetail.precautions.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-background/50 border border-border space-y-1">
                <div className="text-muted-foreground">Dosage Administration:</div>
                <div className="font-medium text-foreground">{selectedMedicineForDetail.dosageInstructions}</div>
              </div>

              <div className="text-[11px] text-muted-foreground font-mono">
                Source Manufacturer: {selectedMedicineForDetail.sourceManufacturer} (Audited: {selectedMedicineForDetail.lastPriceAuditDate})
              </div>
            </div>

            <button
              onClick={() => {
                addToCart(selectedMedicineForDetail.id);
                setSelectedMedicineForDetail(null);
              }}
              className="w-full py-2.5 rounded-xl bg-gold text-primary-foreground font-bold text-xs shadow-gold hover:opacity-90"
            >
              Add to Prescription Cart
            </button>
          </div>
        </div>
      )}

      {/* Cart & Authoritative Calculation Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md h-full glass border-l border-border p-6 flex flex-col justify-between shadow-2xl relative">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-foreground">Dispensary Cart</h3>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="mt-4 space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-xs">Your dispensary cart is currently empty.</div>
                ) : (
                  cart.map(item => {
                    const med = medicines.find(m => m.id === item.id);
                    if (!med) return null;
                    return (
                      <div key={item.id} className="p-3 rounded-xl bg-background/60 border border-border text-xs space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-bold text-foreground">{med.name}</div>
                            <div className="text-[11px] text-muted-foreground font-mono flex items-center">
                              <IndianRupee className="w-3 h-3 mr-0.5 inline" />
                              {med.price} per unit
                            </div>
                          </div>
                          <button onClick={() => removeFromCart(med.id)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(med.id, -1)}
                              className="w-6 h-6 rounded bg-card text-foreground flex items-center justify-center hover:bg-muted"
                            >
                              -
                            </button>
                            <span className="font-bold text-foreground font-mono">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(med.id, 1)}
                              className="w-6 h-6 rounded bg-gold text-primary-foreground font-bold flex items-center justify-center hover:opacity-90"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-bold text-primary font-mono flex items-center">
                            <IndianRupee className="w-3.5 h-3.5 mr-0.5 inline" />
                            {med.price * item.quantity}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Authoritative Server Billing Calculation */}
            {calculation && (
              <div className="pt-4 border-t border-border space-y-3">
                <div className="p-3.5 rounded-xl bg-background/60 border border-border text-xs space-y-1.5">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Items Subtotal:</span>
                    <span className="text-foreground font-mono flex items-center">
                      <IndianRupee className="w-3 h-3 mr-0.5 text-muted-foreground" />
                      {calculation.subtotal}
                    </span>
                  </div>
                  {calculation.discount > 0 && (
                    <div className="flex justify-between text-primary">
                      <span>Vitalora Coupon (VITAL10):</span>
                      <span className="font-mono flex items-center">
                        -<IndianRupee className="w-3 h-3 mr-0.5 text-primary" />
                        {calculation.discount}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Statutory Pharma GST (12%):</span>
                    <span className="text-foreground font-mono flex items-center">
                      <IndianRupee className="w-3 h-3 mr-0.5 text-muted-foreground" />
                      {calculation.gst}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery (Free above ₹499):</span>
                    <span className="text-foreground font-mono flex items-center">
                      {calculation.deliveryFee === 0 ? (
                        'FREE'
                      ) : (
                        <>
                          <IndianRupee className="w-3 h-3 mr-0.5 text-muted-foreground" />
                          {calculation.deliveryFee}
                        </>
                      )}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-border flex justify-between text-sm font-bold text-foreground">
                    <span>Authoritative Grand Total:</span>
                    <span className="text-primary font-mono text-base flex items-center">
                      <IndianRupee className="w-4 h-4 mr-0.5 text-primary" />
                      {calculation.grandTotal}
                    </span>
                  </div>
                </div>

                {calculation.requiresPrescription && (
                  <div className="p-2.5 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-[11px] flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Prescription required before dispensing.</span>
                  </div>
                )}

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-3 rounded-xl bg-gold text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 shadow-gold hover:opacity-90"
                >
                  Proceed to Delivery & Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout and Prescription Verification Modal */}
      {isCheckoutOpen && calculation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl glass border-border/80 p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground text-lg font-bold"
            >
              ×
            </button>

            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Authoritative Checkout Desk
              </span>
              <h3 className="text-xl font-bold text-foreground mt-1">Order Delivery & Verification</h3>
              <p className="text-xs text-muted-foreground flex items-center">
                Total Payable: <IndianRupee className="w-3 h-3 ml-1 mr-0.5" /> {calculation.grandTotal}
              </p>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-3.5 text-xs">
              <div>
                <label className="text-muted-foreground font-medium block mb-1">Patient Full Name</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-muted-foreground font-medium block mb-1">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={patientPhone}
                  onChange={e => setPatientPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-muted-foreground font-medium block mb-1">Delivery Address in Bihar</label>
                <textarea
                  rows={2}
                  required
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-background/60 border border-input text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              {calculation.requiresPrescription && (
                <div className="p-3.5 rounded-xl bg-background/60 border border-destructive/30 space-y-2">
                  <div className="flex items-center gap-2 text-destructive font-semibold">
                    <FileText className="w-4 h-4 text-destructive" />
                    Doctor Prescription Verification
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Your order contains Schedule H/H1 regulated medications requiring licensed pharmacist review.
                  </p>
                  <label className="flex items-center gap-2 text-foreground cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={prescriptionAttached}
                      onChange={e => setPrescriptionAttached(e.target.checked)}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <span>I confirm I have uploaded a valid doctor prescription in my Patient Vault</span>
                  </label>
                </div>
              )}

              <div className="flex items-center justify-between p-3 rounded-xl bg-background/60 border border-border">
                <span className="text-muted-foreground">Payment Option:</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-foreground cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'ONLINE'}
                      onChange={() => setPaymentMethod('ONLINE')}
                    />
                    <span>UPI / Online</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-foreground cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                    />
                    <span>Cash on Delivery</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gold text-primary-foreground font-bold shadow-gold hover:opacity-90"
                >
                  Confirm & Place Order (₹{calculation.grandTotal})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Electronic Invoice Receipt Modal */}
      {orderSuccessInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl glass border-border/80 p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setOrderSuccessInvoice(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground text-lg font-bold"
            >
              ×
            </button>

            <div className="text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
              <h3 className="text-xl font-bold text-foreground">Tax Invoice Generated!</h3>
              <p className="text-xs text-muted-foreground">
                Order #{orderSuccessInvoice.orderNumber} successfully booked with authorized warehouse.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-background/70 border border-border font-mono text-xs space-y-2">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Invoice ID:</span>
                <span className="text-primary font-bold">{orderSuccessInvoice.orderNumber}</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>Patient:</span>
                <span>{orderSuccessInvoice.patientName}</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>Delivery:</span>
                <span className="text-right text-[11px] max-w-[200px] truncate">{orderSuccessInvoice.deliveryAddress}</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>Items:</span>
                <span>{orderSuccessInvoice.items.length} Medicines</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>Statutory GST:</span>
                <span>₹{orderSuccessInvoice.gst}</span>
              </div>
              <div className="flex justify-between text-primary font-bold border-t border-border pt-2 text-sm">
                <span>Total Paid:</span>
                <span>₹{orderSuccessInvoice.grandTotal}</span>
              </div>
            </div>

            <button
              onClick={() => setOrderSuccessInvoice(null)}
              className="w-full py-2.5 rounded-xl bg-gold text-primary-foreground font-bold text-xs shadow-gold hover:opacity-90"
            >
              Done & Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
