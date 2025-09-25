import React, { useEffect, useMemo, useState } from "react";

/**
 * CosmoShop — v3
 * - Hero: без фразы про бренды, справа фото врача (/images/doctor.jpg)
 * - Шапка: фиксированный белый список городов (фильтруем по stores_list)
 * - Роутер: / (дом), /category/:id, /checkout
 * - Категории ведут на отдельные страницы
 * - Избранное: сердечко на карточке
 * - Checkout: 3 шага (город → пункт выдачи → оплата), заглушка для ЮKassa
 */

// ====== Тема/стили ======
const ROOT_CSS_VARS = {
  primary: "#5B6EF5",
  primaryDark: "#3E4CD6",
  accent: "#F5B6C5",
  neutral: "#111827",
  muted: "#6B7280",
  bg: "#F9FAFB",
  card: "#FFFFFF",
};

const style = (
  <style>{`
  :root{--primary:${ROOT_CSS_VARS.primary};--primary-dark:${ROOT_CSS_VARS.primaryDark};--accent:${ROOT_CSS_VARS.accent};--neutral:${ROOT_CSS_VARS.neutral};--muted:${ROOT_CSS_VARS.muted};--bg:${ROOT_CSS_VARS.bg};--card:${ROOT_CSS_VARS.card};}
  *{box-sizing:border-box}
  html,body,#root{height:100%}
  body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Inter,Roboto,Helvetica,Arial; background:var(--bg); color:var(--neutral); margin:0}
  img{max-width:100%; height:auto; display:block}
  a{color:inherit}
  .container{max-width:1200px;margin:0 auto;padding:0 16px}
  .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 18px;background:var(--primary);color:#fff;border-radius:14px;border:0;cursor:pointer;transition:all .2s}
  .btn:hover{background:var(--primary-dark);transform:translateY(-1px)}
  .btn-outline{background:#fff;color:var(--primary);border:1px solid var(--primary)}
  .btn-ghost{background:transparent;border:1px dashed #e5e7eb;color:var(--neutral)}
  .btn.sm{padding:8px 12px;border-radius:12px;font-size:14px}
  .btn.icon{padding:8px 10px;border-radius:10px}
  .btn.lg{padding:14px 22px;border-radius:14px;font-size:16px}
  .notice{border:2px solid var(--primary);background:#fff;padding:10px 12px;border-radius:12px;box-shadow:0 1px 0 rgba(0,0,0,.02)}
  header{position:sticky;top:0;z-index:30;background:#fff;border-bottom:1px solid #e5e7eb}
  nav a{color:var(--neutral);text-decoration:none;font-weight:600}
  nav a:hover{color:var(--primary)}
  .hero{background:linear-gradient(135deg,#fff 0%,var(--accent) 100%);border-radius:24px;overflow:hidden}
  .hero-inner{display:grid;grid-template-columns:1.1fr .9fr;gap:24px;padding:24px}
  .hero h1{font-size:36px;line-height:1.2;margin:0 0 8px;word-wrap:break-word}
  @media(max-width:560px){.hero-inner{grid-template-columns:1fr}.hero h1{font-size:28px}}
  .grid{display:grid;gap:16px}
  .grid.products{grid-template-columns:repeat(4,minmax(0,1fr))}
  @media(max-width:1200px){.grid.products{grid-template-columns:repeat(3,minmax(0,1fr))}}
  @media(max-width:900px){.grid.products{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(max-width:560px){.grid.products{grid-template-columns:1fr}}
  .card{background:var(--card);border:1px solid #e5e7eb;border-radius:18px;padding:16px}
  .price{font-weight:800;font-size:18px}
  .muted{color:var(--muted)}
  .brand-chip{padding:8px 12px;border-radius:999px;border:1px solid #e5e7eb;background:#fff;cursor:pointer;opacity:.6}
  .brand-chip.active{border-color:var(--primary);color:var(--primary);opacity:1}
  .toolbar{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
  input,select,textarea{width:100%;padding:10px 12px;border:1px solid #e5e7eb;border-radius:12px;background:#fff}
  .cart-panel{position:fixed;right:16px;bottom:16px;width:360px;max-width:95vw;background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:16px;box-shadow:0 10px 30px rgba(0,0,0,.08)}
  .tag{display:inline-flex;padding:6px 10px;border:1px solid #e5e7eb;border-radius:999px;font-size:12px;color:var(--muted)}
  footer{margin-top:56px;padding:32px 0;border-top:1px solid #e5e7eb}
  /* Модалки */
  .backdrop{position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;padding:16px;z-index:50}
  .modal{background:#fff;border-radius:16px;max-width:720px;width:100%;padding:20px;border:1px solid #e5e7eb}
`}</style>
);

// ====== Утилиты ======
const defaultBrands = ["bioakneroll", "lamar", "angiofarm"];
const CATEGORIES = [
  { key: "antiacne", label: "Против акне" },
  { key: "antiage", label: "Антиэйдж" },
  { key: "formen", label: "Для мужчин" },
  { key: "body", label: "Уход за телом" },
  { key: "face", label: "Уход за лицом" },
];
const HEADER_CITY_WHITELIST = ["Пермь","Москва","Самара","Уфа","Иркутск","Омск","Владивосток","Тюмень","Сургут","Казань","Ижевск"];
// ОДНА ФОТО ДЛЯ ВСЕХ ТОВАРОВ (замените файл в /public/images/product.jpg)
const SINGLE_PRODUCT_IMAGE = '/images/product.jpg';
function normalize(str=""){return str.toLowerCase().replace(/ё/g,"е").trim();}
function detectBrand(itemName){const n=normalize(itemName);for(const b of defaultBrands){if(n.includes(normalize(b))) return b;}return "прочее";}
function money(x){if(x==null||x==="")return "—";const num=Number(String(x).replace(",","."));if(Number.isNaN(num))return String(x);return new Intl.NumberFormat("ru-RU",{style:"currency",currency:"RUB",maximumFractionDigits:0}).format(num);}
function sumStock(storesArr=[]){let total=0;for(const s of storesArr){const val=parseFloat(String(s.store_amount||0).replace(",","."));if(!Number.isNaN(val)) total+=val;}return total;}
function sumCityStock(storesArr=[], cityId){const s = storesArr.find(x=>x.store_id===cityId); if(!s) return 0; const v=parseFloat(String(s.store_amount||0).replace(",",".")); return Number.isNaN(v)?0:v;}
function buildPriceMap(prices_list=[]){const byName=new Map();const byId=new Map();for(const p of prices_list){byName.set(normalize(p.price_name),p.price_id);byId.set(p.price_id,p.price_name);}return{byName,byId};}
function pickPreferredPrice(pricesArr=[], prices_list=[]) {
  const { byName } = buildPriceMap(prices_list);
  const retailId = byName.get(normalize("Розничная"));
  let price = "";
  if (retailId) price = pricesArr.find(p=>p.price_id===retailId)?.price || "";
  if (!price) price = (pricesArr.find(p=>p.price && String(p.price).trim()!=="")||{}).price || "";
  return price;
}
function useLocalStorage(key, initial){const [state,setState]=useState(()=>{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):initial;}catch{return initial;}});useEffect(()=>{localStorage.setItem(key,JSON.stringify(state));},[key,state]);return[state,setState];}
function hashToCategory(key){ let h=0; for(let i=0;i<key.length;i++){ h=(h*31+key.charCodeAt(i))|0; } const idx=Math.abs(h)%CATEGORIES.length; return CATEGORIES[idx].key; }

// ====== Авторизация (эмуляция) ======
const AuthContext = React.createContext(null);
function useAuth(){return React.useContext(AuthContext)}
function AuthProvider({children}){
  const [user,setUser]=useLocalStorage("cosmoshop.user", null);
  const loginEmail=(email)=>{setUser({ id: "u"+Date.now(), email});}
  const loginGoogle=()=>{setUser({ id: "google"+Date.now(), email: "google-user@example.com", provider:"google"});}
  const loginApple=()=>{setUser({ id: "apple"+Date.now(), email: "apple-user@example.com", provider:"apple"});}
  const logout=()=>setUser(null);
  return <AuthContext.Provider value={{user,loginEmail,loginGoogle,loginApple,logout}}>{children}</AuthContext.Provider>
}

// ====== Примитивный роутер (History API) ======
function useRouter(){
  const [path,setPath]=useState(window.location.pathname+window.location.search+window.location.hash);
  useEffect(()=>{const onPop=()=>setPath(window.location.pathname+window.location.search+window.location.hash);window.addEventListener('popstate',onPop);return()=>window.removeEventListener('popstate',onPop);},[]);
  const navigate=(to)=>{if(to===path) return; window.history.pushState({},"",to); setPath(to); window.scrollTo({top:0,behavior:'smooth'});};
  return { path, navigate };
}
function Link({to,children,className}){const {navigate}=React.useContext(RouterCtx);return <a href={to} className={className} onClick={(e)=>{e.preventDefault();navigate(to);}}>{children}</a>}
const RouterCtx=React.createContext({path:"/",navigate:()=>{}});

// ====== Компоненты ======
function Header({
  cartCount,
  onOpenAuth,
  onOpenAccount,
  onOpenFavs,
  onOpenCart,
  selectedCityId,
  setSelectedCityId,
  cities,
  user,
}) {
  return (
    <header>
      <div
        className="container"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto auto auto",
          gap: 12,
          alignItems: "center",
          padding: "12px 0",
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 20, whiteSpace: "nowrap" }}>
          CosmoShop
        </div>

        {/* Выбор города */}
        <div style={{ minWidth: 220 }}>
          <select value={selectedCityId} onChange={(e) => setSelectedCityId(e.target.value)}>
            <option value="all">Все города</option>
            {cities.map((c) => (
              <option key={c.store_id} value={c.store_id}>
                {c.store_name}
              </option>
            ))}
          </select>
        </div>

        {/* Кнопки справа */}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button className="btn btn-outline sm" onClick={onOpenFavs}>★ Избранное</button>

          {/* Войти / Аккаунт */}
          <button
            className="btn btn-outline sm"
            onClick={() => (user ? onOpenAccount() : onOpenAuth())}
            title={user ? user.email : "Войти"}
          >
            {user ? "👤 Аккаунт" : "🔑 Войти"}
          </button>

          {/* Корзина */}
          <button className="btn sm" style={{ justifySelf: "end" }} onClick={onOpenCart}>
            🛒 {cartCount ? `Корзина (${cartCount})` : "Корзина"}
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero({ onBookClick, brandFilter, setBrandFilter }) {
  return (
    <section className="container" style={{ marginTop: 16 }}>
      <div className="hero">
        <div className="hero-inner">
          <div>
            <div className="kicker">Профессиональная косметика</div>
            <h1>Здоровая кожа начинается с правильного ухода</h1>

            {/* Важные условия — тремя отдельными плашками */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              <div className="notice">Диагностика кожи <b>бесплатна</b></div>
              <div className="notice">Запись за <b>30 секунд</b></div>
              <div className="notice">После диагностики — <b>скидка 10%</b></div>
            </div>

            {/* CTA */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              <button className="btn lg" type="button" onClick={onBookClick}>
                Записаться на диагностику кожи
              </button>
              <a href="#catalog" className="btn btn-outline">Смотреть каталог</a>
            </div>

            {/* Фильтры брендов (полупрозрачные, активный ярче) */}
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              {[
                { key: "all", label: "Все бренды" },
                { key: "bioakneroll", label: "BioAkneRoll" },
                { key: "lamar", label: "Lamar" },
                { key: "angiofarm", label: "Angiofarm" },
              ].map((b) => (
                <button
                  key={b.key}
                  className={`brand-chip ${brandFilter === b.key ? "active" : ""}`}
                  onClick={() => setBrandFilter(b.key)}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Правая картинка — без серой/белой подложки, PNG, с прозрачностью */}
          <div style={{ alignSelf: "center" }}>
            <img
              src="/images/doctor.png"
              alt="Дерматолог"
              onError={(e) => { e.currentTarget.src = "/images/placeholder.png"; }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}


function ProductCard({ item, priceRub, cityStock, isFav, onToggleFav, onOpen, onAdd }) {
  const brand = detectBrand(item.item_name);
  return (
    <div className="card">
      <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>{brand === "прочее" ? "" : brand}</div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <button onClick={()=>onOpen(item)} style={{background:'transparent',border:0,textAlign:'left',padding:0,cursor:'pointer',fontWeight:700,minHeight:42,flex:1}}>{item.item_name}</button>
        <button className="btn icon btn-outline" onClick={()=>onToggleFav(item)} title={isFav?"Убрать из избранного":"В избранное"}>{isFav?"★":"☆"}</button>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, gap:8, flexWrap:'wrap' }}>
        <div className="price">{money(priceRub)}</div>
        <div className="muted" style={{ fontSize: 12 }}>В наличии: {cityStock}</div>
      </div>
      <button className="btn" style={{ width: "100%", marginTop: 10 }} onClick={() => onAdd(item)} disabled={!priceRub || cityStock<=0}>
        В корзину
      </button>
    </div>
  );
}

function ProductModal({ item, prices_list, onClose, onAdd, onToggleFav, isFav }){
  if(!item) return null;
  const priceRub = pickPreferredPrice(item.prices, prices_list);
  const imgUrl = SINGLE_PRODUCT_IMAGE || `/images/${item.item_id}.jpg`;
  const details = item._details || { description: "Описание будет добавлено." };
  return (
    <div className="backdrop" role="dialog" aria-modal>
      <div className="modal">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8,flexWrap:'wrap'}}>
          <b>{item.item_name}</b>
          <button className="btn btn-outline" onClick={onClose}>Закрыть</button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginTop:12}}>
          <div><img src={imgUrl} alt={item.item_name} onError={(e)=>{e.currentTarget.src='/images/placeholder.png'}}/></div>
          <div>
            <div className="price">{money(priceRub)}</div>
            <p className="muted" style={{marginTop:8,whiteSpace:'pre-wrap'}}>{details.description}</p>
            <div style={{display:'flex',gap:8,marginTop:12,flexWrap:'wrap'}}>
              <button className="btn" onClick={()=>onAdd(item)} disabled={!priceRub}>В корзину</button>
              <button className="btn btn-outline" onClick={()=>onToggleFav(item)}>{isFav?"Убрать из избранного":"В избранное"}</button>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function FavoritesModal({ favorites, onClose, onOpenItem }) {
  return (
    <div className="backdrop" role="dialog" aria-modal>
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <b>Избранное</b>
          <button className="btn btn-outline" onClick={onClose}>Закрыть</button>
        </div>

        {favorites.length === 0 ? (
          <div className="muted" style={{ marginTop: 8 }}>Пусто</div>
        ) : (
          <div className="grid" style={{ marginTop: 12, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
            {favorites.map((f) => (
              <button
                key={f.id}
                className="card"
                style={{ textAlign: 'left', cursor: 'pointer' }}
                onClick={() => onOpenItem(f.id)}
              >
                <div style={{ fontWeight: 600 }}>{f.name}</div>
                <div className="muted" style={{ fontSize: 12 }}>Открыть карточку</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AuthModal({ onClose }) {
  const { loginEmail, loginGoogle, loginApple } = useAuth();
  const [email, setEmail] = React.useState("");
  const submit = (e) => { e.preventDefault(); if (!email.trim()) return; loginEmail(email.trim()); onClose(); };
  return (
    <div className="backdrop" role="dialog" aria-modal>
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <b>Вход в аккаунт</b>
          <button className="btn btn-outline" onClick={onClose}>Закрыть</button>
        </div>
        <form onSubmit={submit} style={{ display: 'grid', gap: 12, marginTop: 12 }}>
          <div>
            <label className="muted">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button className="btn" type="submit">Войти по email</button>
        </form>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          <button className="btn btn-outline" onClick={() => { loginGoogle(); onClose(); }}>Войти через Google</button>
          <button className="btn btn-outline" onClick={() => { loginApple(); onClose(); }}>Войти через Apple</button>
        </div>
      </div>
    </div>
  );
}

function AccountModal({ onClose, orders = [], favorites = [], onCancelOrder = () => {}, onOpenItem = () => {} }) {
  const { user, logout } = useAuth();
  return (
    <div className="backdrop" role="dialog" aria-modal>
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <b>Аккаунт</b>
          <button className="btn btn-outline" onClick={onClose}>Закрыть</button>
        </div>

        <div className="muted" style={{ marginTop: 8 }}>
          Вы вошли как: <b>{user?.email}</b>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16 }}>
          <button className="btn btn-outline" onClick={() => { logout(); onClose(); }}>Выйти</button>
        </div>

        <div style={{ marginTop: 16 }}>
          <b>Мои заказы</b>
          {orders.length === 0 ? (
            <div className="muted" style={{ marginTop: 6 }}>Пока пусто</div>
          ) : (
            <div className="grid" style={{ marginTop: 8 }}>
              {orders.map((o) => (
                <div key={o.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <div>
                      <b>Заказ #{o.id}</b> · <span className="muted">{new Date(o.createdAt).toLocaleString('ru-RU')}</span>
                    </div>
                    <div className="tag">{o.status}</div>
                  </div>
                  <div className="muted" style={{ marginTop: 8 }}>
                    Сумма: <b>{money(o.total)}</b>; Пункт выдачи: {o.pickup?.city}, {o.pickup?.address}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                    <button className="btn btn-outline" onClick={() => onCancelOrder(o.id)}>Отменить</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: 16 }}>
          <b>Избранное</b>
          {favorites.length === 0 ? (
            <div className="muted" style={{ marginTop: 6 }}>Пусто</div>
          ) : (
            <div className="grid" style={{ marginTop: 8, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
              {favorites.map((f) => (
                <button
                  key={f.id}
                  className="card"
                  style={{ textAlign: 'left', cursor: 'pointer' }}
                  onClick={() => onOpenItem(f.id)}
                >
                  <div style={{ fontWeight: 600 }}>{f.name}</div>
                  <div className="muted" style={{ fontSize: 12 }}>Открыть карточку</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CartPanel({ items, onClose, onRemove }) {
  const { navigate } = React.useContext(RouterCtx);
  const total = items.reduce((acc, it) => acc + it.price * it.qty, 0);
  return (
    <div className="cart-panel" id="cart">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <b>Корзина</b>
        <button className="btn btn-outline" onClick={onClose}>Закрыть</button>
      </div>
      <div style={{ marginTop: 12, maxHeight: 260, overflow: "auto", paddingRight: 6 }}>
        {items.length === 0 ? <div className="muted">Пока пусто</div> : items.map((it, idx) => (
          <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, padding: "8px 0", borderBottom: "1px solid #F3F4F6" }}>
            <div>
              <div style={{ fontWeight: 600 }}>{it.name}</div>
              <div className="muted" style={{ fontSize: 12 }}>×{it.qty}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div>{money(it.price * it.qty)}</div>
              <button className="btn btn-outline" style={{ marginTop: 6 }} onClick={() => onRemove(idx)}>Удалить</button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
        <div className="muted">Итого</div>
        <div style={{ fontWeight: 800 }}>{money(total)}</div>
      </div>
      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
        <button className="btn" onClick={()=>navigate('/checkout')} disabled={!items.length}>Перейти к оформлению</button>
      </div>
    </div>
  );
}

function BookingForm({ onClose }){
  const CITY = "Пермь";
  const ADDRESSES = ["Ленина 10", "Пушкина 120"];
  const [city] = useState(CITY);
  const [address, setAddress] = useState(ADDRESSES[0]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const handleSubmit=(e)=>{e.preventDefault();const subject=encodeURIComponent("Запись к врачу");const body=encodeURIComponent(`Город: ${city}\nАдрес: ${address}\nДата: ${date}\nВремя: ${time}\nИмя: ${name}\nТелефон: ${phone}`);window.location.href=`mailto:info@yourdomain.ru?subject=${subject}&body=${body}`;};
  return (
    <div className="card" id="booking">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <b>Запись к врачу</b>
        <button className="btn btn-outline" onClick={onClose}>Закрыть</button>
      </div>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, marginTop: 12 }}>
        <div><label className="muted">Город</label><input value={city} readOnly/></div>
        <div><label className="muted">Адрес точки осмотра</label><select value={address} onChange={(e)=>setAddress(e.target.value)}>{ADDRESSES.map(a=> <option key={a} value={a}>{a}</option>)}</select></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label className="muted">Дата</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></div>
          <div><label className="muted">Время</label><input type="time" value={time} onChange={(e) => setTime(e.target.value)} required /></div>
        </div>
        <div><label className="muted">Имя</label><input value={name} onChange={(e) => setName(e.target.value)} required /></div>
        <div><label className="muted">Телефон</label><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7" required /></div>
        <button className="btn" type="submit">Отправить заявку</button>
      </form>
      <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>Приём бесплатный. Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.</div>
    </div>
  );
}

// ====== Страницы ======
function HomePage({data, prices_list, selectedCityId, setSelectedCityId, q, setQ, brandFilter, setBrandFilter, favorites, toggleFav, openItem, addToCart}){
  const filteredItems = useMemo(() => {
    const needle = normalize(q);
    return data.items.filter((it)=>{
      const brand = detectBrand(it.item_name);
      const byAllowed = brand !== "прочее"; // только наши бренды
      const byBrand = brandFilter === "all" ? true : brand === brandFilter;
      const bySearch = !needle || normalize(it.item_name).includes(needle);
      const byCity = selectedCityId === 'all' ? sumStock(it.stores) > -Infinity : sumCityStock(it.stores, selectedCityId) > 0;
      return byAllowed && byBrand && bySearch && byCity;
    }).slice(0,600);
  },[data.items,q,brandFilter,selectedCityId]);

  return (
    <>
      {/* Плашка с категориями — ВЫШЕ каталога */}
      <section className="card" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,alignItems:'center'}}>
        <div>
          <img src="/images/categories.png" alt="Наша продукция" onError={(e)=>{e.currentTarget.src='/images/placeholder.png'}}/>
        </div>
        <div>
          <b style={{display:'block',marginBottom:8}}>Популярные категории товаров</b>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12}}>
            {CATEGORIES.map(c=> <Link key={c.key} className="btn btn-outline" to={`/category/${c.key}`}>{c.label}</Link>)}
          </div>
        </div>
      </section>

      <section id="catalog" className="card" style={{ marginTop: 8 }}>
        <div className="toolbar">
          <div style={{ fontWeight: 800, fontSize: 18 }}>Каталог</div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 12, flexWrap: "wrap" }}>
            <input placeholder="Поиск по названию" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          {[
            { key: "all", label: "Все бренды" },
            { key: "bioakneroll", label: "BioAkneRoll" },
            { key: "lamar", label: "Lamar" },
            { key: "angiofarm", label: "Angiofarm" },
          ].map((b) => (
            <button key={b.key} className={`brand-chip ${brandFilter===b.key?"active":""}`} onClick={()=>setBrandFilter(b.key)}>
              {b.label}
            </button>
          ))}
        </div>
        <div className="muted" style={{ marginTop: 8 }}>Найдено {filteredItems.length} товаров</div>
        <div className="grid products" style={{ marginTop: 16 }}>
          {filteredItems.map((it) => (
            <ProductCard
              key={it.item_id}
              item={it}
              priceRub={pickPreferredPrice(it.prices, prices_list)}
              cityStock={selectedCityId==='all'?sumStock(it.stores):sumCityStock(it.stores, selectedCityId)}
              isFav={!!favorites.find(f=>f.id===it.item_id)}
              onToggleFav={toggleFav}
              onOpen={openItem}
              onAdd={addToCart}
            />
          ))}
        </div>
      </section>
    </>
  );
}

function CategoryPage({data, prices_list, selectedCityId, favorites, toggleFav, openItem, addToCart, catKey}){
  const title = CATEGORIES.find(c=>c.key===catKey)?.label || "Категория";
  const items = useMemo(()=>{
    return data.items.filter(it=>{
      const brand = detectBrand(it.item_name);
      const byAllowed = brand !== 'прочее';
      const byCity = selectedCityId === 'all' ? sumStock(it.stores) > -Infinity : sumCityStock(it.stores, selectedCityId) > 0;
      return byAllowed && byCity && hashToCategory(it.item_id)===catKey;
    }).slice(0,600);
  },[data.items,selectedCityId,catKey]);

  return (
    <section className="card" style={{marginTop:16}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8,flexWrap:'wrap'}}>
        <b>{title}</b>
        <Link to="/" className="btn btn-outline sm">← На главную</Link>
      </div>
      <div className="grid products" style={{ marginTop: 16 }}>
        {items.map(it=> (
          <ProductCard key={it.item_id}
            item={it}
            priceRub={pickPreferredPrice(it.prices, prices_list)}
            cityStock={selectedCityId==='all'?sumStock(it.stores):sumCityStock(it.stores, selectedCityId)}
            isFav={!!favorites.find(f=>f.id===it.item_id)}
            onToggleFav={toggleFav}
            onOpen={openItem}
            onAdd={addToCart}
          />
        ))}
      </div>
    </section>
  );
}

function CheckoutPage({cart, setCart, orders, setOrders}){
  const { user } = useAuth();
  const { navigate } = React.useContext(RouterCtx);
  useEffect(()=>{ if(!cart.length){ navigate('/'); } },[cart.length]);

  // Шаги
  const CITIES=["Пермь","Казань","Ижевск","Москва"];
  const ADDR={
    "Пермь":["Ленина 10","Пушкина 120"],
    "Казань":["Баумана 5","Победы 3"],
    "Ижевск":["Удмуртская 12","Кирова 8"],
    "Москва":["Тверская 7","Арбат 15"],
  };
  const [step,setStep]=useState(1);
  const [city,setCity]=useState(CITIES[0]);
  const [address,setAddress]=useState(ADDR[CITIES[0]][0]);
  const [method,setMethod]=useState("card"); // card | cod
  const total = cart.reduce((a,c)=>a+c.price*c.qty,0);

  useEffect(()=>{ setAddress(ADDR[city][0]); },[city]);

  const startYooKassaPayment = async () => {
    try{
      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, currency: 'RUB', description: `Заказ на сумму ${total}`, meta: { pickup: { city, address } } })
      });
      if(!res.ok){ throw new Error('create-payment failed'); }
      const data = await res.json();
      if(data.confirmation_url){
        window.location.href = data.confirmation_url;
        return;
      }
      alert('Не удалось получить ссылку на оплату.');
    }catch(err){
      console.error(err);
      alert('Ошибка инициализации оплаты. Проверьте бэкенд /api/create-payment.');
    }
  };

  const confirmOrder = ({ method }) => {
    const newOrder = {
      id: String(Date.now()).slice(-6),
      createdAt: new Date().toISOString(),
      items: cart,
      total,
      method,
      pickup: { city, address },
      status: 'в обработке',
    };
    setOrders((prev)=>[newOrder, ...prev]);
    setCart([]);
    navigate('/');
    alert('Заказ оформлен! Номер заказа #' + newOrder.id);
  };

  return (
    <section className="card" style={{marginTop:16}}>
      <b>Оформление заказа</b>

      {/* Шаги индикатор */}
      <div style={{display:'flex',gap:8,marginTop:12,flexWrap:'wrap'}}>
        {[1,2,3].map(n=> <span key={n} className="tag" style={{borderColor: n===step? 'var(--primary)':'#e5e7eb', color: n===step? 'var(--primary)':'var(--muted)'}}>Шаг {n}</span>)}
      </div>

      {/* Шаг 1: Город */}
      {step===1 && (
        <div className="card" style={{marginTop:12}}>
          <b>1) Выберите город получения</b>
          <div style={{marginTop:8}}>
            <select value={city} onChange={(e)=>setCity(e.target.value)}>
              {CITIES.map(c=> <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',marginTop:12}}>
            <button className="btn" onClick={()=>setStep(2)}>Дальше →</button>
          </div>
        </div>
      )}

      {/* Шаг 2: Пункт выдачи */}
      {step===2 && (
        <div className="card" style={{marginTop:12}}>
          <b>2) Выберите пункт выдачи</b>
          <div style={{marginTop:8}}>
            <select value={address} onChange={(e)=>setAddress(e.target.value)}>
              {ADDR[city].map(a=> <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:12}}>
            <button className="btn btn-outline" onClick={()=>setStep(1)}>← Назад</button>
            <button className="btn" onClick={()=>setStep(3)}>Дальше →</button>
          </div>
        </div>
      )}

      {/* Шаг 3: Оплата */}
      {step===3 && (
        <div className="card" style={{marginTop:12}}>
          <b>3) Способ оплаты</b>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>
            <button type="button" className={`btn ${method==="card"?"":"btn-outline"}`} onClick={()=>setMethod("card")}>Карта МИР (ЮKassa)</button>
            <button type="button" className={`btn ${method==="cod"?"":"btn-outline"}`} onClick={()=>setMethod("cod")}>При получении</button>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12}}>
            <div className="muted">Итого</div><div style={{fontWeight:800}}>{money(total)}</div>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:12}}>
            <button className="btn btn-outline" onClick={()=>setStep(2)}>← Назад</button>
            {method==='card' ? (
              <button className="btn" onClick={startYooKassaPayment}>Оплатить</button>
            ) : (
              <button className="btn" onClick={()=>confirmOrder({method:'cod'})}>Оформить</button>
            )}
          </div>
          <div className="muted" style={{marginTop:8,fontSize:12}}>Для ЮKassa нужен бэкенд: фронтенд должен вызвать ваш сервер, а сервер — API ЮKassa и вернуть ссылку на подтверждение платежа.</div>
        </div>
      )}

      <div style={{marginTop:12}}>
        <Link to="/" className="btn btn-outline sm">← Вернуться в магазин</Link>
      </div>
    </section>
  );
}

// ====== Приложение ======
export default function App() {
  const router = useRouter();

  // Данные
  const [data, setData] = useState({ stores_list: [], prices_list: [], items: [] });
  const [detailsMap, setDetailsMap] = useState({});

  // Витрина / UI
  const [q, setQ] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [selectedCityId, setSelectedCityId] = useLocalStorage("cosmoshop.city", "all");
  const [showCart, setShowCart] = useState(false);

  // Модалки
  const [showBooking, setShowBooking] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showFavs, setShowFavs] = useState(false);
  const [openedItem, setOpenedItem] = useState(null);

  // Корзина и аккаунтные данные
  const [cart, setCart] = useLocalStorage("cosmoshop.cart", []);
  const [favorites, setFavorites] = useLocalStorage("cosmoshop.favs", []);
  const [orders, setOrders] = useLocalStorage("cosmoshop.orders", []);
  const { user } = useAuth();

  // Загрузка данных
  useEffect(() => {
    async function load() {
      try { const res = await fetch('/Склады.json', { cache: 'no-store' }); if (!res.ok) throw new Error('HTTP ' + res.status); const json = await res.json(); setData(json); } catch (e) { console.error('Не удалось загрузить /Склады.json', e); }
      try { const d = await fetch('/details.json', { cache: 'no-store' }); if(d.ok){ const arr = await d.json(); const mp={}; for(const it of arr){ mp[it.item_id]={ description: it.description, image: it.image }; } setDetailsMap(mp); } } catch{}
    }
    load();
  }, []);

  // Обработка клика по избранному/товарам/корзине
  const requireAuth = () => { if (!user) { setShowAuth(true); return false; } return true; };
  const openItem = (itemOrId) => { const item = typeof itemOrId === 'string' ? data.items.find(x=>x.item_id===itemOrId) : itemOrId; if(!item) return; item._details = detailsMap[item.item_id]; setOpenedItem(item); };
  const toggleFav = (item) => { if (!requireAuth()) return; setFavorites((prev) => { const has = prev.find((x) => x.id === item.item_id); if (has) return prev.filter((x) => x.id !== item.item_id); return [...prev, { id: item.item_id, name: item.item_name }]; }); };
  const addToCart = (item) => { if (!requireAuth()) return; const priceStr = pickPreferredPrice(item.prices, data.prices_list); const priceNum = Number(String(priceStr).replace(",", ".")); if (!priceNum || Number.isNaN(priceNum)) { alert("Для этого товара нет цены"); return; } setCart((prev) => { const idx = prev.findIndex((x) => x.id === item.item_id); if (idx >= 0) { const copy = [...prev]; copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 }; return copy; } return [...prev, { id: item.item_id, name: item.item_name, price: priceNum, qty: 1 }]; }); };
  const removeFromCart = (idx) => setCart((prev) => prev.filter((_, i) => i !== idx));

  // Города для шапки — берём только из whitelist и существующие в stores_list
  const headerCities = useMemo(()=>{
    return (data.stores_list||[]).filter(s=> HEADER_CITY_WHITELIST.includes(s.store_name));
  },[data.stores_list]);

  // Маршрутизация
  const renderRoute = () => {
    const p = router.path;
    if (p.startsWith('/category/')) {
      const key = p.split('/category/')[1].split(/[?#]/)[0];
      return <CategoryPage data={data} prices_list={data.prices_list} selectedCityId={selectedCityId} favorites={favorites} toggleFav={toggleFav} openItem={openItem} addToCart={addToCart} catKey={key}/>;
    }
    if (p.startsWith('/checkout')) {
      return <CheckoutPage cart={cart} setCart={setCart} orders={orders} setOrders={setOrders}/>;
    }
    // Домашняя (Hero + список)
    return (
      <>
        <Hero onBookClick={() => setShowBooking(true)} brandFilter={"all"} setBrandFilter={()=>{}} />
        <HomePage data={data} prices_list={data.prices_list} selectedCityId={selectedCityId} setSelectedCityId={setSelectedCityId} q={q} setQ={setQ} brandFilter={brandFilter} setBrandFilter={setBrandFilter} favorites={favorites} toggleFav={toggleFav} openItem={openItem} addToCart={addToCart} />
      </>
    );
  };

  return (
    <RouterCtx.Provider value={router}>
      {style}
      <Header
  cartCount={cart.reduce((a, c) => a + c.qty, 0)}
  onOpenFavs={() => setShowFavs(true)}
  onOpenAuth={() => setShowAuth(true)}          // <- ЭТО открывает модалку входа
  onOpenAccount={() => setShowAccount(true)}    // <- ЭТО открывает модалку аккаунта
  onOpenCart={() => setShowCart(true)}
  selectedCityId={selectedCityId}
  setSelectedCityId={setSelectedCityId}
  cities={headerCities}
  user={user}                                   // <- Передаём текущего пользователя
/>
      <main className="container" style={{ display: "grid", gap: 24 }}>
        {renderRoute()}
        {showBooking && (<BookingForm onClose={() => setShowBooking(false)} />)}
        <section id="contacts" className="card">
          <b>Контакты</b>
          <div className="muted" style={{ marginTop: 8 }}>Тел.: +7 (999) 000-00-00 · Email: hello@yourdomain.ru · Мы в соцсетях: @cosmoshop</div>
        </section>
      </main>

      {/* Корзина */}
      {showCart && (
        <CartPanel items={cart} onClose={()=>setShowCart(false)} onRemove={removeFromCart} />
      )}

      {/* Модалки */}
      {showAuth && <AuthModal onClose={()=>setShowAuth(false)} />}
      {showAccount && <AccountModal onClose={()=>setShowAccount(false)} orders={orders} favorites={favorites} onCancelOrder={(id)=>setOrders(prev=>prev.map(o=>o.id===id?{...o,status:'отменён'}:o))} onOpenItem={openItem} />}
      {showFavs && <FavoritesModal favorites={favorites} onClose={()=>setShowFavs(false)} onOpenItem={openItem} />}
      {openedItem && <ProductModal item={openedItem} prices_list={data.prices_list} onClose={()=>setOpenedItem(null)} onAdd={addToCart} onToggleFav={toggleFav} isFav={!!favorites.find(f=>f.id===openedItem.item_id)} />}

      <footer>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap:'wrap', gap:8 }}>
          <div className="muted">© {new Date().getFullYear()} CosmoShop. Все права защищены.</div>
          <a className="muted" href="#top">Наверх ↑</a>
        </div>
      </footer>
    </RouterCtx.Provider>
  );
}

// Обёртка провайдера авторизации
export function Root(){ return (<AuthProvider><App/></AuthProvider>); }
