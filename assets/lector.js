(()=>{
const $=id=>document.getElementById(id),stage=$('doc-stage'),canvas=$('doc-canvas'),ctx=canvas.getContext('2d');
let manifest,kind='planos',page=1,zoom=1,img,request=0,pointers=new Map(),drag,pinch;
async function documents(){
 if(manifest)return manifest;
 const bundled=window.NATURA_DOCUMENTS?.[window.naturaOption];
 if(bundled)return manifest=bundled;
 const response=await fetch(window.naturaCurrent.docs,{cache:'no-store'});
 if(!response.ok)throw Error('No se encuentra el índice de documentos.');
 return manifest=await response.json();
}
function dimensions(){if(!img||stage.clientWidth<40||stage.clientHeight<40)return;const style=getComputedStyle(stage),px=parseFloat(style.paddingLeft)+parseFloat(style.paddingRight),py=parseFloat(style.paddingTop)+parseFloat(style.paddingBottom);const fit=Math.min((stage.clientWidth-px)/img.naturalWidth,(stage.clientHeight-py)/img.naturalHeight),scale=Math.max(.01,fit)*zoom;canvas.style.width=Math.round(img.naturalWidth*scale)+'px';canvas.style.height=Math.round(img.naturalHeight*scale)+'px';$('doc-zoom').textContent=Math.round(zoom*100)+' %';}
function setZoom(z){zoom=Math.min(5,Math.max(1,z));dimensions();}
function loadImage(url){return new Promise((resolve,reject)=>{const next=new Image();next.onload=()=>resolve(next);next.onerror=()=>reject(Error('No se encuentra la lámina.'));next.src=window.naturaAsset?window.naturaAsset(url):url;});}
async function open(type,n){
 const current=++request;kind=type;img=null;zoom=1;stage.scrollTo(0,0);canvas.hidden=true;$('doc-status').hidden=false;$('doc-status').textContent='Cargando lámina…';$('doc-retry').hidden=true;stage.setAttribute('aria-busy','true');
 try{
  const data=await documents();if(current!==request)return;const doc=data[type];if(!doc?.pages?.length)throw Error('Documento no disponible.');
  page=Math.max(1,Math.min(doc.pages.length,Number.isFinite(n)?Math.trunc(n):1));
  $('reader-title').textContent=doc.title;$('reader-subtitle').textContent=window.naturaCurrent.label+' · Revisión 18 nov · Consulta online';
  $('doc-select').innerHTML=doc.pages.map((p,i)=>`<option value="${i+1}">${String(i+1).padStart(2,'0')} / ${doc.pages.length} · ${p.title}</option>`).join('');$('doc-select').value=page;
  $('doc-prev').disabled=page===1;$('doc-next').disabled=page===doc.pages.length;
  const next=await loadImage(doc.pages[page-1].src);if(current!==request)return;img=next;canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;ctx.drawImage(img,0,0);canvas.setAttribute('aria-label',doc.pages[page-1].title);canvas.hidden=false;$('doc-status').hidden=true;dimensions();requestAnimationFrame(dimensions);
 }catch(e){if(current===request){$('doc-status').textContent='No se ha podido abrir esta lámina. Vuelve a intentarlo o comprueba que la carpeta de la plataforma esté completa.';$('doc-retry').hidden=false;}}
 finally{if(current===request)stage.setAttribute('aria-busy','false');}
}
function go(n){if(!manifest)return;const next=Math.max(1,Math.min(manifest[kind].pages.length,n));if(location.hash===`#${kind}/${next}`)open(kind,next);else location.hash=kind+'/'+next;}
$('doc-prev').onclick=()=>go(page-1);$('doc-next').onclick=()=>go(page+1);$('doc-select').onchange=e=>go(+e.target.value);$('doc-retry').onclick=()=>open(kind,page);
$('doc-in').onclick=()=>setZoom(zoom*1.35);$('doc-out').onclick=()=>setZoom(zoom/1.35);$('doc-fit').onclick=()=>{setZoom(1);stage.scrollTo(0,0);};
stage.addEventListener('contextmenu',e=>e.preventDefault());stage.addEventListener('dragstart',e=>e.preventDefault());
stage.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();go(page+1);}if(e.key==='ArrowLeft'){e.preventDefault();go(page-1);}if(e.key==='+'||e.key==='='){e.preventDefault();setZoom(zoom*1.35);}if(e.key==='-'){e.preventDefault();setZoom(zoom/1.35);}});
stage.addEventListener('wheel',e=>{if(e.ctrlKey){e.preventDefault();setZoom(zoom*Math.exp(-e.deltaY*.002));}},{passive:false});
stage.addEventListener('pointerdown',e=>{if(e.button!==0)return;pointers.set(e.pointerId,[e.clientX,e.clientY]);stage.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY,left:stage.scrollLeft,top:stage.scrollTop};if(pointers.size===2){const[a,b]=[...pointers.values()];pinch={distance:Math.hypot(a[0]-b[0],a[1]-b[1]),zoom};}});
stage.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size===2&&pinch){const[a,b]=[...pointers.values()];setZoom(pinch.zoom*Math.hypot(a[0]-b[0],a[1]-b[1])/Math.max(pinch.distance,1));}else if(drag&&zoom>1){stage.scrollLeft=drag.left-(e.clientX-drag.x);stage.scrollTop=drag.top-(e.clientY-drag.y);}});
const release=e=>{pointers.delete(e.pointerId);pinch=null;drag=null;};stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);
new ResizeObserver(dimensions).observe(stage);document.addEventListener('natura-page',()=>requestAnimationFrame(dimensions));window.naturaReader={open};
})();
