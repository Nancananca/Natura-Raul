(()=>{
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const data=JSON.parse($('#galeria-data').textContent);let selected=0,filtered=data,world;
function error(message){if($('#load-message'))$('#load-message').textContent=message;}
function startWorld(){
  if(document.body.dataset.ready==='true')return;
  if($('#carga'))$('#carga').hidden=false;
  if(location.protocol==='file:'){error('Para recorrer la casa, ejecuta ARRANCAR.cmd en la carpeta del proyecto. La portada, las imágenes y los documentos se pueden consultar aquí.');return;}
  if(!world)world=import('./experiencia.js').catch(()=>error('No se ha podido iniciar el recorrido. Abre ARRANCAR.cmd y recarga la página en un navegador con WebGL.'));
}
function page(name,focus=false){
  if(!['inicio','modelo','imagenes','documentos'].includes(name))name='inicio';
  document.body.dataset.page=name;
  $('#c').setAttribute('aria-hidden',name!=='modelo');$('#lbl').setAttribute('aria-hidden',name!=='modelo');$$('.viewer-ui').forEach(x=>x.inert=name!=='modelo');
  $$('.sheet').forEach(x=>x.hidden=x.id!==name);
  $$('nav [data-page]').forEach(b=>{if(b.dataset.page===name)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  if(name==='modelo')startWorld();else if($('#carga'))$('#carga').hidden=true;
  document.dispatchEvent(new Event('natura-page'));
  if(focus&&name!=='modelo'){const sheet=$('main#'+name);sheet.scrollTop=0;const heading=sheet.querySelector('h1');heading.tabIndex=-1;heading.focus({preventScroll:true});}
}
$$('nav [data-page]').forEach(b=>b.onclick=()=>location.hash=b.dataset.page);
addEventListener('hashchange',()=>page(location.hash.slice(1),true));page(location.hash.slice(1)||'inicio');
$$('[data-scroll]').forEach(b=>b.onclick=()=>$('#'+b.dataset.scroll).scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}));
$$('[data-top],.brand').forEach(a=>a.addEventListener('click',()=>$('#inicio').scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})));
$('#panel-toggle').onclick=()=>{const hidden=document.body.classList.toggle('panel-closed');$('#panel-toggle').textContent=hidden?'Información +':'Información −';$('#panel-toggle').setAttribute('aria-expanded',!hidden);dispatchEvent(new Event('resize')); };
if(innerWidth<700){document.body.classList.add('panel-closed');$('#panel-toggle').textContent='Información +';$('#panel-toggle').setAttribute('aria-expanded','false');}
function show(i){selected=(i+filtered.length)%filtered.length;const item=filtered[selected];$('#large-image').src='renders/'+item.id+'.png';$('#large-image').alt=item.titulo+' — '+item.subtitulo;$('#image-caption').textContent=`${String(selected+1).padStart(2,'0')} / ${filtered.length} · ${item.titulo} · ${item.subtitulo}`;if(!$('#lightbox').open)$('#lightbox').showModal();}
function gallery(filter='todos'){filtered=data.filter(x=>filter==='todos'||x.tipo===filter);$('#gallery').innerHTML=filtered.map((x,i)=>`<figure class="render-card"><button data-image="${i}" aria-label="Ampliar: ${x.titulo}"><img loading="lazy" width="1672" height="941" src="renders/${x.id}.png" alt="${x.titulo}: ${x.subtitulo}"></button><figcaption><span>${x.tipo.toUpperCase()} / ${String(i+1).padStart(2,'0')}</span><h2>${x.titulo}</h2><p>${x.texto}</p></figcaption></figure>`).join('');$$('[data-image]').forEach(b=>b.onclick=()=>show(+b.dataset.image));}
$$('[data-filter]').forEach(b=>b.onclick=()=>{$$('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',x===b));gallery(b.dataset.filter);});gallery();
$('#close-image').onclick=()=>$('#lightbox').close();$('#prev-image').onclick=()=>show(selected-1);$('#next-image').onclick=()=>show(selected+1);$('#lightbox').addEventListener('click',e=>{if(e.target===$('#lightbox'))$('#lightbox').close();});addEventListener('keydown',e=>{if(!$('#lightbox').open)return;if(e.key==='ArrowLeft'){e.preventDefault();show(selected-1);}if(e.key==='ArrowRight'){e.preventDefault();show(selected+1);}});
})();
