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
  primary: "#0F3D3E",      // тёмно-зелёный
  primaryDark: "#0A2A2B",
  accent: "#C6A969",       // тёплый золотистый акцент
  neutral: "#0B1F1E",
  muted: "#6B7280",
  bg: "#F4F6F5",
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

  .btn-outline {
    background: #fff;
    color: var(--primary);
    border: 1px solid var(--primary);
    transition: all .2s ease;
  }

  .btn-outline:hover {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
    transform: translateY(-1px);
  }
  
  .btn-outline:active {
    transform: scale(.97);
    background: var(--accent);
    color: #fff;
  }
  

  .btn-ghost{background:transparent;border:1px dashed #e5e7eb;color:var(--neutral)}
  .btn.sm{padding:8px 12px;border-radius:12px;font-size:14px}
  .btn.icon{padding:8px 10px;border-radius:10px}
  .btn.lg{padding:16px 24px;border-radius:16px;font-size:16px}
  .notice{border:2px solid var(--primary);background:#fff;padding:10px 12px;border-radius:12px;box-shadow:0 1px 0 rgba(0,0,0,.02)}
  header{position:sticky;top:0;z-index:30;background:#fff;border-bottom:1px solid #e5e7eb}
  nav a{color:var(--neutral);text-decoration:none;font-weight:600}
  nav a:hover{color:var(--primary)}

  /* ---- Премиум hero (тёмно-зелёный + стекло) ---- */

  
  /* Внутренний грид растягивается на всю высоту баннера */
  .hero2-inner{
    display:grid;
    grid-template-columns:1.05fr .95fr;
    gap:24px;
    padding:36px;
    height:100%;
  }
  @media (max-width: 720px){
    .hero2-inner{ grid-template-columns:1fr; padding:22px; }
  }
  
  /* Заголовки и кнопки */
  .hero-title{ font-size:44px; line-height:1.05; margin:0 0 12px; }
  @media(max-width:560px){ .hero-title{ font-size:30px; } }
  .hero-sub{ opacity:.9; margin:0 0 10px; }
  .hero-cta{ display:flex; gap:12px; flex-wrap:wrap; margin-top:14px; }
  .btn.primary{ background:var(--accent); color:#1b1f1e; }
  .btn.primary:hover{ filter:brightness(1.05); transform:translateY(-1px); }
  .glass{ backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.25); border-radius:14px; box-shadow:0 8px 24px rgba(0,0,0,.15); }
  .glass.light{ background:rgba(255,255,255,.6); border:1px solid rgba(255,255,255,.7); }
  .hero-badges{ display:flex; gap:10px; flex-wrap:wrap; margin-top:14px; }
  .hero-badge{ padding:10px 14px; border-radius:999px; font-weight:700; letter-spacing:.01em; }
  
  /* Правая колонка с изображением: прижать вниз и масштабировать под баннер */
  .hero-art{
    position:relative;
    height:100%;
    overflow:hidden;
    display:flex;
    align-items:flex-end;     /* вниз */
    justify-content:flex-end; /* вправо (можно center) */
  }
  
  /* Картинка всегда у нижней кромки, вписывается по высоте баннера */
  .hero-art img{
    position:absolute;
    bottom:0; right:0;
    height:100%;
    width:auto;
    max-width:100%;
    object-fit:contain;
    object-position:right bottom;
    display:block;
    animation: fadeIn .6s ease;
  }
  
  /* Декоративное свечение внизу (можно убрать) */
  .hero-art::after{
    content:"";
    position:absolute; inset:auto -10% -12% -10%;
    height:46%;
    background:radial-gradient(48% 48% at 50% 50%, rgba(198,169,105,.35) 0%, rgba(198,169,105,0) 70%);
    filter:blur(14px); pointer-events:none;
  }


  /* Анимации/ховеры */
  @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  .hover-lift{transition:transform .2s ease, box-shadow .2s ease}
  .hover-lift:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(0,0,0,.12)}

  /* Сетки / карточки */
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

  /* Плашка корзины */
  .cart-panel{
    position:fixed; right:16px; bottom:16px;
    width:360px; max-width:95vw;
    background:#fff; border:1px solid #e5e7eb; border-radius:16px;
    padding:16px; box-shadow:0 10px 30px rgba(0,0,0,.08);
  }
  
  /* Теги */
  .tag{
    display:inline-flex; padding:6px 10px;
    border:1px solid #e5e7eb; border-radius:999px;
    font-size:12px; color:var(--muted);
  }
  
  /* Футер */
  footer{
    margin-top:56px; padding:32px 0;
    border-top:1px solid #e5e7eb;
  }
  
  /* Карточки товара — без 3D и бликов */
  .card{
    background:var(--card);
    border:1px solid #e5e7eb;
    border-radius:18px;
    padding:16px;
    box-shadow:0 4px 14px rgba(0,0,0,.08);
    transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
  }
  .card:hover{
    transform: translateY(-3px);
    box-shadow: 0 12px 28px rgba(0,0,0,.15);
    border-color: var(--accent);
  }
  .card:active{
    transform: scale(.985);
    box-shadow: 0 6px 16px rgba(0,0,0,.12);
  }
  
  /* Глушим любые старые эффекты наклона/подсветки, если вдруг где-то остались */
  .tilt-inner, .tilt-glow { display: none !important; }
  
  /* Стеклянная кнопка в hero */
.glass-btn{
  background: rgba(255,255,255,.22);
  border: 1px solid rgba(255,255,255,.55);
  color: #fff;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.glass-btn:hover{
  background: rgba(255,255,255,.30);
  border-color: rgba(255,255,255,.7);
  transform: translateY(-1px);
}
.glass-btn:active{
  transform: scale(.98);
}

.glass-btn {
  background: rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.6);
  color: #fff;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: all .2s ease;
}
.glass-btn:hover {
  background: rgba(255, 255, 255, 0.35);
  border-color: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
}

html {
  scroll-behavior: smooth; /* плавная прокрутка */
}

a {
  text-decoration: none; /* убираем подчеркивание у всех ссылок */
}




.hero2-inner{
  display:grid;
  grid-template-columns:1.05fr .95fr;
  gap:24px;
  padding:36px;
  height:100%;
  align-items:center; /* аккуратнее выравнивание */
}
@media (max-width: 720px){
  .hero2-inner{ grid-template-columns:1fr; padding:20px; row-gap:16px; }
}

/* Правая колонка: тянется на всю высоту */
.hero-art{
  position:relative;
  height:100%;
  overflow:hidden;
  display:flex;
  align-items:flex-end;       /* вниз */
  justify-content:flex-end;   /* вправо (поставь center, если нужно центр) */
}

/* Картинка прижата к низу и вписывается по высоте баннера */
.hero-art img{
  position:absolute;
  bottom:0; right:0;
  height:100%;
  width:auto;
  max-width:100%;
  object-fit:contain;
  object-position:right bottom;
  display:block;
  animation: fadeIn .6s ease;
}

/* Декоративное свечение снизу (опционально) */
.hero-art::after{
  content:"";
  position:absolute; inset:auto -10% -12% -10%;
  height:46%;
  background:radial-gradient(48% 48% at 50% 50%, rgba(198,169,105,.35) 0%, rgba(198,169,105,0) 70%);
  filter:blur(14px); pointer-events:none;
}

/* Кнопка в hero — стекло */
.glass-btn{
  background: rgba(255,255,255,.22);
  border: 1px solid rgba(255,255,255,.55);
  color: #fff;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: all .2s ease;
  text-decoration: none;
}
.glass-btn:hover{
  background: rgba(255,255,255,.30);
  border-color: rgba(255,255,255,.7);
  transform: translateY(-1px);
}
.glass-btn:active{ transform: scale(.98); }

/* Кнопки-контуры: при ховере золотые с белым текстом */
.btn-outline {
  background:#fff; color:var(--primary); border:1px solid var(--primary);
  transition: all .2s ease;
}
.btn-outline:hover { background:var(--accent); color:#fff; border-color:var(--accent); transform:translateY(-1px); }
.btn-outline:active{ transform:scale(.97); background:var(--accent); color:#fff; }

/* Адаптив карточек: аккуратные тени, без бликов и 3D */
.card{
  background:var(--card);
  border:1px solid #e5e7eb;
  border-radius:18px;
  padding:16px;
  box-shadow:0 4px 14px rgba(0,0,0,.08);
  transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
}
.card:hover{
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(0,0,0,.15);
  border-color: var(--accent);
}
.card:active{
  transform: scale(.985);
  box-shadow: 0 6px 16px rgba(0,0,0,.12);
}

/* Плавный скролл и убираем подчёркивание ссылок */
html { scroll-behavior: smooth; }
a { text-decoration: none; }



/* === HERO CAROUSEL === */
.hero2{ /* фон с тёмно-зелёным свечением слева направо */
  position:relative;
  border-radius:28px;
  overflow:hidden;
  color:#f3f6f5;
  height: clamp(340px, 42vw, 680px);
  background:
    radial-gradient(120% 120% at 0% 50%, rgba(19,64,60,.55) 0%, rgba(19,64,60,0) 45%),
    linear-gradient(135deg,#0c2222 0%, #0f3d3e 60%, #0a2a2b 100%);
}

.hero2-inner{
  display:grid;
  grid-template-columns:1.05fr .95fr;
  gap:24px;
  padding:36px;
  height:100%;
  align-items:center;
}
@media (max-width: 720px){
  .hero2-inner{ grid-template-columns:1fr; padding:20px; row-gap:16px; }
}

.hero-art{
  position:relative; height:100%; overflow:hidden;
  display:flex; align-items:flex-end; justify-content:flex-end;
}
.hero-art img{
  position:absolute; bottom:0; right:0;
  height:100%; width:auto; max-width:100%;
  object-fit:contain; object-position:right bottom; display:block;
}

/* Карусель контейнер */
.hero-carousel{ position:relative; }
.hero-track{
  display:flex; width:200%; height:100%;
  transition: transform .6s ease;
}
.hero-slide{ width:100%; flex:0 0 100%; }

/* Стрелки */
.hero-nav{
  position:absolute; inset:0; pointer-events:none;
  display:flex; align-items:center; justify-content:space-between; padding:0 10px;
}
.hero-arrow{
  pointer-events:auto; border:1px solid rgba(255,255,255,.35); background:rgba(255,255,255,.15);
  border-radius:999px; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  width:42px; height:42px; display:flex; align-items:center; justify-content:center;
  cursor:pointer; transition:all .2s ease; color:#fff; font-weight:700;
}
.hero-arrow:hover{ background:rgba(255,255,255,.25); border-color:rgba(255,255,255,.6); transform:translateY(-1px); }

/* Точки */
.hero-dots{
  position:absolute; left:50%; bottom:14px; transform:translateX(-50%);
  display:flex; gap:8px; padding:6px 10px;
  background:rgba(0,0,0,.18); border:1px solid rgba(255,255,255,.25);
  border-radius:999px; backdrop-filter:blur(6px);
}
.hero-dot{
  width:8px; height:8px; border-radius:999px; background:rgba(255,255,255,.55);
  transition:all .2s ease;
}
.hero-dot.active{ width:18px; background:#C6A969; }

/* Кнопки */
.btn.primary{ background:#C6A969; color:#13201f; }
.btn.primary:hover{ filter:brightness(1.05); transform:translateY(-1px); }

.glass-btn{
  background: rgba(255,255,255,.25);
  border: 1px solid rgba(255,255,255,.6);
  color: #fff;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: all .2s ease; text-decoration:none;
}
.glass-btn:hover{
  background: rgba(255,255,255,.35);
  border-color: rgba(255,255,255,.8);
  transform: translateY(-2px);
}

/* Пэйджеры карусели */
.hero-pagers{
  position:absolute; left:50%; bottom:14px; transform:translateX(-50%);
  display:flex; gap:10px; padding:6px 10px;
  border:1px solid rgba(255,255,255,.25);
  background:rgba(0,0,0,.18);
  border-radius:999px; backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
}

.hero-pager{
  display:flex; align-items:center; gap:8px;
  padding:6px 10px; border-radius:999px; cursor:pointer;
  background:transparent; border:1px solid transparent; color:#fff; font-weight:600;
  transition:all .2s ease; font-size:13px; line-height:1;
}
.hero-pager:hover{ background:rgba(255,255,255,.12); }
.hero-pager.active{
  background:rgba(198,169,105,.18);
  border-color:rgba(198,169,105,.65);
}

.hero-pager .bullet{
  width:8px; height:8px; border-radius:50%;
  background:rgba(255,255,255,.55); transition:all .2s ease;
  flex:0 0 8px;
}
.hero-pager.active .bullet{
  width:18px; background:#C6A969;
}

/* На узких экранах оставляем только точки */
@media (max-width:480px){
  .hero-pager .label{ display:none; }
  .hero-pager{ padding:6px; }
}

  /* Модалки */
  .backdrop{position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;padding:16px;z-index:50}
  .modal{background:#fff;border-radius:16px;max-width:720px;width:100%;padding:20px;border:1px solid #e5e7eb}
  
  /* Популярные категории — фиксируем размер от экрана */
.card.promo{ padding:0 } /* убираем внутренние отступы у карточки */
.promo{
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  height: clamp(240px, 28vw, 420px); /* мин 240px, ~28% ширины экрана, макс 420px */
}

.promo-inner{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  height: 100%;            /* растягиваемся на всю высоту баннера */
  align-items: center;
  padding: 16px;
}

@media (max-width: 720px){
  .promo-inner{ grid-template-columns: 1fr; row-gap: 12px; }
}

.promo-art{
  position: relative;
  height: 100%;
}

.promo-art img{
  position: absolute;
  inset: 0;                /* заполняем контейнер */
  width: 100%;
  height: 100%;
  object-fit: contain;     /* без обрезания */
  object-position: left bottom; /* прижать к левому нижнему краю (можно center) */
}
/* Мелкие улучшения UI форм */
.modal input[type="email"], .modal input[type="tel"], .modal input[type="password"], .modal input[type="text"]{
  width:100%; padding:10px 12px; border:1px solid #e5e7eb; border-radius:12px; background:#fff;
}
.modal label.muted{ display:block; margin-bottom:6px; }

.notice { border:2px solid var(--primary); background:#fff; padding:10px 12px; border-radius:12px; }

  
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

// ====== Авторизация (реальная форма: email/phone + пароль) ======
const AuthContext = React.createContext(null);
function useAuth(){ return React.useContext(AuthContext); }

function AuthProvider({children}){
  const [user, setUser] = useLocalStorage("cosmoshop.user", null);
  const [token, setToken] = useLocalStorage("cosmoshop.token", null);

  // Хелперы вызова API
  async function api(path, body){
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {})
    });
    if (!res.ok) {
      const text = await res.text().catch(()=> "");
      throw new Error(text || ("HTTP " + res.status));
    }
    return res.json();
  }

  // Регистрация: email ИЛИ phone + пароль
  async function register({ email, phone, password }){
    const data = await api("/api/register", { email, phone, password });
    // бэкенд вернёт токен + профиль
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  // Вход: email ИЛИ phone + пароль
  async function login({ email, phone, password }){
    const data = await api("/api/login", { email, phone, password });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  // Вход через провайдера (Google/Apple) — редирект или popup на вашем бэкенде
  function loginGoogle(){
    window.location.href = "/api/oauth/google"; // ваш бэкенд должен завершить авторизацию и вернуть в приложение
  }
  function loginApple(){
    window.location.href = "/api/oauth/apple";
  }

  // Запрос кода восстановления (смс/почта)
  async function requestReset({ email, phone }){
    const data = await api("/api/forgot-password", { email, phone });
    return data; // { ok: true }
  }

  // Подтверждение кода + установка нового пароля
  async function confirmReset({ email, phone, code, newPassword }){
    const data = await api("/api/reset-password", { email, phone, code, newPassword });
    return data; // { ok: true }
  }

  function logout(){
    setToken(null);
    setUser(null);
  }

  const value = {
    user, token,
    register, login, loginGoogle, loginApple,
    requestReset, confirmReset,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
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

function AuthDialog({ onClose }) {
  const { register, login, loginGoogle, loginApple } = useAuth();
  const [mode, setMode] = React.useState("login"); // 'login' | 'register'
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [showReset, setShowReset] = React.useState(false);

  async function onSubmit(e){
    e.preventDefault();
    setError(""); setLoading(true);
    try{
      if (mode === "register") {
        if (!password || !(email || phone)) { setError("Укажите e-mail или телефон и пароль"); setLoading(false); return; }
        await register({ email: email.trim() || undefined, phone: phone.trim() || undefined, password });
      } else {
        if (!password || !(email || phone)) { setError("Укажите e-mail или телефон и пароль"); setLoading(false); return; }
        await login({ email: email.trim() || undefined, phone: phone.trim() || undefined, password });
      }
      onClose();
    }catch(err){
      setError(err.message || "Ошибка");
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className="backdrop" role="dialog" aria-modal>
      <div className="modal">
        {/* header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <b>{mode === "register" ? "Регистрация" : "Вход"}</b>
          <button className="btn btn-outline" onClick={onClose}>Закрыть</button>
        </div>

        {/* tabs */}
        <div style={{display:'flex',gap:8,marginTop:12}}>
          <button className={`btn ${mode==='login'?'':'btn-outline'}`} onClick={()=>setMode('login')}>Вход</button>
          <button className={`btn ${mode==='register'?'':'btn-outline'}`} onClick={()=>setMode('register')}>Регистрация</button>
        </div>

        {/* form */}
        <form onSubmit={onSubmit} style={{display:'grid',gap:12,marginTop:12}}>
          <div>
            <label className="muted">E-mail</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
          </div>
          <div>
            <label className="muted">Телефон</label>
            <input type="tel" placeholder="+7 900 000-00-00" value={phone} onChange={(e)=>setPhone(e.target.value)} />
          </div>
          <div>
            <label className="muted">Пароль</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          </div>

          {error && <div className="notice" style={{borderColor:'#dc2626', color:'#dc2626', background:'#fff'}}>⚠ {error}</div>}

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Подождите…" : (mode === 'register' ? "Зарегистрироваться" : "Войти")}
          </button>

          {mode === "login" && (
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span className="muted" style={{fontSize:12}}>Забыли пароль?</span>
              <button type="button" className="btn btn-outline" onClick={()=>setShowReset(true)}>
                Восстановить доступ
              </button>
            </div>
          )}
        </form>

        {/* social */}
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12}}>
          <button className="btn btn-outline" onClick={loginGoogle}>Войти через Google</button>
          <button className="btn btn-outline" onClick={loginApple}>Войти через Apple</button>
        </div>
      </div>

      {showReset && <ResetDialog onClose={()=>setShowReset(false)} />}
    </div>
  );
}

function ResetDialog({ onClose }){
  const { requestReset, confirmReset } = useAuth();
  const [step, setStep] = React.useState(1); // 1 — запрос кода; 2 — ввод кода+нового пароля
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [code, setCode] = React.useState("");
  const [newPass, setNewPass] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [msg, setMsg] = React.useState("");

  async function sendCode(e){
    e.preventDefault(); setError(""); setMsg(""); setLoading(true);
    try{
      if (!email && !phone) { setError("Укажите e-mail или телефон"); setLoading(false); return; }
      await requestReset({ email: email?.trim(), phone: phone?.trim() });
      setMsg("Код отправлен. Проверьте SMS или e-mail.");
      setStep(2);
    }catch(err){ setError(err.message || "Ошибка"); }
    finally{ setLoading(false); }
  }

  async function applyReset(e){
    e.preventDefault(); setError(""); setMsg(""); setLoading(true);
    try{
      if (!code || !newPass) { setError("Введите код и новый пароль"); setLoading(false); return; }
      await confirmReset({ email: email?.trim(), phone: phone?.trim(), code: code.trim(), newPassword: newPass });
      setMsg("Пароль успешно обновлён. Теперь вы можете войти.");
      onClose();
    }catch(err){ setError(err.message || "Ошибка"); }
    finally{ setLoading(false); }
  }

  return (
    <div className="backdrop" role="dialog" aria-modal>
      <div className="modal">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <b>Восстановление доступа</b>
          <button className="btn btn-outline" onClick={onClose}>Закрыть</button>
        </div>

        {step===1 ? (
          <form onSubmit={sendCode} style={{display:'grid',gap:12,marginTop:12}}>
            <div>
              <label className="muted">E-mail (или телефон)</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
            </div>
            <div><div className="muted" style={{textAlign:'center'}}>или</div></div>
            <div>
              <label className="muted">Телефон</label>
              <input type="tel" placeholder="+7 900 000-00-00" value={phone} onChange={(e)=>setPhone(e.target.value)} />
            </div>
            {error && <div className="notice" style={{borderColor:'#dc2626', color:'#dc2626', background:'#fff'}}>⚠ {error}</div>}
            {msg && <div className="notice">{msg}</div>}
            <button className="btn" type="submit" disabled={loading}>{loading ? "Отправляем…" : "Отправить код"}</button>
          </form>
        ) : (
          <form onSubmit={applyReset} style={{display:'grid',gap:12,marginTop:12}}>
            <div>
              <label className="muted">Код из SMS / e-mail</label>
              <input value={code} onChange={(e)=>setCode(e.target.value)} placeholder="123456" required />
            </div>
            <div>
              <label className="muted">Новый пароль</label>
              <input type="password" value={newPass} onChange={(e)=>setNewPass(e.target.value)} required />
            </div>
            {error && <div className="notice" style={{borderColor:'#dc2626', color:'#dc2626', background:'#fff'}}>⚠ {error}</div>}
            {msg && <div className="notice">{msg}</div>}
            <button className="btn" type="submit" disabled={loading}>{loading ? "Сохраняем…" : "Сохранить новый пароль"}</button>
          </form>
        )}
      </div>
    </div>
  );
}


// ====== Компоненты ======
function Header({
  cartCount,
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
            onClick={onOpenAccount}                 // ← просто вызываем один проп
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


function HeroCarousel({ onBookClick, onAIClick }) {
  const slides = [
    {
      id: 'diagnostics',
      title: 'Здоровая кожа начинается здесь',
      subtitle: 'Премиальная косметика и бесплатная диагностика кожи',
      ctas: [
        { kind: 'primary', label: 'Записаться на диагностику', onClick: onBookClick },
        { kind: 'glass', label: 'Смотреть каталог', href: '#catalog' },
      ],
      // фото врача — прижато к низу справа и масштабируется под баннер
      image: { src: '/images/doctor.png', alt: 'Дерматолог' },
    },
    {
      id: 'ai',
      title: 'ИИ подберёт уход под ваш запрос',
      subtitle: 'Личная рекомендация по типу кожи и задачам за 30 секунд',
      ctas: [
        { kind: 'primary', label: 'Подобрать с ИИ', onClick: onAIClick || onBookClick },
      ],
      // изображение ассистента слева; текст — справа
      image: { src: '/images/ai-assistant.png', alt: 'AI помощник', align: 'left' },
    },
  ];

  const [index, setIndex] = React.useState(0);
  const next = React.useCallback(() => setIndex((i) => (i + 1) % slides.length), [slides.length]);
  const prev = React.useCallback(() => setIndex((i) => (i - 1 + slides.length) % slides.length), [slides.length]);

  // Автопрокрутка каждые 6 секунд (медленнее)
  React.useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[index];

  // стили общего контейнера и слайда — используем твои hero2/hero2-inner,
  // плюс небольшие инлайновые правки для позиционирования изображения
  return (
    <section className="container" style={{ marginTop: 16, position: 'relative' }}>
      <div className="hero2" style={{
        // мягкое тёмно-зелёное свечение слева направо
        background: 'linear-gradient(90deg, rgba(16,42,41,1) 0%, rgba(15,61,62,0.92) 45%, rgba(15,61,62,0.88) 100%)'
      }}>
        <div className="hero2-inner" style={{
          gridTemplateColumns: slide.image?.align === 'left' ? '.95fr 1.05fr' : '1.05fr .95fr'
        }}>
          {/* Левая/правая колонка с текстом */}
          {slide.image?.align === 'left' ? (
            <>
              {/* КОЛОНКА С КАРТИНКОЙ слева */}
              <div className="hero-art" style={{ justifyContent: 'flex-start' }}>
                <img
                  src={slide.image.src}
                  alt={slide.image.alt}
                  onError={(e)=>{e.currentTarget.src='/images/placeholder.png'}}
                  style={{
                    position:'absolute',
                    bottom:0,
                    left:0,
                    height:'100%',
                    width:'auto',
                    maxWidth:'100%',
                    objectFit:'contain',
                    objectPosition:'left bottom'
                  }}
                />
              </div>

              {/* ТЕКСТ справа */}
              <div>
                <h1 className="hero-title">{slide.title}</h1>
                {slide.subtitle && <p className="hero-sub">{slide.subtitle}</p>}
                <div className="hero-cta">
                  {slide.ctas.map((c, i) => {
                    if (c.href) {
                      return (
                        <a key={i} href={c.href} className="btn lg glass-btn hover-lift">
                          {c.label}
                        </a>
                      );
                    }
                    return (
                      <button
                        key={i}
                        type="button"
                        className={`btn lg ${c.kind === 'primary' ? 'primary' : 'glass-btn'} hover-lift`}
                        onClick={c.onClick}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
                {/* Бейджи только для первого слайда */}
                {slide.id === 'diagnostics' && (
                  <div className="hero-badges">
                    <span className="hero-badge glass">Диагностика бесплатна</span>
                    <span className="hero-badge glass">Запись за 30 секунд</span>
                    <span className="hero-badge glass">Скидка 10% после диагностики</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* ТЕКСТ слева */}
              <div>
                <h1 className="hero-title">{slide.title}</h1>
                {slide.subtitle && <p className="hero-sub">{slide.subtitle}</p>}
                <div className="hero-cta">
                  {slide.ctas.map((c, i) => {
                    if (c.href) {
                      return (
                        <a key={i} href={c.href} className="btn lg glass-btn hover-lift">
                          {c.label}
                        </a>
                      );
                    }
                    return (
                      <button
                        key={i}
                        type="button"
                        className={`btn lg ${c.kind === 'primary' ? 'primary' : 'glass-btn'} hover-lift`}
                        onClick={c.onClick}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
                {slide.id === 'diagnostics' && (
                  <div className="hero-badges">
                    <span className="hero-badge glass">Диагностика бесплатна</span>
                    <span className="hero-badge glass">Запись за 30 секунд</span>
                    <span className="hero-badge glass">Скидка 10% после диагностики</span>
                  </div>
                )}
              </div>

              {/* КОЛОНКА С КАРТИНКОЙ справа (врач) */}
              <div className="hero-art" style={{ justifyContent: 'flex-end' }}>
                <img
                  src={slide.image.src}
                  alt={slide.image.alt}
                  onError={(e)=>{e.currentTarget.src='/images/placeholder.png'}}
                  style={{
                    position:'absolute',
                    bottom:0,
                    right:0,
                    height:'100%',
                    width:'auto',
                    maxWidth:'100%',
                    objectFit:'contain',
                    objectPosition:'right bottom'
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* Стрелки */}
        <button
          type="button"
          onClick={prev}
          aria-label="Назад"
          style={{
            position:'absolute', left:12, top:'50%', transform:'translateY(-50%)',
            background:'rgba(255,255,255,.22)', border:'1px solid rgba(255,255,255,.55)',
            color:'#fff', borderRadius:12, padding:'10px 12px', cursor:'pointer', backdropFilter:'blur(8px)'
          }}
        >‹</button>
        <button
          type="button"
          onClick={next}
          aria-label="Вперёд"
          style={{
            position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
            background:'rgba(255,255,255,.22)', border:'1px solid rgba(255,255,255,.55)',
            color:'#fff', borderRadius:12, padding:'10px 12px', cursor:'pointer', backdropFilter:'blur(8px)'
          }}
        >›</button>

        {/* Индикаторы / табы */}
<div className="hero-pagers" role="tablist" aria-label="Слайды">
  {slides.map((s, i) => (
    <button
      key={s.id}
      type="button"
      role="tab"
      aria-selected={i === index}
      className={`hero-pager ${i === index ? 'active' : ''}`}
      onClick={() => setIndex(i)}
    >
      <span className="bullet" />
      <span className="label">
        {s.id === 'diagnostics' ? 'Диагностика' : 'ИИ-помощник'}
      </span>
    </button>
  ))}
</div>

      </div>
    </section>
  );
}


function ProductCard({ item, priceRub, cityStock, isFav, onToggleFav, onOpen, onAdd }) {
  const brand = detectBrand(item.item_name);
  const imgUrl = SINGLE_PRODUCT_IMAGE || `/images/${item.item_id}.jpg`;

  // Хелпер: не пускаем клик дальше (чтобы не открывалась модалка)
  const stop = (e) => e.stopPropagation();

  return (
    <div
      className="card"
      role="button"
      tabIndex={0}
      onClick={() => onOpen(item)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(item); } }}
      style={{ cursor: "pointer" }}
      aria-label={`Открыть ${item.item_name}`}
    >
      {/* Превью */}
      <div
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          borderRadius: 14,
          overflow: 'hidden',
          background: '#f5f5f5',
          marginBottom: 10
        }}
      >
        <img
          src={imgUrl}
          loading="lazy"
          alt={item.item_name}
          onError={(e)=>{ e.currentTarget.src = SINGLE_PRODUCT_IMAGE; }}
          style={{ width:'100%', height:'100%', objectFit:'cover' }}
        />
      </div>

      {/* Бренд */}
      <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
        {brand === "прочее" ? "" : brand}
      </div>

      {/* Заголовок + избранное */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
        <div style={{ fontWeight: 700, minHeight: 42, flex: 1 }}>
          {item.item_name}
        </div>

        {/* Кнопка избранного — не даём всплыть клику */}
        <button
          className="btn icon btn-outline"
          onClick={(e)=>{ stop(e); onToggleFav(item); }}
          title={isFav ? "Убрать из избранного" : "В избранное"}
          aria-label={isFav ? "Убрать из избранного" : "В избранное"}
          type="button"
        >
          {isFav ? "★" : "☆"}
        </button>
      </div>

      {/* Цена + наличие */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, gap:8, flexWrap:'wrap' }}>
        <div className="price">{money(priceRub)}</div>
        <div className="muted" style={{ fontSize: 12 }}>В наличии: {cityStock}</div>
      </div>

      {/* В корзину — тоже останавливаем всплытие */}
      <button
        className="btn"
        style={{ width: "100%", marginTop: 10 }}
        onClick={(e)=>{ stop(e); onAdd(item); }}
        disabled={!priceRub || cityStock<=0}
        type="button"
      >
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

function FavoritesModal({ favorites, onClose, onOpenItem }){
  return (
    <div className="backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <b>Избранное</b>
          <button className="btn btn-outline" type="button" onClick={onClose}>Закрыть</button>
        </div>

        {favorites.length===0 ? (
          <div className="muted" style={{marginTop:8}}>Пусто</div>
        ) : (
          <div className="grid" style={{marginTop:12,gridTemplateColumns:'repeat(2,minmax(0,1fr))'}}>
            {favorites.map(f=> (
              <button
                key={f.id}
                className="card"
                style={{textAlign:'left',cursor:'pointer'}}
                onClick={()=>onOpenItem(f.id)}
              >
                <div style={{fontWeight:600}}>{f.name}</div>
                <div className="muted" style={{fontSize:12}}>Открыть карточку</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


function DiagnosticsBlock({ onBookClick }){
  return (
    <section className="container" style={{marginTop:24}}>
      <div className="glass light" style={{padding:20,borderRadius:20}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,alignItems:'center'}}>
          <div>
            <h3 style={{margin:'0 0 6px'}}>Бесплатная диагностика кожи</h3>
            <ul className="muted" style={{margin:0,padding:'0 0 0 18px',lineHeight:1.6}}>
              <li>В тот же день или в удобное для вас время</li>
              <li>Подбор профессиональной уходовой косметики по программе врача</li>
              <li>Скидка 10% на подобранный уход</li>
            </ul>
          </div>
          <div className="hover-lift" style={{justifySelf:'end'}}>
            <button className="btn lg primary" type="button" onClick={onBookClick}>
              Записаться бесплатно
            </button>
          </div>
        </div>
      </div>
    </section>
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resp = await fetch('http://localhost:5177/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city,
          address,
          date,
          time,
          name,
          phone,
        }),
      });
      if (!resp.ok) throw new Error('bad status ' + resp.status);
      alert('Заявка отправлена! Мы свяжемся с вами.');
      onClose?.();
    } catch (err) {
      console.error(err);
      alert('Не удалось отправить заявку. Попробуйте ещё раз.');
    }
  };  
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
      <section className="card promo">
  <div className="promo-inner">
    <div className="promo-art">
      <img
        src="/images/categories.png"
        alt="Наша продукция"
        onError={(e)=>{e.currentTarget.src='/images/placeholder.png'}}
      />
    </div>
    <div>
      <h2 style={{fontSize:32, margin:'0 0 8px', lineHeight:1.2}}>
        Популярные категории товаров
      </h2>
      <p className="muted" style={{margin:'0 0 16px', fontSize:16, lineHeight:1.5}}>
        Категории ниже составлены профессиональной ассоциацией дермато-косметологов
      </p>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12}}>
        {CATEGORIES.map(c => (
          <Link key={c.key} className="btn btn-outline" to={`/category/${c.key}`}>
            {c.label}
          </Link>
        ))}
      </div>
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

  const confirmOrder = async ({ method }) => {
    const newOrder = {
      id: String(Date.now()).slice(-6),
      createdAt: new Date().toISOString(),
      items: cart,
      total,
      method,
      pickup: { city, address },
      status: 'готов к выдаче', // сразу готов
    };
  
    try {
      await fetch('http://localhost:5177/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: newOrder.id,
          items: cart.map(c => ({ id: c.id, name: c.name, qty: c.qty, price: c.price })),
          total,
          city,
          address,
          method,
          status: newOrder.status,
          createdAt: newOrder.createdAt,
        }),
      });
    } catch (e) {
      console.error('send order failed', e);
      // даже если запись в таблицу не удалась — оформим заказ локально
    }
  
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

  // ХЕЛПЕР
  // Хелпер: открыть форму и плавно проскроллить к ней (устойчивый к ререндеру)
  const openBooking = React.useCallback(() => {
    setShowBooking(true);

  // ждём пока форма появится в DOM и скроллим к ней
    let tries = 0;
    const tick = () => {
      const el = document.getElementById('booking');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (tries < 10) {
        tries += 1;
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }, []);


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
    return (
      <CategoryPage
        data={data}
        prices_list={data.prices_list}
        selectedCityId={selectedCityId}
        favorites={favorites}
        toggleFav={toggleFav}
        openItem={openItem}
        addToCart={addToCart}
        catKey={key}
      />
    );
  }

  if (p.startsWith('/checkout')) {
    return (
      <CheckoutPage
        cart={cart}
        setCart={setCart}
        orders={orders}
        setOrders={setOrders}
      />
    );
  }

// Домашняя (HeroCarousel → Diagnostics → Категории → Каталог)
return (
  <>
    <HeroCarousel
      onBookClick={openBooking}
      onAIClick={openBooking}
    />
    <DiagnosticsBlock onBookClick={openBooking} />
    <HomePage
      data={data}
      prices_list={data.prices_list}
      selectedCityId={selectedCityId}
      setSelectedCityId={setSelectedCityId}
      q={q}
      setQ={setQ}
      brandFilter={brandFilter}
      setBrandFilter={setBrandFilter}
      favorites={favorites}
      toggleFav={toggleFav}
      openItem={openItem}
      addToCart={addToCart}
    />
  </>
);
};

return (
  <RouterCtx.Provider value={router}>
    {style}

    <Header
      cartCount={cart.reduce((a, c) => a + c.qty, 0)}
      onOpenFavs={() => setShowFavs(true)}
      onOpenAccount={() => (user ? setShowAccount(true) : setShowAuth(true))}
      onOpenCart={() => setShowCart(true)}
      selectedCityId={selectedCityId}
      setSelectedCityId={setSelectedCityId}
      cities={headerCities}
      user={user}
    />

    <main className="container" style={{ display: "grid", gap: 24 }}>
      {renderRoute()}
      {showBooking && (<BookingForm onClose={() => setShowBooking(false)} />)}
      <section id="contacts" className="card">
        <b>Контакты</b>
        <div className="muted" style={{ marginTop: 8 }}>
          Тел.: +7 (999) 000-00-00 · Email: hello@yourdomain.ru · Мы в соцсетях: @cosmoshop
        </div>
      </section>
    </main>

    {/* Корзина */}
    {showCart && (
      <CartPanel items={cart} onClose={() => setShowCart(false)} onRemove={removeFromCart} />
    )}

    {/* Модалки */}
{showAuth && <AuthDialog onClose={() => setShowAuth(false)} />}
{showAccount && (
  <AccountModal
    onClose={() => setShowAccount(false)}
    orders={orders}
    favorites={favorites}
    onCancelOrder={(id)=>setOrders(prev=>prev.map(o=>o.id===id?{...o,status:'отменён'}:o))}
    onOpenItem={openItem}
  />
)}

    {showFavs && <FavoritesModal favorites={favorites} onClose={() => setShowFavs(false)} onOpenItem={openItem} />}
    {openedItem && (
      <ProductModal
        item={openedItem}
        prices_list={data.prices_list}
        onClose={() => setOpenedItem(null)}
        onAdd={addToCart}
        onToggleFav={toggleFav}
        isFav={!!favorites.find(f=>f.id===openedItem.item_id)}
      />
    )}

    <footer>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap:'wrap', gap:8 }}>
        <div className="muted">© {new Date().getFullYear()} CosmoShop. Все права защищены.</div>
        <a className="muted" href="#top">Наверх ↑</a>
      </div>
    </footer>
  </RouterCtx.Provider>
);
} // ← ← ← ЭТО закрывает function App()

// Обёртка провайдера авторизации
export function Root(){
  return (
    <AuthProvider>
      <App/>
    </AuthProvider>
  );
}
