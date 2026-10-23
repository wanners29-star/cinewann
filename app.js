const samples = [
 
{id:"bbb",title:"Big Buck Bunny",category:"Películas",year:"2008",desc:"Cortometraje animado · Blender Open Movies",url:"https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",colors:["#236b69","#12283a"],poster:"",legal:"Video de demostración; verifica los términos del proveedor antes de publicar."},
 {id:"sintel",title:"Sintel",category:"Películas",year:"2010",desc:"Fantasía y aventura · Blender Open Movies",url:"https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",colors:["#a34a32","#27152b"],poster:"",legal:"Video de demostración; verifica los términos del proveedor antes de publicar."},
 {id:"tears",title:"Tears of Steel",category:"Videos",year:"2012",desc:"Ciencia ficción · Blender Open Movies",url:"https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",colors:["#356c88","#19263f"],poster:"",legal:"Video de demostración; verifica los términos del proveedor antes de publicar."},
 {id:"anime",title:"Anime gratuito",category:"Anime",year:"Colección",desc:"Añade anime con licencia abierta o permiso explícito",url:"",colors:["#7c3e86","#251c46"],placeholder:true},
 {id:"docs",title:"Documentales",category:"Documentales",year:"Colección",desc:"Agrega documentales de dominio público",url:"",colors:["#4e765b","#172c34"],placeholder:true},
 {id:"series",title:"Series libres",category:"Series",year:"Colección",desc:"Añade episodios de fuentes autorizadas",url:"",colors:["#a65b45","#35223a"],placeholder:true}
];
let custom = [];
try { custom = JSON.parse(localStorage.getItem("cinewann.custom") || "[]"); if(!Array.isArray(custom)) custom=[]; } catch { custom=[]; }
let filter = "Todo";
const catalog = document.querySelector("#catalog");
const search = document.querySelector("#search");
const dialog = document.querySelector("#playerDialog");
const player = document.querySelector("#videoPlayer");
const toast = document.querySelector("#toast");
let deferredPrompt = null;

function allItems(){return [...samples,...custom];}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function render(){
 const q=search.value.trim().toLowerCase();
 const items=allItems().filter(x=>(filter==="Todo"||x.category===filter)&&(!q||(x.title+" "+x.category+" "+x.desc).toLowerCase().includes(q)));
 document.querySelector("#sectionTitle").textContent=filter==="Todo"?"Catálogo gratuito":filter;
 document.querySelector("#count").textContent=`${items.length} ${items.length===1?"título":"títulos"}`;
 catalog.innerHTML=items.map(x=>{
  const colors=x.colors||["#344d69","#171b2b"];
  const style=`--c1:${colors[0]};--c2:${colors[1]}`;
  const bg=x.poster?`background-image:linear-gradient(0deg,#05070cf0,transparent 70%),url('${escapeHtml(x.poster)}');background-size:cover;background-position:center;`:"";
  return `<article class="movie" tabindex="0" role="button" data-id="${escapeHtml(x.id)}" aria-label="Abrir ${escapeHtml(x.title)}">
   <div class="poster" style="${style};${bg}"><span class="play-hover">▶</span><div><div class="poster-title">${escapeHtml(x.title)}</div><span class="poster-sub">${escapeHtml(x.category.toUpperCase())} · ${escapeHtml(x.year||"")}</span></div></div>
   <h3>${escapeHtml(x.title)}</h3><p>${escapeHtml(x.desc||x.category)}</p><span class="tag">${x.placeholder?"PRÓXIMAMENTE":"GRATIS"}</span>
  </article>`;
 }).join("");
 catalog.querySelectorAll(".movie").forEach(el=>{
  const open=()=>openItem(el.dataset.id);
  el.addEventListener("click",open);el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open();}});
 });
}
function notify(msg){toast.textContent=msg;toast.hidden=false;clearTimeout(notify.timer);notify.timer=setTimeout(()=>toast.hidden=true,3200);}
function openItem(id){
 const item=allItems().find(x=>x.id===id);if(!item)return;
 if(item.placeholder||!item.url){notify("Esta categoría está lista para añadir contenido autorizado.");document.querySelector("#addForm").hidden=false;document.querySelector("#addForm").scrollIntoView({behavior:"smooth",block:"center"});return;}
 document.querySelector("#playerTitle").textContent=item.title;
 player.src=item.url;dialog.showModal();player.play().catch(()=>notify("Pulsa reproducir. Si falla, comprueba que el enlace sea un video directo compatible."));
}
function closePlayer(){player.pause();player.removeAttribute("src");player.load();dialog.close();}
document.querySelector("#closePlayer").addEventListener("click",closePlayer);
dialog.addEventListener("click",e=>{if(e.target===dialog)closePlayer();});
search.addEventListener("input",render);
document.querySelectorAll(".nav").forEach(btn=>btn.addEventListener("click",()=>{
 filter=btn.dataset.filter;document.querySelectorAll(".nav").forEach(b=>b.classList.toggle("active",b===btn));render();
}));
document.querySelector("#heroPlay").addEventListener("click",()=>{filter="Todo";document.querySelectorAll(".nav").forEach(b=>b.classList.toggle("active",b.dataset.filter==="Todo"));render();document.querySelector("#catalog").scrollIntoView({behavior:"smooth"});});
document.querySelector("#showAdd").addEventListener("click",()=>{document.querySelector("#addForm").hidden=false;document.querySelector("#addForm").scrollIntoView({behavior:"smooth",block:"center"});});
document.querySelector("#cancelAdd").addEventListener("click",()=>document.querySelector("#addForm").hidden=true);
document.querySelector("#addForm").addEventListener("submit",e=>{
 e.preventDefault();
 const title=document.querySelector("#newTitle").value.trim(),url=document.querySelector("#newUrl").value.trim(),poster=document.querySelector("#newPoster").value.trim(),category=document.querySelector("#newCategory").value;
 if(!/^https?:\/\//i.test(url)){notify("Introduce una URL http o https válida.");return;}
 const item={id:"custom-"+Date.now(),title,category,year:"Añadido",desc:"Contenido añadido por ti",url,poster,colors:["#475c77","#171b2b"]};
 custom.push(item);
 try{localStorage.setItem("cinewann.custom",JSON.stringify(custom));}catch{notify("No se pudo guardar: almacenamiento del navegador lleno.");return;}
 e.target.reset();e.target.hidden=true;filter="Todo";document.querySelectorAll(".nav").forEach(b=>b.classList.toggle("active",b.dataset.filter==="Todo"));render();notify("Video añadido a este dispositivo.");
});
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;document.querySelector("#installBtn").hidden=false;});
document.querySelector("#installBtn").addEventListener("click",async()=>{if(!deferredPrompt){notify("En Chrome: menú ⋮ → Instalar aplicación o Añadir a pantalla de inicio.");return;}deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;document.querySelector("#installBtn").hidden=true;});
if("serviceWorker" in navigator && location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
document.querySelector("#year").textContent=new Date().getFullYear();
render();
