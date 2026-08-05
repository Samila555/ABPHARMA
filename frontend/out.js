import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiPlus, FiMinus, FiTrash2, FiPrinter, FiUser, FiUserCheck, FiX, FiRefreshCw, FiEye, FiAlertCircle, FiCheckCircle, FiImage } from "react-icons/fi";
import { MdPointOfSale } from "react-icons/md";
import api from "../../lib/api";
import toast from "react-hot-toast";
export default function POS() {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const discount = 0;
  const discountType = "fixed";
  const taxRate = 0;
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [walkinScreenshot, setWalkinScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("walkin");
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [verifyingOrder, setVerifyingOrder] = useState(null);
  const [screenshotModal, setScreenshotModal] = useState(null);
  const [imgErrors, setImgErrors] = useState({});
  const searchRef = useRef();
  const fetchPendingOrders = useCallback(async (silent = false) => {
    if (!silent) setLoadingPending(true);
    try {
      const res = await api.get("/orders?payment_status=pending&order_type=online&limit=50");
      setPendingOrders(res.data.data || []);
    } catch {
      if (!silent) toast.error("Failed to load pending orders");
    }
    if (!silent) setLoadingPending(false);
  }, []);
  useEffect(() => {
    if (activeTab === "online") fetchPendingOrders();
  }, [activeTab, fetchPendingOrders]);
  useEffect(() => {
    if (activeTab !== "online") return;
    const interval = setInterval(() => fetchPendingOrders(true), 3e4);
    return () => clearInterval(interval);
  }, [activeTab, fetchPendingOrders]);
  const verifyOnlineOrder = async (orderId) => {
    setVerifyingOrder(orderId);
    try {
      await api.patch(`/orders/${orderId}/approve`);
      toast.success("\u2705 Payment verified \u2014 stock deducted!");
      fetchPendingOrders(true);
    } catch (e) {
      toast.error(e.response?.data?.message || "Verification failed");
    }
    setVerifyingOrder(null);
  };
  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/medicines?search=${encodeURIComponent(search)}&limit=8&status=available`);
        setResults(res.data.data);
      } catch {
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    if (!customerSearch.trim()) {
      setCustomers([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/customers?search=${encodeURIComponent(customerSearch)}&limit=5`);
        setCustomers(res.data.data);
      } catch {
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [customerSearch]);
  const addToCart = (medicine) => {
    if (medicine.quantity <= 0) return toast.error("Out of stock");
    setCart((prev) => {
      const exist = prev.find((i) => i.medicine_id === medicine.id);
      if (exist) {
        if (exist.quantity >= medicine.quantity) return toast.error("Cannot exceed available stock") || prev;
        return prev.map((i) => i.medicine_id === medicine.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { medicine_id: medicine.id, medicine_name: medicine.name, barcode: medicine.barcode, unit_price: parseFloat(medicine.selling_price), quantity: 1, max_qty: medicine.quantity, item_discount: 0 }];
    });
    setSearch("");
    setResults([]);
  };
  const removeItem = (id) => setCart((prev) => prev.filter((i) => i.medicine_id !== id));
  const updateQty = (id, qty) => {
    if (qty < 1) return removeItem(id);
    setCart((prev) => prev.map((i) => i.medicine_id === id ? { ...i, quantity: Math.min(qty, i.max_qty) } : i));
  };
  const subtotal = cart.reduce((s, i) => s + i.unit_price * i.quantity - (i.item_discount || 0), 0);
  const discountAmt = discountType === "percentage" ? subtotal * discount / 100 : parseFloat(discount) || 0;
  const taxAmt = (subtotal - discountAmt) * taxRate / 100;
  const total = Math.max(0, subtotal - discountAmt + taxAmt);
  const change = parseFloat(amountPaid || 0) - total;
  const fmt = (n) => `ETB ${parseFloat(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  const handleCheckout = async () => {
    if (!cart.length) return toast.error("Cart is empty");
    if (parseFloat(amountPaid || 0) < total) return toast.error("Insufficient payment amount");
    setLoading(true);
    try {
      const payload = {
        customer_id: null,
        customer_name: "Walk-in Customer",
        customer_phone: "",
        order_type: "pos",
        items: cart,
        payment_method: paymentMethod,
        discount: 0,
        discount_type: "fixed",
        tax_rate: 0,
        delivery_type: "pickup",
        amount_paid: parseFloat(amountPaid || total),
        payment_screenshot: paymentMethod === "transfer" ? walkinScreenshot : null
      };
      const res = await api.post("/orders", payload);
      toast.success(`Sale completed! Order: ${res.data.order_number}`);
      printReceipt(res.data.order_number);
      setCart([]);
      setAmountPaid("");
      setWalkinScreenshot(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };
  const printReceipt = (orderNumber) => {
    const win = window.open("", "_blank", "width=400,height=600");
    win.document.write(`
      <html><head><title>Receipt</title>
      <style>body{font-family:monospace;padding:20px;font-size:12px}h2{text-align:center}.line{border-top:1px dashed #000;margin:8px 0}.total{font-size:14px;font-weight:bold}.row{display:flex;justify-content:space-between}</style>
      </head><body>
      <h2>AB PHARMA</h2><p style="text-align:center">Smart Pharmacy<br>Tel: +234-000-0000<br>${(/* @__PURE__ */ new Date()).toLocaleString()}</p>
      <div class="line"></div><p>Order: ${orderNumber}</p><p>Customer: Walk-in</p>
      <div class="line"></div>
      ${cart.map((i) => `<div class="row"><span>${i.medicine_name} x${i.quantity}</span><span>ETB ${(i.unit_price * i.quantity).toLocaleString()}</span></div>`).join("")}
      <div class="line"></div>
      <div class="row"><span>Subtotal:</span><span>${fmt(subtotal)}</span></div>
      <div class="line"></div>
      <div class="row total"><span>TOTAL:</span><span>${fmt(total)}</span></div>
      <div class="row"><span>Paid:</span><span>${fmt(parseFloat(amountPaid || total))}</span></div>
      <div class="row"><span>Change:</span><span>${fmt(Math.max(0, change))}</span></div>
      <div class="line"></div><p style="text-align:center">Thank you for your purchase!</p>
      </body></html>
    `);
    win.print();
    win.close();
  };
  const handleWalkinScreenshot = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("File too large (max 5MB)");
    const reader = new FileReader();
    reader.onload = (ev) => setWalkinScreenshot(ev.target.result);
    reader.readAsDataURL(file);
  };
  return /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-4 h-[calc(100vh-100px)]" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row md:items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200 gap-4" }, /* @__PURE__ */ React.createElement("h1", { className: "text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-3 whitespace-nowrap" }, /* @__PURE__ */ React.createElement(MdPointOfSale, { className: "text-sky-600 shrink-0", size: 32 }), "AB Pharma POS Center"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap bg-slate-100 p-1.5 rounded-xl border border-slate-200" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("walkin"),
      className: `flex-1 flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 rounded-lg font-bold transition-all whitespace-nowrap ${activeTab === "walkin" ? "bg-white shadow-sm text-sky-600" : "text-slate-500 hover:text-slate-700"}`
    },
    /* @__PURE__ */ React.createElement(MdPointOfSale, { size: 20, className: "shrink-0" }),
    "Walk-In Register"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("online"),
      className: `flex-1 flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 rounded-lg font-bold transition-all relative whitespace-nowrap ${activeTab === "online" ? "bg-white shadow-sm text-sky-600" : "text-slate-500 hover:text-slate-700"}`
    },
    /* @__PURE__ */ React.createElement(FiUserCheck, { size: 20, className: "shrink-0" }),
    "Online Orders",
    activeTab === "walkin" && pendingOrders.length > 0 && /* @__PURE__ */ React.createElement("span", { className: "absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs animate-bounce border-2 border-white shadow-sm" }, pendingOrders.length)
  ))), activeTab === "walkin" ? /* @__PURE__ */ React.createElement("div", { className: "flex gap-4 flex-1 overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1 flex flex-col gap-4 overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "card p-3" }, /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(FiSearch, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400", size: 16 }), /* @__PURE__ */ React.createElement(
    "input",
    {
      ref: searchRef,
      type: "text",
      placeholder: "Search medicine...",
      value: search,
      onChange: (e) => setSearch(e.target.value),
      className: "form-input pl-10",
      autoFocus: true
    }
  )), results.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto" }, results.map((m) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: m.id,
      onClick: () => addToCart(m),
      className: `flex items-center gap-3 p-3 border rounded-xl text-left transition-all ${m.quantity <= 0 ? "opacity-50 cursor-not-allowed border-slate-200" : "border-slate-200 hover:border-sky-400 hover:bg-sky-50"}`,
      disabled: m.quantity <= 0
    },
    /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center text-sky-600 font-bold text-sm flex-shrink-0" }, m.name.charAt(0)),
    /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "font-medium text-sm text-slate-800 truncate" }, m.name), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-slate-500" }, m.strength, " ETB Stock: ", m.quantity)),
    /* @__PURE__ */ React.createElement("div", { className: "text-right flex-shrink-0" }, /* @__PURE__ */ React.createElement("div", { className: "text-sm font-bold text-green-600" }, "ETB ", parseFloat(m.selling_price).toLocaleString()))
  )))), /* @__PURE__ */ React.createElement("div", { className: "card flex-1 overflow-hidden flex flex-col" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 border-b border-slate-100 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("h3", { className: "font-semibold text-slate-800" }, "Cart (", cart.length, " items)"), cart.length > 0 && /* @__PURE__ */ React.createElement("button", { onClick: () => setCart([]), className: "text-sm text-red-500 hover:text-red-700" }, "Clear All")), /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto p-3 space-y-2" }, /* @__PURE__ */ React.createElement(AnimatePresence, null, cart.map((item) => /* @__PURE__ */ React.createElement(
    motion.div,
    {
      key: item.medicine_id,
      initial: { opacity: 0, x: -10 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 10 },
      className: "flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200"
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "font-medium text-sm text-slate-800 truncate" }, item.medicine_name), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-slate-500" }, "ETB ", item.unit_price.toLocaleString(), " each")),
    /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 flex-shrink-0" }, /* @__PURE__ */ React.createElement("button", { onClick: () => updateQty(item.medicine_id, item.quantity - 1), className: "w-7 h-7 bg-slate-200 rounded-lg flex items-center justify-center" }, /* @__PURE__ */ React.createElement(FiMinus, { size: 12 })), /* @__PURE__ */ React.createElement("span", { className: "w-8 text-center font-bold text-sm" }, item.quantity), /* @__PURE__ */ React.createElement("button", { onClick: () => updateQty(item.medicine_id, item.quantity + 1), className: "w-7 h-7 bg-slate-200 rounded-lg flex items-center justify-center" }, /* @__PURE__ */ React.createElement(FiPlus, { size: 12 }))),
    /* @__PURE__ */ React.createElement("div", { className: "text-right font-bold text-sm" }, "ETB ", (item.unit_price * item.quantity).toLocaleString()),
    /* @__PURE__ */ React.createElement("button", { onClick: () => removeItem(item.medicine_id), className: "text-red-400" }, /* @__PURE__ */ React.createElement(FiTrash2, { size: 14 }))
  )))))), /* @__PURE__ */ React.createElement("div", { className: "w-80 flex flex-col gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "card p-4 space-y-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between text-sm text-slate-600" }, /* @__PURE__ */ React.createElement("span", null, "Subtotal"), /* @__PURE__ */ React.createElement("span", { className: "font-medium" }, fmt(subtotal))), /* @__PURE__ */ React.createElement("div", { className: "border-t border-slate-200 pt-2 flex justify-between text-lg font-bold text-slate-800" }, /* @__PURE__ */ React.createElement("span", null, "Total"), /* @__PURE__ */ React.createElement("span", { className: "text-sky-700" }, fmt(total)))), /* @__PURE__ */ React.createElement("div", { className: "card p-4 space-y-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "form-label text-xs" }, "Payment Method"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-2 mt-1" }, ["cash", "card", "transfer", "mobile_money"].map((m) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: m,
      onClick: () => setPaymentMethod(m),
      className: `py-1.5 text-xs font-semibold rounded-lg border-2 transition-all capitalize ${paymentMethod === m ? "border-sky-500 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`
    },
    m.replace("_", " ")
  )))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "form-label text-xs" }, "Amount Paid (ETB )"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      min: "0",
      value: amountPaid,
      onChange: (e) => setAmountPaid(e.target.value),
      className: "form-input font-semibold text-lg",
      placeholder: total.toFixed(2)
    }
  )), paymentMethod === "transfer" && /* @__PURE__ */ React.createElement("div", { className: "p-3 border border-dashed border-sky-300 bg-sky-50 rounded-xl space-y-2 mt-2" }, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold text-sky-800 flex items-center gap-1" }, /* @__PURE__ */ React.createElement(FiImage, null), " Upload Receipt (Optional)"), !walkinScreenshot ? /* @__PURE__ */ React.createElement("input", { type: "file", accept: "image/*", onChange: handleWalkinScreenshot, className: "text-xs w-full file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-200 file:text-sky-800 hover:file:bg-sky-300" }) : /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-3 bg-white p-2 rounded-lg border border-sky-100" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-semibold text-emerald-600 flex items-center gap-1" }, /* @__PURE__ */ React.createElement(FiCheckCircle, { size: 14 }), " Image Attached"), /* @__PURE__ */ React.createElement("button", { onClick: () => setWalkinScreenshot(null), className: "text-xs text-red-500 font-bold px-2 py-1 bg-red-50 rounded bg-red-100 hover:bg-red-200" }, "Remove"))), parseFloat(amountPaid) >= total && parseFloat(amountPaid) > 0 && /* @__PURE__ */ React.createElement("div", { className: "flex justify-between text-sm font-semibold text-green-600 bg-green-50 px-3 py-2 rounded-lg" }, /* @__PURE__ */ React.createElement("span", null, "Change"), /* @__PURE__ */ React.createElement("span", null, fmt(Math.max(0, change)))), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleCheckout,
      disabled: loading || cart.length === 0,
      className: "w-full btn-secondary bg-sky-600 hover:bg-sky-500 text-white justify-center py-4 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed"
    },
    loading ? /* @__PURE__ */ React.createElement("div", { className: "w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" }) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(FiPrinter, { size: 18 }), " Complete Sale")
  )))) : /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto rounded-2xl", style: { background: "#f8fafc" } }, /* @__PURE__ */ React.createElement(AnimatePresence, null, screenshotModal && /* @__PURE__ */ React.createElement(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4",
      onClick: () => setScreenshotModal(null)
    },
    /* @__PURE__ */ React.createElement(
      motion.div,
      {
        initial: { scale: 0.85, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.85, opacity: 0 },
        className: "relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full",
        onClick: (e) => e.stopPropagation()
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between px-5 py-4 border-b border-slate-100" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-bold text-slate-800" }, "Payment Screenshot"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500" }, screenshotModal.orderNumber)), /* @__PURE__ */ React.createElement("button", { onClick: () => setScreenshotModal(null), className: "w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200" }, /* @__PURE__ */ React.createElement(FiX, { size: 15 }))),
      /* @__PURE__ */ React.createElement("div", { className: "p-4 bg-slate-50" }, /* @__PURE__ */ React.createElement(
        "img",
        {
          src: screenshotModal.src,
          alt: "Payment proof",
          className: "w-full max-h-[70vh] object-contain rounded-xl",
          onError: (e) => {
            e.target.style.display = "none";
          }
        }
      ))
    )
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between p-5 pb-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "text-xl font-bold text-slate-800" }, "Online Orders Verification"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-500 mt-0.5" }, pendingOrders.length > 0 ? `${pendingOrders.length} order${pendingOrders.length > 1 ? "s" : ""} awaiting payment verification` : "No pending orders")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => fetchPendingOrders(),
      disabled: loadingPending,
      className: "flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
    },
    /* @__PURE__ */ React.createElement(FiRefreshCw, { size: 14, className: loadingPending ? "animate-spin" : "" }),
    "Refresh"
  )), /* @__PURE__ */ React.createElement("div", { className: "px-5 pb-6" }, loadingPending ? /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center justify-center py-24 text-slate-400" }, /* @__PURE__ */ React.createElement("div", { className: "w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mb-4" }), /* @__PURE__ */ React.createElement("p", { className: "font-medium" }, "Loading pending orders...")) : pendingOrders.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200 text-slate-400" }, /* @__PURE__ */ React.createElement(FiCheckCircle, { size: 56, className: "text-emerald-300 mb-4" }), /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-bold text-slate-600" }, "All Caught Up!"), /* @__PURE__ */ React.createElement("p", { className: "text-sm mt-1 text-center max-w-xs" }, "No pending bank transfers waiting for verification right now."), /* @__PURE__ */ React.createElement("p", { className: "text-xs mt-3 text-slate-400" }, "Auto-refreshes every 30 seconds")) : /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 xl:grid-cols-2 gap-5" }, pendingOrders.map((o) => {
    const hasScreenshot = !!o.payment_screenshot;
    const imgSrc = o.payment_screenshot;
    return /* @__PURE__ */ React.createElement(
      motion.div,
      {
        key: o.id,
        layout: true,
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        className: "bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      },
      /* @__PURE__ */ React.createElement("div", { className: "px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex justify-between items-start" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-bold text-slate-900 text-sm" }, o.order_number), /* @__PURE__ */ React.createElement("p", { className: "text-slate-700 font-semibold mt-0.5" }, o.customer_name), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500" }, o.customer_phone)), /* @__PURE__ */ React.createElement("div", { className: "text-right" }, /* @__PURE__ */ React.createElement("p", { className: "text-2xl font-black text-sky-600" }, "ETB ", parseFloat(o.total || 0).toLocaleString()), /* @__PURE__ */ React.createElement("span", { className: "inline-block mt-1 text-[11px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full" }, "\u23F3 AWAITING VERIFICATION"))),
      /* @__PURE__ */ React.createElement("div", { className: "p-5 flex flex-col sm:flex-row gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1 flex flex-col gap-2" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-bold text-slate-400 uppercase tracking-widest" }, "Payment Screenshot"), hasScreenshot ? /* @__PURE__ */ React.createElement(
        "div",
        {
          className: "relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer group",
          style: { minHeight: 140 },
          onClick: () => setScreenshotModal({ src: imgSrc, orderNumber: o.order_number })
        },
        !imgErrors[o.id] ? /* @__PURE__ */ React.createElement(
          "img",
          {
            src: imgSrc,
            alt: "Payment proof",
            className: "w-full object-cover transition-transform group-hover:scale-105",
            style: { maxHeight: 160 },
            onError: () => setImgErrors((prev) => ({ ...prev, [o.id]: true }))
          }
        ) : /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center justify-center py-10 text-slate-400" }, /* @__PURE__ */ React.createElement(FiAlertCircle, { size: 28, className: "text-amber-400 mb-2" }), /* @__PURE__ */ React.createElement("p", { className: "text-xs font-medium" }, "Image failed to load"), /* @__PURE__ */ React.createElement("a", { href: imgSrc, target: "_blank", rel: "noreferrer", className: "mt-2 text-xs text-blue-500 underline" }, "Open directly")),
        /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" }, /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1.5 text-white text-sm font-bold bg-black/40 px-3 py-1.5 rounded-full" }, /* @__PURE__ */ React.createElement(FiEye, { size: 14 }), " View Full Screen"))
      ) : /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-10 text-slate-400", style: { minHeight: 140 } }, /* @__PURE__ */ React.createElement(FiImage, { size: 32, className: "mb-2 text-slate-300" }), /* @__PURE__ */ React.createElement("p", { className: "text-xs font-medium" }, "No Screenshot Uploaded"), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-400 mt-0.5" }, "Customer did not attach proof"))), /* @__PURE__ */ React.createElement("div", { className: "sm:w-48 flex flex-col justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "text-sm text-slate-600 bg-blue-50 border border-blue-100 rounded-xl p-3 leading-relaxed" }, "Verify the screenshot matches", /* @__PURE__ */ React.createElement("strong", { className: "text-slate-800 block mt-0.5" }, "ETB ", parseFloat(o.total || 0).toLocaleString()), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-slate-500 block mt-1" }, "Stock auto-deducted on approval.")), /* @__PURE__ */ React.createElement(
        "button",
        {
          disabled: verifyingOrder === o.id,
          onClick: () => verifyOnlineOrder(o.id),
          className: "w-full flex flex-col items-center justify-center gap-1 py-4 rounded-xl font-bold text-white transition-all",
          style: {
            background: verifyingOrder === o.id ? "#6ee7b7" : "linear-gradient(135deg,#10b981,#059669)",
            boxShadow: verifyingOrder === o.id ? "none" : "0 4px 16px rgba(16,185,129,0.35)"
          }
        },
        verifyingOrder === o.id ? /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-2 text-sm" }, /* @__PURE__ */ React.createElement("div", { className: "w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" }), "Verifying...") : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-2 text-sm" }, /* @__PURE__ */ React.createElement(FiCheckCircle, { size: 16 }), " Complete Payment"), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] text-emerald-100 font-medium" }, "Verify & Deduct Stock"))
      )))
    );
  })))));
}
