https://vrihiynknoixqjtbvsqi.supabase.co/rest/v1/
sb_publishable_QLh4y-e7UpLwHW6cuRS_pQ_nIaLGtDe
const products = [
  {id:1,name:"Smartphone",category:"Electronics",price:2499,icon:"📱"},
  {id:2,name:"Running Sneakers",category:"Fashion",price:899,icon:"👟"},
  {id:3,name:"Wireless Headphones",category:"Electronics",price:699,icon:"🎧"},
  {id:4,name:"Smart Watch",category:"Electronics",price:1199,icon:"⌚"},
  {id:5,name:"Ladies Handbag",category:"Fashion",price:599,icon:"👜"},
  {id:6,name:"Perfume Gift Set",category:"Beauty",price:449,icon:"💄"},
  {id:7,name:"Home Coffee Maker",category:"Home",price:999,icon:"☕"},
  {id:8,name:"Football & Bottle Set",category:"Sports",price:499,icon:"⚽"}
];

let cart = JSON.parse(localStorage.getItem("hlubiCart") || "[]");
const demoProducts = products.map(p => ({...p, approved: true, demo: true}));
function readList(key){ try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } }
function writeList(key,value){ localStorage.setItem(key,JSON.stringify(value)); }
let sellerApplications = readList("hlubiSellers");
let submittedProducts = readList("hlubiSubmittedProducts");

function money(n){ return "R" + n.toLocaleString("en-ZA",{minimumFractionDigits:2,maximumFractionDigits:2}); }

function renderProducts(){
  const filter = document.getElementById("categoryFilter").value;
  const visibleProducts = [...demoProducts, ...submittedProducts.filter(p=>p.status==="approved")];
  const list = filter==="all" ? visibleProducts : visibleProducts.filter(p=>p.category===filter);
  document.getElementById("productGrid").innerHTML = list.map(p=>`
    <article class="product">
      <div class="product-img">${p.icon}</div>
      <div class="product-body">
        <small>${p.category}</small>
        <h3>${p.name}</h3>
        <div class="price">${money(p.price)}</div>
        <button class="btn add" onclick="addToCart(${p.id})">Add to Cart</button>
      </div>
    </article>`).join("");
}

function addToCart(id){
  const item = cart.find(x=>x.id===id);
  if(item) item.qty++;
  else cart.push({id,qty:1});
  saveCart();
  updateCartCount();
  openCart();
}

function saveCart(){localStorage.setItem("hlubiCart",JSON.stringify(cart));}

function updateCartCount(){
  document.getElementById("cartCount").textContent = cart.reduce((s,x)=>s+x.qty,0);
}

function openCart(){
  document.getElementById("cartModal").classList.remove("hidden");
  renderCart();
}
function closeCart(e){
  if(!e || e.target.id==="cartModal") document.getElementById("cartModal").classList.add("hidden");
}

function renderCart(){
  const box=document.getElementById("cartItems");
  if(!cart.length){
    box.innerHTML="<p>Your cart is empty. Add a product to begin.</p>";
    document.getElementById("cartTotal").textContent=money(0);
    return;
  }
  let total=0;
  box.innerHTML=cart.map(item=>{
    const p=products.find(x=>x.id===item.id); const line=p.price*item.qty; total+=line;
    return `<div class="cart-row"><span>${p.icon} ${p.name} × ${item.qty}</span><strong>${money(line)}</strong></div>`;
  }).join("");
  document.getElementById("cartTotal").textContent=money(total);
}

function submitSeller(e){
  e.preventDefault();
  const seller={
    id:Date.now(), name:document.getElementById("sellerName").value.trim(),
    email:document.getElementById("sellerEmail").value.trim(),
    phone:document.getElementById("sellerPhone").value.trim(),
    product:document.getElementById("sellerProduct").value.trim(),
    date:new Date().toISOString(), status:"pending"
  };
  const product={
    id:Date.now()+1, sellerId:seller.id, sellerName:seller.name,
    name:seller.product, price:Number(document.getElementById("sellerPrice").value),
    category:document.getElementById("sellerCategory").value, icon:"🛍️",
    date:new Date().toISOString(), status:"pending"
  };
  sellerApplications=readList("hlubiSellers"); sellerApplications.push(seller); writeList("hlubiSellers",sellerApplications);
  submittedProducts=readList("hlubiSubmittedProducts"); submittedProducts.push(product); writeList("hlubiSubmittedProducts",submittedProducts);
  document.getElementById("sellerMessage").textContent="Application received. Your seller application and product are PENDING owner review. Joining is free during testing.";
  e.target.reset(); renderAdmin();
}

/*
  PAYPAL SETUP
  1. Create a PayPal Developer/Sandbox app.
  2. Copy the Client ID.
  3. Replace YOUR_PAYPAL_CLIENT_ID below.
  4. Add the PayPal SDK script to index.html:
     <script src="https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=ZAR"></script>
  5. Then add a createOrder/onApprove button integration.

  This demo intentionally does NOT pretend to process real money until your PayPal
  Client ID is supplied and the checkout is configured.
*/

function escapeHtml(value){ return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch])); }
function renderAdmin(){
  sellerApplications=readList("hlubiSellers"); submittedProducts=readList("hlubiSubmittedProducts");
  const sellerBox=document.getElementById("sellerQueue");
  const productBox=document.getElementById("productQueue");
  if(!sellerBox || !productBox) return;
  sellerBox.innerHTML=sellerApplications.length ? sellerApplications.map(s=>`<article class="review-item"><strong>${escapeHtml(s.name)}</strong><span>${escapeHtml(s.email)} · ${escapeHtml(s.phone)}</span><span>Applied: ${new Date(s.date).toLocaleDateString("en-ZA")}</span><span class="status ${s.status}">${s.status.toUpperCase()}</span>${s.status==="pending"?`<div class="review-actions"><button class="btn approve" onclick="reviewSeller(${s.id},'approved')">Approve seller</button><button class="btn reject" onclick="reviewSeller(${s.id},'rejected')">Reject</button></div>`:""}</article>`).join("") : '<p class="muted">No seller applications yet.</p>';
  productBox.innerHTML=submittedProducts.length ? submittedProducts.map(p=>`<article class="review-item"><strong>${escapeHtml(p.name)}</strong><span>Seller: ${escapeHtml(p.sellerName)}</span><span>${escapeHtml(p.category)} · ${money(Number(p.price)||0)}</span><span class="status ${p.status}">${p.status.toUpperCase()}</span>${p.status==="pending"?`<div class="review-actions"><button class="btn approve" onclick="reviewProduct(${p.id},'approved')">Approve product</button><button class="btn reject" onclick="reviewProduct(${p.id},'rejected')">Reject</button></div>`:""}</article>`).join("") : '<p class="muted">No product submissions yet.</p>';
}
function reviewSeller(id,status){
  sellerApplications=readList("hlubiSellers"); const s=sellerApplications.find(x=>x.id===id); if(!s)return; s.status=status; writeList("hlubiSellers",sellerApplications); renderAdmin();
}
function reviewProduct(id,status){
  submittedProducts=readList("hlubiSubmittedProducts"); const p=submittedProducts.find(x=>x.id===id); if(!p)return;
  const seller=readList("hlubiSellers").find(x=>x.id===p.sellerId);
  if(status==="approved" && (!seller || seller.status!=="approved")){ alert("Approve this seller first. Products cannot be published until the seller is approved."); return; }
  p.status=status; writeList("hlubiSubmittedProducts",submittedProducts); renderProducts(); renderAdmin();
}
function clearDemoApplications(){
  if(!confirm("Clear all seller applications and submitted products saved in this browser? This cannot be undone.")) return;
  localStorage.removeItem("hlubiSellers"); localStorage.removeItem("hlubiSubmittedProducts"); sellerApplications=[]; submittedProducts=[]; renderAdmin(); renderProducts();
}
renderProducts();
updateCartCount();
renderAdmin();
