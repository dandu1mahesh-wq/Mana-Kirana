import React, { useEffect, useMemo, useState } from "react";

const INITIAL_PRODUCTS = [
  { id: "p1", name: "Sona Masoori Rice (5 kg)", te: "సోనా మసూరి బియ్యం (5 కిలోలు)", category: "బియ్యం / పిండి", price: 340, stock: 45, emoji: "🌾" },
  { id: "p2", name: "Aashirvaad Atta (5 kg)", te: "గోధుమ పిండి (5 కిలోలు)", category: "బియ్యం / పిండి", price: 265, stock: 30, emoji: "🍞" },
  { id: "p3", name: "Freedom Oil (1 L)", te: "ఫ్రీడమ్ నూనె (1 లీటర్)", category: "నూనెలు", price: 135, stock: 10, emoji: "🌻" },
  { id: "p4", name: "Toor Dal (1 kg)", te: "కందిపప్పు (1 కిలో)", category: "పప్పులు", price: 160, stock: 25, emoji: "🫘" },
  { id: "p5", name: "Milk (500 ml)", te: "పాలు (500 మి.లీ.)", category: "పాలు / స్నాక్స్", price: 29, stock: 80, emoji: "🥛" },
  { id: "p6", name: "Sugar (1 kg)", te: "చక్కెర (1 కిలో)", category: "ఇతరాలు", price: 48, stock: 50, emoji: "🧂" },
  { id: "p7", name: "Salt (1 kg)", te: "ఉప్పు (1 కిలో)", category: "ఇతరాలు", price: 22, stock: 60, emoji: "🧂" },
  { id: "p8", name: "Tea Powder (250 g)", te: "టీ పొడి (250 గ్రాములు)", category: "పాలు / స్నాక్స్", price: 95, stock: 20, emoji: "🍵" },
];
const STORE = { name: "Mana Kirana", owner: "Dandu Mahesh", upi: "Mahesh2004@ybl", deliveryFee: 15, email: "dandu.mahesh046@gmail.com" };
const money = n => "₹" + Number(n || 0).toFixed(2).replace(/\.00$/, "");
const read = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};

export default function App() {
  const [role, setRole] = useState("customer");
  const [products, setProducts] = useState(() => read("mk_products", INITIAL_PRODUCTS));
  const [orders, setOrders] = useState(() => read("mk_orders", []));
  const [cart, setCart] = useState([]);
  const [tab, setTab] = useState("shop");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("అన్ని");
  const [payment, setPayment] = useState("COD");
  const [customer, setCustomer] = useState({ name: "", phone: "", address: "" });
  const [notice, setNotice] = useState("");
  const [deliveryOrderId, setDeliveryOrderId] = useState("");
  const [newProduct, setNewProduct] = useState({ name: "", te: "", price: "", stock: "", category: "ఇతరాలు", emoji: "🛒" });

  useEffect(() => { localStorage.setItem("mk_products", JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem("mk_orders", JSON.stringify(orders)); }, [orders]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 2800);
    return () => clearTimeout(t);
  }, [notice]);

  const categories = ["అన్ని", ...new Set(products.map(p => p.category))];
  const shownProducts = useMemo(() => products.filter(p =>
    (category === "అన్ని" || p.category === category) &&
    (p.name + " " + p.te).toLowerCase().includes(search.toLowerCase())
  ), [products, category, search]);
  const itemTotal = cart.reduce((sum, item) => {
    const p = products.find(x => x.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
  const deliveryFee = cart.length ? (itemTotal >= 500 ? 0 : STORE.deliveryFee) : 0;
  const handlingFee = cart.length ? 5 : 0;
  const total = itemTotal + deliveryFee + handlingFee;

  function changeQty(product, delta) {
    setCart(prev => {
      const current = prev.find(x => x.id === product.id)?.qty || 0;
      const next = current + delta;
      if (next > product.stock) { setNotice("స్టాక్ సరిపోదు"); return prev; }
      if (next <= 0) return prev.filter(x => x.id !== product.id);
      const exists = prev.some(x => x.id === product.id);
      return exists ? prev.map(x => x.id === product.id ? { ...x, qty: next } : x) : [...prev, { id: product.id, qty: next }];
    });
  }

  function placeOrder() {
    if (!cart.length) return setNotice("ముందుగా సరుకులు ఎంచుకోండి");
    if (!customer.name.trim() || !/^[6-9]\d{9}$/.test(customer.phone) || !customer.address.trim()) {
      setNotice("పేరు, 10 అంకెల ఫోన్ నంబర్, పూర్తి చిరునామా నమోదు చేయండి");
      setTab("cart");
      return;
    }
    const lines = cart.map(ci => {
      const p = products.find(x => x.id === ci.id);
      return { id: p.id, name: p.name, te: p.te, price: p.price, qty: ci.qty };
    });
    const order = {
      id: "MK" + Date.now().toString().slice(-8),
      createdAt: new Date().toLocaleString("en-IN"),
      customer: { ...customer },
      items: lines,
      itemTotal, deliveryFee, handlingFee, total, payment,
      status: "కొత్త ఆర్డర్",
      deliveryPerson: "",
      paymentNote: payment === "UPI" ? "UPI చెల్లింపు స్వయంగా ధృవీకరించాలి" : "డెలివరీ సమయంలో నగదు వసూలు చేయాలి"
    };
    setOrders(prev => [order, ...prev]);
    setProducts(prev => prev.map(p => {
      const line = lines.find(x => x.id === p.id);
      return line ? { ...p, stock: p.stock - line.qty } : p;
    }));
    setCart([]);
    setTab("orders");
    setNotice("ఆర్డర్ నమోదైంది: " + order.id);
  }

  function setStatus(id, status) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    setNotice("ఆర్డర్ స్థితి మార్చబడింది");
  }
  function updateProduct(id, field, value) {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  }
  function addProduct(e) {
    e.preventDefault();
    const price = Number(newProduct.price), stock = Number(newProduct.stock);
    if (!newProduct.name.trim() || !newProduct.te.trim() || price <= 0 || stock < 0) {
      setNotice("సరైన ఉత్పత్తి వివరాలు నమోదు చేయండి"); return;
    }
    setProducts(prev => [...prev, { ...newProduct, id: "p" + Date.now(), price, stock, emoji: newProduct.emoji || "🛒" }]);
    setNewProduct({ name: "", te: "", price: "", stock: "", category: "ఇతరాలు", emoji: "🛒" });
    setNotice("కొత్త సరుకు జోడించబడింది");
  }

  const activeOrders = orders.filter(o => !["డెలివరీ పూర్తయింది", "రద్దు"].includes(o.status));
  const card = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 14, marginBottom: 12 };
  const btn = (bg = "#047857", fg = "#fff") => ({ background: bg, color: fg, border: "0", borderRadius: 10, padding: "10px 12px", fontWeight: 700, cursor: "pointer" });
  const field = { width: "100%", boxSizing: "border-box", padding: 11, border: "1px solid #cbd5e1", borderRadius: 10, marginTop: 5, marginBottom: 9, fontSize: 14 };
  const label = { display: "block", fontSize: 13, fontWeight: 700, color: "#334155" };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", color: "#0f172a", fontFamily: "Arial, 'Noto Sans Telugu', sans-serif" }}>
      <header style={{ background: "#047857", color: "white", padding: 15, position: "sticky", top: 0, zIndex: 5, boxShadow: "0 2px 8px #0002" }}>
        <div style={{ maxWidth: 760, margin: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <div><div style={{ fontSize: 20, fontWeight: 900 }}>🏪 Mana Kirana</div><div style={{ fontSize: 12 }}>దండు మహేష్ కిరాణా • {STORE.upi}</div></div>
            <span style={{ background: "#fbbf24", color: "#422006", padding: "5px 8px", borderRadius: 9, fontSize: 11, fontWeight: 800 }}>గ్రామ డెలివరీ</span>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
            {[["customer", "కస్టమర్"], ["owner", "షాప్ యజమాని"], ["delivery", "డెలివరీ బాయ్"]].map(([value, text]) =>
              <button key={value} onClick={() => { setRole(value); setTab(value === "customer" ? "shop" : value === "owner" ? "dashboard" : "deliveries"); }}
                style={btn(role === value ? "#fbbf24" : "#065f46", role === value ? "#422006" : "#fff")}>{text}</button>)}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 760, margin: "auto", padding: 12, paddingBottom: 90 }}>
        {notice && <div role="status" style={{ ...card, background: "#ecfdf5", color: "#065f46", borderColor: "#6ee7b7", fontWeight: 700 }}>{notice}</div>}

        {role === "customer" && <>
          <div style={{ ...card, background: "#ecfdf5", borderColor: "#a7f3d0" }}>
            <div style={{ fontSize: 18, fontWeight: 900 }}>మీ ఇంటికే కిరాణా సరుకులు</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>₹500 పైగా సరుకులపై డెలివరీ ఛార్జీ లేదు. (టెస్ట్ నియమం)</div>
          </div>
          <div style={card}>
            <input aria-label="సరుకులు వెతకండి" style={field} placeholder="సరుకు పేరు వెతకండి / Search products" value={search} onChange={e => setSearch(e.target.value)} />
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
              {categories.map(c => <button key={c} onClick={() => setCategory(c)} style={{ ...btn(category === c ? "#047857" : "#e2e8f0", category === c ? "#fff" : "#334155"), whiteSpace: "nowrap" }}>{c}</button>)}
            </div>
          </div>
          {tab === "shop" && <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 }}>
              {shownProducts.map(p => {
                const qty = cart.find(x => x.id === p.id)?.qty || 0;
                return <div key={p.id} style={{ ...card, margin: 0, padding: 12 }}>
                  <div style={{ background: "#f8fafc", borderRadius: 12, textAlign: "center", fontSize: 38, padding: 12 }}>{p.emoji}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, marginTop: 8, minHeight: 35 }}>{p.te}</div>
                  <div style={{ fontSize: 11, color: "#64748b", minHeight: 28 }}>{p.name}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4, marginTop: 8 }}>
                    <b>{money(p.price)}</b><span style={{ fontSize: 11, color: p.stock ? "#047857" : "#b91c1c" }}>{p.stock ? `స్టాక్ ${p.stock}` : "అందుబాటులో లేదు"}</span>
                  </div>
                  {qty ? <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                    <button style={btn("#e2e8f0", "#0f172a")} onClick={() => changeQty(p, -1)}>−</button><b>{qty}</b><button style={btn()} onClick={() => changeQty(p, 1)}>+</button>
                  </div> : <button disabled={p.stock <= 0} style={{ ...btn(p.stock ? "#d1fae5" : "#e2e8f0", p.stock ? "#065f46" : "#64748b"), width: "100%", marginTop: 10 }} onClick={() => changeQty(p, 1)}>కార్ట్‌లో వేయండి</button>}
                </div>;
              })}
            </div>
            {!shownProducts.length && <div style={card}>సరుకులు కనబడలేదు.</div>}
          </>}
          {tab === "cart" && <div style={card}>
            <h3 style={{ marginTop: 0 }}>మీ కార్ట్</h3>
            {!cart.length && <p>కార్ట్ ఖాళీగా ఉంది. షాప్‌లో సరుకులు ఎంచుకోండి.</p>}
            {cart.map(ci => { const p = products.find(x => x.id === ci.id); if (!p) return null; return <div key={ci.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", padding: "10px 0", gap: 8 }}>
              <div><b>{p.te}</b><div style={{ fontSize: 12 }}>{money(p.price)} × {ci.qty}</div></div><div style={{ display: "flex", alignItems: "center", gap: 8 }}><button style={btn("#e2e8f0", "#0f172a")} onClick={() => changeQty(p, -1)}>−</button>{ci.qty}<button style={btn()} onClick={() => changeQty(p, 1)}>+</button></div>
            </div>; })}
            <div style={{ marginTop: 12, lineHeight: 1.9, fontSize: 14 }}>
              <div>సరుకుల మొత్తం: <b>{money(itemTotal)}</b></div><div>డెలివరీ: <b>{money(deliveryFee)}</b></div><div>హ్యాండ్లింగ్: <b>{money(handlingFee)}</b></div><div style={{ fontSize: 18 }}>మొత్తం: <b>{money(total)}</b></div>
            </div>
            <h3>డెలివరీ వివరాలు</h3>
            <label style={label}>పేరు<input style={field} value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} /></label>
            <label style={label}>మొబైల్ నంబర్<input style={field} inputMode="numeric" maxLength={10} value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="10 అంకెల నంబర్" /></label>
            <label style={label}>గ్రామం / వీధి / ఇంటి చిరునామా<textarea style={{ ...field, minHeight: 75 }} value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} /></label>
            <label style={label}>చెల్లింపు విధానం<select style={field} value={payment} onChange={e => setPayment(e.target.value)}><option value="COD">డెలివరీ సమయంలో నగదు (COD)</option><option value="UPI">UPI (చెల్లింపు మాన్యువల్‌గా ధృవీకరించాలి)</option></select></label>
            {payment === "UPI" && <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", padding: 12, borderRadius: 10, fontSize: 13 }}>UPI ID: <b>{STORE.upi}</b><br />ఆర్డర్ చేసిన తర్వాత UPI యాప్‌లో చెల్లించవచ్చు. ఈ డెమోలో చెల్లింపు ఆటోమేటిక్‌గా ధృవీకరించబడదు. నిజమైన చెల్లింపుకు గేట్‌వే/సర్వర్ ధృవీకరణ అవసరం.</div>}
            <button style={{ ...btn(), width: "100%", marginTop: 12, fontSize: 16 }} onClick={placeOrder}>ఆర్డర్ చేయండి • {money(total)}</button>
          </div>}
          {tab === "orders" && <div>
            <h3>నా ఆర్డర్లు</h3>
            {!orders.filter(o => o.customer.phone === customer.phone && customer.phone).length && <div style={card}>మీ ఈ సెషన్‌లో ఆర్డర్ వివరాలు ఇక్కడ కనిపిస్తాయి. ఫోన్ నంబర్ నమోదు చేసి ఆర్డర్ చేసిన తర్వాత చూడండి.</div>}
            {orders.filter(o => o.customer.phone === customer.phone && customer.phone).map(o => <div key={o.id} style={card}><b>{o.id}</b><div>{o.createdAt}</div><div>స్థితి: <b>{o.status}</b></div><div>మొత్తం: <b>{money(o.total)}</b></div>{o.items.map(i => <div key={i.id} style={{ fontSize: 13 }}>{i.te} × {i.qty}</div>)}</div>)}
          </div>}
          <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "1px solid #cbd5e1", padding: 8, display: "flex", justifyContent: "center", gap: 8, zIndex: 4 }}>
            <button style={btn(tab === "shop" ? "#047857" : "#e2e8f0", tab === "shop" ? "#fff" : "#334155")} onClick={() => setTab("shop")}>🛍️ షాప్</button>
            <button style={btn(tab === "cart" ? "#047857" : "#e2e8f0", tab === "cart" ? "#fff" : "#334155")} onClick={() => setTab("cart")}>🛒 కార్ట్ ({cart.reduce((s, x) => s + x.qty, 0)})</button>
            <button style={btn(tab === "orders" ? "#047857" : "#e2e8f0", tab === "orders" ? "#fff" : "#334155")} onClick={() => setTab("orders")}>📦 ఆర్డర్లు</button>
          </nav>
        </>}

        {role === "owner" && <>
          <div style={{ ...card, background: "#064e3b", color: "white" }}><h2 style={{ margin: 0 }}>షాప్ యజమాని డాష్‌బోర్డ్</h2><p style={{ marginBottom: 0, fontSize: 13 }}>కొత్త ఆర్డర్లు: {orders.filter(o => o.status === "కొత్త ఆర్డర్").length} • యాక్టివ్: {activeOrders.length} • మొత్తం ఆర్డర్లు: {orders.length}</p></div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}><button style={btn(tab === "dashboard" ? "#047857" : "#cbd5e1", tab === "dashboard" ? "#fff" : "#0f172a")} onClick={() => setTab("dashboard")}>ఆర్డర్లు</button><button style={btn(tab === "inventory" ? "#047857" : "#cbd5e1", tab === "inventory" ? "#fff" : "#0f172a")} onClick={() => setTab("inventory")}>స్టాక్ / ధరలు</button><button style={btn(tab === "add" ? "#047857" : "#cbd5e1", tab === "add" ? "#fff" : "#0f172a")} onClick={() => setTab("add")}>సరుకు జోడించు</button></div>
          {tab === "dashboard" && <>
            {!orders.length && <div style={card}>ఇంకా ఆర్డర్లు లేవు. కస్టమర్ మోడ్‌లో టెస్ట్ ఆర్డర్ చేయండి.</div>}
            {orders.map(o => <div key={o.id} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><b>{o.id}</b><b>{money(o.total)}</b></div>
              <div style={{ fontSize: 13, marginTop: 5 }}>{o.customer.name} • {o.customer.phone}</div><div style={{ fontSize: 13 }}>{o.customer.address}</div><div style={{ margin: "8px 0" }}>చెల్లింపు: {o.payment} • స్థితి: <b>{o.status}</b></div>
              {o.items.map(i => <div key={i.id} style={{ fontSize: 13 }}>{i.te} × {i.qty} — {money(i.price * i.qty)}</div>)}
              {o.payment === "UPI" && <div style={{ background: "#fffbeb", padding: 8, borderRadius: 8, fontSize: 12, marginTop: 8 }}>UPI చెల్లింపును మీ బ్యాంక్/UPI యాప్‌లో స్వయంగా ధృవీకరించండి.</div>}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                {o.status === "కొత్త ఆర్డర్" && <button style={btn()} onClick={() => setStatus(o.id, "అంగీకరించారు")}>ఆర్డర్ అంగీకరించు</button>}
                {o.status === "అంగీకరించారు" && <button style={btn("#d97706")} onClick={() => setStatus(o.id, "ప్యాకింగ్")}>ప్యాకింగ్</button>}
                {o.status === "ప్యాకింగ్" && <button style={btn("#2563eb")} onClick={() => setStatus(o.id, "డెలివరీకి బయలుదేరింది")}>డెలివరీకి పంపు</button>}
                {!["డెలివరీ పూర్తయింది", "రద్దు"].includes(o.status) && <button style={btn("#fee2e2", "#991b1b")} onClick={() => setStatus(o.id, "రద్దు")}>రద్దు</button>}
              </div>
            </div>)}
          </>}
          {tab === "inventory" && <div style={card}><h3 style={{ marginTop: 0 }}>స్టాక్ మరియు ధరలు</h3>{products.map(p => <div key={p.id} style={{ padding: "12px 0", borderBottom: "1px solid #e2e8f0" }}><b>{p.te}</b><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 6 }}><label style={label}>ధర (₹)<input style={field} type="number" min="1" value={p.price} onChange={e => updateProduct(p.id, "price", Math.max(1, Number(e.target.value)))} /></label><label style={label}>స్టాక్<input style={field} type="number" min="0" value={p.stock} onChange={e => updateProduct(p.id, "stock", Math.max(0, Number(e.target.value)))} /></label></div></div>)}</div>}
          {tab === "add" && <form style={card} onSubmit={addProduct}><h3 style={{ marginTop: 0 }}>కొత్త సరుకు జోడించండి</h3><label style={label}>ఇంగ్లీష్ పేరు<input style={field} value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} /></label><label style={label}>తెలుగు పేరు<input style={field} value={newProduct.te} onChange={e => setNewProduct({ ...newProduct, te: e.target.value })} /></label><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}><label style={label}>ధర<input style={field} type="number" min="1" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} /></label><label style={label}>స్టాక్<input style={field} type="number" min="0" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} /></label></div><label style={label}>కేటగిరీ<input style={field} value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} /></label><button type="submit" style={btn()}>సరుకు సేవ్ చేయండి</button></form>}
        </>}

        {role === "delivery" && <>
          <div style={{ ...card, background: "#1d4ed8", color: "white" }}><h2 style={{ margin: 0 }}>డెలివరీ బాయ్</h2><p style={{ marginBottom: 0, fontSize: 13 }}>ఇది ప్రారంభ డెమో. ప్రస్తుతం ఆర్డర్లు అందరికీ కనిపిస్తాయి; నిజమైన యాప్‌లో లాగిన్, వ్యక్తిగత కేటాయింపులు జోడించాలి.</p></div>
          {!orders.filter(o => ["ప్యాకింగ్", "డెలివరీకి బయలుదేరింది"].includes(o.status)).length && <div style={card}>డెలివరీకి సిద్ధంగా ఉన్న ఆర్డర్లు లేవు.</div>}
          {orders.filter(o => ["ప్యాకింగ్", "డెలివరీకి బయలుదేరింది"].includes(o.status)).map(o => <div key={o.id} style={card}>
            <b>{o.id}</b><div style={{ marginTop: 5 }}>{o.customer.name} • {o.customer.phone}</div><div>{o.customer.address}</div><div style={{ margin: "8px 0" }}>స్థితి: <b>{o.status}</b></div><div>వసూలు చేయాల్సిన మొత్తం: <b>{o.payment === "COD" ? money(o.total) : "UPI చెల్లింపు ధృవీకరించండి"}</b></div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              <a href={`tel:${o.customer.phone}`} style={{ ...btn("#e0f2fe", "#075985"), textDecoration: "none" }}>📞 కాల్</a>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.customer.address)}`} target="_blank" rel="noreferrer" style={{ ...btn("#dbeafe", "#1d4ed8"), textDecoration: "none" }}>📍 మ్యాప్</a>
              {o.status === "ప్యాకింగ్" && <button style={btn("#2563eb")} onClick={() => setStatus(o.id, "డెలివరీకి బయలుదేరింది")}>సరుకు తీసుకున్నాను</button>}
              {o.status === "డెలివరీకి బయలుదేరింది" && <button style={btn()} onClick={() => setStatus(o.id, "డెలివరీ పూర్తయింది")}>డెలివరీ పూర్తయింది</button>}
            </div>
          </div>)}
        </>}
        <footer style={{ textAlign: "center", color: "#64748b", fontSize: 11, padding: 16 }}>Mana Kirana • ప్రారంభ డెమో • నిజమైన వినియోగానికి ముందు భద్రత, డేటాబేస్, చెల్లింపు ధృవీకరణ జోడించాలి.</footer>
      </main>
    </div>
  );
}
