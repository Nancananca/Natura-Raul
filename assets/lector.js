(()=>{
const $=id=>document.getElementById(id),stage=$('doc-stage'),canvas=$('doc-canvas'),ctx=canvas.getContext('2d');
let manifest,kind='planos',page=1,zoom=1,img,request=0,pointers=new Map(),drag,pinch;
const data=fetch('assets/documentos.json').then(r=>{if(!r.ok)throw Error();return r.json();}).then(m=>manifest=m);
function dimensions(){if(!img)return;const w=stage.clientWidth-32,h=stage.clientHeight-32,fit=Math.min(w/img.naturalWidth,h/img.naturalHeight),scale=fit*zoom;canvas.style.width=Math.round(img.naturalWidth*scale)+'px';canvas.style.height=Math.round(img.naturalHeight*scale)+'px';$('doc-zoom').textContent=Math.round(zoom*100)+' %';}
function setZoom(z){zoom=Math.min(5,Math.max(1,z));dimensions();}
async function open(type,n){
 const current=++request;kind=type;img=null;$('doc-status').hidden=false;$('doc-status').textContent='Cargando lámina…';canvas.hidden=true;zoom=1;
 try{
  await data;if(current!==request)return;const doc=manifest[type];page=Math.max(1,Math.min(doc.pages.length,n));
  $('reader-title').textContent=doc.title;$('reader-subtitle').textContent='Natura 130 · Villamayor · Consulta online';
  $('doc-select').innerHTML=doc.pages.map((p,i)=>`<option value="${i+1}">${String(i+1).padStart(2,'0')} / ${doc.pages.length} · ${p.title}</option>`).join('');$('doc-select').value=page;
  $('doc-prev').disabled=page===1;$('doc-next').disabled=page===doc.pages.length;
  const next=new Image();next.src=doc.pages[page-1].src;await next.decode();if(current!==request)return;img=next;canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;ctx.drawImage(img,0,0);canvas.setAttribute('aria-label',doc.pages[page-1].title);canvas.hidden=false;$('doc-status').hidden=true;dimensions();stage.scrollTo(0,0);
 }catch(e){if(current===request)$('doc-status').textContent='No se ha podido cargar la lámina. Recarga la página para intentarlo de nuevo.';}
}
function go(p){if(!manifest)return;location.hash=kind+'/'+Math.max(1,Math.min(manifest[kind].pages.length,p));}
$('doc-prev').onclick=()=>go(page-1);$('doc-next').onclick=()=>go(page+1);$('doc-select').onchange=e=>go(+e.target.value);
$('doc-in').onclick=()=>setZoom(zoom*1.35);$('doc-out').onclick=()=>setZoom(zoom/1.35);$('doc-fit').onclick=()=>{setZoom(1);stage.scrollTo(0,0);};
stage.addEventListener('contextmenu',e=>e.preventDefault());stage.addEventListener('dragstart',e=>e.preventDefault());
stage.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();go(page+1);}if(e.key==='ArrowLeft'){e.preventDefault();go(page-1);}if(e.key==='+'||e.key==='='){e.preventDefault();setZoom(zoom*1.35);}if(e.key==='-'){e.preventDefault();setZoom(zoom/1.35);}});
stage.addEventListener('wheel',e=>{if(e.ctrlKey){e.preventDefault();setZoom(zoom*Math.exp(-e.deltaY*.002));}},{passive:false});
stage.addEventListener('pointerdown',e=>{if(e.button!==0)return;pointers.set(e.pointerId,[e.clientX,e.clientY]);stage.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY,left:stage.scrollLeft,top:stage.scrollTop};if(pointers.size===2){const [a,b]=[...pointers.values()];pinch={distance:Math.hypot(a[0]-b[0],a[1]-b[1]),zoom};}});
stage.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size===2&&pinch){const[a,b]=[...pointers.values()];setZoom(pinch.zoom*Math.hypot(a[0]-b[0],a[1]-b[1])/Math.max(pinch.distance,1));}else if(drag&&zoom>1){stage.scrollLeft=drag.left-(e.clientX-drag.x);stage.scrollTop=drag.top-(e.clientY-drag.y);}});
const release=e=>{pointers.delete(e.pointerId);pinch=null;drag=null;};stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);
new ResizeObserver(dimensions).observe(stage);window.naturaReader={open};
})();
