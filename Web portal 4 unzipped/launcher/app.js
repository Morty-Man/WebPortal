(()=>{
const $=s=>document.querySelector(s), K='launcher.v1';
const I={
 plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',pen:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>',
 home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>',x:'<path d="M18 6L6 18M6 6l12 12"/>',check:'<path d="M20 6L9 17l-5-5"/>',
 up:'<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 20h16"/>',trash:'<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',img:'<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/>'};
const svg=n=>`<svg viewBox="0 0 24 24">${I[n]}</svg>`;
const T=[['Pure Light','#ffffff','#f1f3f5','#111111','#2563eb'],['Midnight','#0b1020','#1a2033','#ffffff','#8b8dff'],['Ocean','#0a3d62','#0f5b8d','#ffffff','#5eead4'],
['Lavender','#f3eeff','#dccbff','#2e1065','#7c3aed'],['Forest','#14352a','#1d4a3a','#f6f1de','#34d399'],['Sunset','#fff1e0','#ffd0ad','#4a2410','#e8590c'],
['Rose','#fff0f3','#ffcfdc','#5c0f2a','#db2777'],['Slate','#2b3440','#3a4553','#f1f5f9','#9fb3c8'],['Sand','#f3e9d7','#e2cca6','#3e2a14','#a8740a'],
['Cyber','#07070d','#16162a','#ffffff','#22d3ee'],['Minimal Gray','#eceef1','#ffffff','#111111','#3b82f6'],['Dark Purple','#2a0a4a','#3e1670','#ffffff','#e879f9']];
const D={heading:'My Favorite Websites',theme:0,links:[],fab:null,customIcon:false,iconState:{zoom:1,ox:0,oy:0}};
let S;try{S={...D,...JSON.parse(localStorage.getItem(K)||'{}')}}catch{S={...D}}
const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){console.warn(e)}};
const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let editing=false,delId=null;

function theme(i){const t=T[i]||T[0];const r=document.documentElement.style;
 r.setProperty('--bg',t[1]);r.setProperty('--card',t[2]);r.setProperty('--tx',t[3]);r.setProperty('--ac',t[4]);
 const l=h=>{const n=parseInt(h.slice(1),16),f=c=>{c/=255;return c<=.03928?c/12.92:((c+.055)/1.055)**2.4};return .2126*f(n>>16)+.7152*f(n>>8&255)+.0722*f(n&255)};
 r.setProperty('--on',l(t[4])>.4?'#111':'#fff');document.querySelector('meta[name=theme-color]').content=t[1]}
function render(){
 $('#title').textContent=S.heading;document.title=S.heading||'Launcher';
 const g=$('#grid');g.className=editing?'editing':'';
 g.innerHTML=S.links.map((l,i)=>`<div class="tile" style="animation-delay:${i*30}ms" data-id="${l.id}"><button class="link"><span class="av">${esc([...l.name][0]||'?').toUpperCase()}</span><span class="nm">${esc(l.name)}</span></button>${editing?`<button class="x" data-x aria-label="Delete">${svg('x')}</button>`:''}</div>`).join('');
 $('#delBtn').classList.toggle('on',editing)}
document.querySelectorAll('[data-close]').forEach(b=>{b.innerHTML=svg('x');b.onclick=()=>b.closest('dialog').close()});
document.querySelectorAll('[data-ico]').forEach(b=>b.innerHTML=svg(b.dataset.ico));
$('#editBtn').innerHTML=svg('pen');$('#addBtn').innerHTML=svg('plus');$('#delBtn').innerHTML=svg('minus');$('#fab').innerHTML=svg('home');
$('#backBtn').innerHTML=svg('home');$('#cfmOk').innerHTML=svg('trash');$('#upBtn').insertAdjacentHTML('afterbegin',svg('up'));$('#edEmpty').innerHTML=svg('img');
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)d.close()}));

// add / delete
$('#addBtn').onclick=()=>{$('#addForm').reset();$('#addDlg').showModal();setTimeout(()=>$('#aName').focus(),50)};
$('#addForm').onsubmit=e=>{e.preventDefault();let u=$('#aUrl').value.trim();if(!/^https?:\/\//i.test(u))u='https://'+u;
 try{new URL(u)}catch{$('#aUrl').focus();return}
 S.links.push({id:Date.now().toString(36),name:$('#aName').value.trim(),url:u});save();$('#addDlg').close();render()};
$('#delBtn').onclick=()=>{editing=!editing;render()};
$('#grid').onclick=e=>{const t=e.target.closest('.tile');if(!t)return;const l=S.links.find(x=>x.id===t.dataset.id);if(!l)return;
 if(e.target.closest('[data-x]')){delId=l.id;$('#cfmText').textContent=`Delete “${l.name}”?`;$('#cfmDlg').showModal()}else if(!editing)openSite(l)};
$('#cfmOk').onclick=()=>{S.links=S.links.filter(l=>l.id!==delId);save();$('#cfmDlg').close();if(!S.links.length)editing=false;render()};

// viewer
let tok=0;const setB=v=>{$('#blocked').style.display=v?'flex':'none'};
async function openSite(l){const my=++tok,f=$('#frame');
 $('#viewer').hidden=false;setB(false);$('#spin').hidden=false;f.src='about:blank';placeFab();
 let ok=true;
 try{const c=new AbortController();setTimeout(()=>c.abort(),8000);
  const r=await fetch('/.netlify/functions/check?url='+encodeURIComponent(l.url)+'&origin='+encodeURIComponent(location.origin),{signal:c.signal});
  if(r.ok&&(r.headers.get('content-type')||'').includes('json')){ok=(await r.json()).embeddable!==false}}catch{}
 if(my!==tok)return;
 if(!ok){$('#spin').hidden=true;setB(true);return}
 f.onload=()=>{if(my===tok&&f.src!=='about:blank')$('#spin').hidden=true};f.src=l.url;setTimeout(()=>{if(my===tok)$('#spin').hidden=true},10000)}
function goHome(){tok++;$('#viewer').hidden=true;$('#frame').src='about:blank'}
$('#backBtn').onclick=goHome;

// draggable home button
const fab=$('#fab');let drag=null;
function placeFab(){const p=S.fab||{x:.04,y:.05};const m=8,w=innerWidth-52-m*2,h=innerHeight-52-m*2;
 fab.style.left=m+Math.min(Math.max(p.x,0),1)*w+'px';fab.style.top=m+Math.min(Math.max(p.y,0),1)*h+'px'}
fab.onpointerdown=e=>{fab.setPointerCapture(e.pointerId);drag={sx:e.clientX,sy:e.clientY,l:fab.offsetLeft,t:fab.offsetTop,moved:false}};
fab.onpointermove=e=>{if(!drag)return;const dx=e.clientX-drag.sx,dy=e.clientY-drag.sy;if(!drag.moved&&Math.hypot(dx,dy)<6)return;
 drag.moved=true;fab.classList.add('drag');const m=8;
 const x=Math.min(Math.max(drag.l+dx,m),innerWidth-52-m),y=Math.min(Math.max(drag.t+dy,m),innerHeight-52-m);
 fab.style.left=x+'px';fab.style.top=y+'px';
 S.fab={x:(x-m)/(innerWidth-52-m*2),y:(y-m)/(innerHeight-52-m*2)}};
fab.onpointerup=()=>{if(!drag)return;fab.classList.remove('drag');if(drag.moved)save();else goHome();drag=null};
fab.onpointercancel=()=>{drag=null;fab.classList.remove('drag')};
addEventListener('resize',placeFab);

// settings
let pend=0,img=null,ist={...S.iconState},dirty=false;
const ed=$('#ed'),ec=ed.getContext('2d');
function draw(c,s){c.clearRect(0,0,s,s);c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--card')||'#eee';
 if(!img)return;const cv=Math.max(s/img.width,s/img.height),sc=cv*ist.zoom,w=img.width*sc,h=img.height*sc;
 const mx=Math.max((w-s)/2,0),my=Math.max((h-s)/2,0);ist.ox=Math.min(Math.max(ist.ox,-mx/s),mx/s);ist.oy=Math.min(Math.max(ist.oy,-my/s),my/s);
 c.fillStyle='#fff';c.fillRect(0,0,s,s);c.drawImage(img,(s-w)/2+ist.ox*s,(s-h)/2+ist.oy*s,w,h)}
function redraw(){draw(ec,440);$('#p1').getContext('2d').drawImage(ed,0,0,120,120);$('#p2').getContext('2d').drawImage(ed,0,0,64,64);$('#edEmpty').hidden=!!img;$('#zoom').value=ist.zoom}
function loadImg(src,cb){const i=new Image();i.onload=()=>{img=i;cb&&cb();redraw()};i.src=src}
$('#themes').innerHTML=T.map((t,i)=>`<button type="button" class="sw" data-i="${i}" aria-label="${t[0]}" title="${t[0]}" style="background:${t[1]}"><i style="background:${t[2]}"></i><b style="background:${t[4]}"></b></button>`).join('');
$('#themes').onclick=e=>{const b=e.target.closest('.sw');if(!b)return;pend=+b.dataset.i;theme(pend);mark()};
const mark=()=>document.querySelectorAll('.sw').forEach(b=>b.classList.toggle('sel',+b.dataset.i===pend));
$('#editBtn').onclick=()=>{$('#sHead').value=S.heading;pend=S.theme;mark();dirty=false;ist={...S.iconState};img=null;redraw();
 const src=localStorage.getItem(K+'.src');if(src)loadImg(src);$('#setDlg').showModal()};
$('#setDlg').addEventListener('close',()=>theme(S.theme));
$('#file').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();
 r.onload=()=>{const t=new Image();t.onload=()=>{const m=1024,k=Math.min(1,m/Math.max(t.width,t.height)),c=document.createElement('canvas');
  c.width=Math.round(t.width*k);c.height=Math.round(t.height*k);c.getContext('2d').drawImage(t,0,0,c.width,c.height);
  ist={zoom:1,ox:0,oy:0};dirty=true;loadImg(c.toDataURL('image/jpeg',.92))};t.src=r.result};r.readAsDataURL(f);e.target.value=''};
$('#zoom').oninput=e=>{ist.zoom=+e.target.value;dirty=true;redraw()};
ed.onwheel=e=>{if(!img)return;e.preventDefault();ist.zoom=Math.min(4,Math.max(1,ist.zoom*(e.deltaY<0?1.05:.95)));dirty=true;redraw()};
let pd=null;ed.onpointerdown=e=>{if(!img)return;ed.setPointerCapture(e.pointerId);pd={x:e.clientX,y:e.clientY,ox:ist.ox,oy:ist.oy};ed.style.cursor='grabbing'};
ed.onpointermove=e=>{if(!pd)return;const k=ed.getBoundingClientRect().width;ist.ox=pd.ox+(e.clientX-pd.x)/k;ist.oy=pd.oy+(e.clientY-pd.y)/k;dirty=true;redraw()};
ed.onpointerup=ed.onpointercancel=()=>{pd=null;ed.style.cursor=''};
const mk=s=>{const c=document.createElement('canvas');c.width=c.height=s;draw(c.getContext('2d'),s);return c};
const blob=c=>new Promise(r=>c.toBlob(r,'image/png'));
async function applyIcon(){if(!('caches' in window))return;const ca=await caches.open('icons');
 for(const [p,s] of [['icon-192',192],['icon-512',512],['apple-touch-icon',180]]){
  await ca.put('/icons/'+p+'.png',new Response(await blob(mk(s)),{headers:{'Content-Type':'image/png'}}))}}
function setLinks(u){$('#fav').href=u;$('#touch').href=u}
$('#setForm').onsubmit=async e=>{e.preventDefault();S.heading=$('#sHead').value.trim()||D.heading;S.theme=pend;
 if(img&&dirty){S.iconState={...ist};S.customIcon=true;try{localStorage.setItem(K+'.src',img.src);localStorage.setItem(K+'.ico',mk(192).toDataURL('image/png'))}catch(x){console.warn(x)}
  try{await applyIcon()}catch(x){console.warn(x)}setLinks(localStorage.getItem(K+'.ico')||'/icons/icon-192.png')}
 save();theme(S.theme);render();$('#setDlg').close()};

theme(S.theme);render();
if(S.customIcon){const u=localStorage.getItem(K+'.ico');if(u)setLinks(u)}
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
})();
