'use strict';
const $ = (selector, scope=document) => scope.querySelector(selector);
const NAV = $('#primary-nav');
const TOGGLE = $('.menu-toggle');
const dialog = $('#project-dialog');
let activeGallery = [];
let activeImageIndex = 0;

// Make CMS image paths work both on username.github.io and /repository/ subpaths.
const base = new URL('.', document.baseURI).pathname;
function imgUrl(path) {
  if (!path || typeof path !== 'string') return new URL('assets/photo-placeholder.svg', document.baseURI).href;
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  if (path.startsWith('/')) return `${base.replace(/\/$/,'')}${path}`;
  return new URL(path.replace(/^\.\//,''), document.baseURI).href;
}
function setText(selector, value) { const n = $(selector); if(n && typeof value === 'string') n.textContent = value; }
function setBrand(selector, value) { const n = $(selector); if(n && typeof value === 'string' && n.firstChild) n.firstChild.textContent = value; }
function resetMenu(){NAV.classList.remove('open');TOGGLE.setAttribute('aria-expanded','false');TOGGLE.setAttribute('aria-label','開啟選單')}
TOGGLE.addEventListener('click',()=>{
  const open = !NAV.classList.contains('open'); NAV.classList.toggle('open',open);
  TOGGLE.setAttribute('aria-expanded',String(open)); TOGGLE.setAttribute('aria-label',open?'關閉選單':'開啟選單');
});
document.querySelectorAll('.primary-nav a').forEach(a=>a.addEventListener('click',resetMenu));
document.addEventListener('click',e=>{if(!NAV.contains(e.target) && !TOGGLE.contains(e.target))resetMenu()});

function renderSite(site){
  if(!site || typeof site !== 'object') return;
  // Theme colors can be adjusted in Pages CMS without editing CSS.
  const colors = {theme_paper:'--paper',theme_portfolio:'--portfolio-bg',theme_text:'--ink',theme_accent:'--taupe'};
  Object.entries(colors).forEach(([field,cssName])=>{
    if(typeof site[field]==='string' && /^#[0-9a-fA-F]{6}$/.test(site[field])){
      document.documentElement.style.setProperty(cssName,site[field]);
    }
  });
  if(site.brand) { setBrand('.wordmark',site.brand); setBrand('.footer-brand',site.brand) }
  setText('#hero-title',site.hero_title);
  setText('#hero-subtitle',site.hero_subtitle);
  setText('#hero-kicker',site.hero_kicker);
  if(site.hero_image){
    const hero=$('#hero-photo');
    const photo=new Image();
    photo.onload=()=>{hero.style.backgroundImage=`url(${JSON.stringify(imgUrl(site.hero_image))})`; $('.photo-texture').style.display='none'};
    photo.onerror=()=>{hero.setAttribute('aria-label','首頁主視覺圖片尚未載入，可於後台重新上傳')};
    photo.src=imgUrl(site.hero_image);
    hero.style.backgroundPosition = site.hero_position || 'center center';
  }
  if(site.about_title) setText('#about-heading em',site.about_title);
  if(site.about_tagline) { const n=$('#about-tagline'); n.textContent=site.about_tagline;n.style.whiteSpace='pre-line' }
  if(Array.isArray(site.about_paragraphs)){
    const c=$('#about-content'); c.replaceChildren();
    site.about_paragraphs.filter(x=>typeof x==='string'&&x.trim()).forEach(text=>{ const p=document.createElement('p'); p.textContent=text; c.append(p) });
  }
  if(site.portfolio_title) setText('#portfolio-heading em',site.portfolio_title);
  if(site.contact_title) setText('#contact-heading em',site.contact_title);
  if(site.contact_intro){const n=$('#contact-intro');n.textContent=site.contact_intro;n.style.whiteSpace='pre-line'}
  if(site.contact_note){const n=$('.contact-note');n.textContent=site.contact_note;n.style.whiteSpace='pre-line'}
  if(site.contact_email){const n=$('#contact-email');n.textContent=site.contact_email;n.href=`mailto:${site.contact_email}`}
  const social=$('#contact-instagram');
  if(site.instagram_url&& /^https?:\/\//.test(site.instagram_url)){social.hidden=false;social.href=site.instagram_url}else social.hidden=true;
  if(site.copyright) setText('#copyright',site.copyright);
  if(site.seo_description){
    $('meta[name="description"]').content=site.seo_description;
    $('meta[property="og:description"]').content=site.seo_description;
  }
  if(site.hero_title){document.title=`HOME | ${site.hero_title}`;}
}

function renderProjects(projects){
  const grid=$('#project-grid');grid.replaceChildren();
  const shown = (Array.isArray(projects)?projects:[]).filter(p=>p && p.visible!==false && p.cover);
  $('#no-projects').hidden=shown.length!==0;
  if (!shown.length) {
    const frame=document.createElement('div');frame.className='project-placeholder';
    const lines=document.createElement('div');lines.className='placeholder-lines';
    const label=document.createElement('span');label.textContent='SELECTED PROJECTS';
    frame.append(lines,label);grid.append(frame);
  }
  shown.forEach((p,i)=>{
    const btn=document.createElement('a');btn.className='project-card';btn.href=`project.html?project=${encodeURIComponent(p.title||String(i))}`;btn.setAttribute('aria-label',`開啟作品：${p.title||'設計作品'}`);
    const frame=document.createElement('div');frame.className='project-image';
    const img=document.createElement('img');img.src=imgUrl(p.cover);img.alt=p.title||'室內設計作品';img.loading=i<2?'eager':'lazy';img.decoding='async';img.onerror=()=>{img.onerror=null;img.src=imgUrl('assets/photo-placeholder.svg')};
    frame.append(img);
    const meta=document.createElement('div');meta.className='project-meta';
    const name=document.createElement('span');name.className='project-name';name.textContent=p.title||'Untitled';
    const category=document.createElement('span');category.className='project-type';category.textContent=p.category||'INTERIOR';
    const arrow=document.createElement('span');arrow.className='project-arrow';arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');
    meta.append(name,category,arrow);btn.append(frame,meta);
    grid.append(btn);
  });
}
function openProject(project){
  activeGallery = [project.cover,...(Array.isArray(project.gallery)?project.gallery:[])].filter(Boolean);
  activeGallery = [...new Set(activeGallery)];activeImageIndex=0;
  setText('#dialog-title',project.title||'Project');setText('#dialog-category',project.category||'INTERIOR');
  setText('#dialog-description',project.description||'');setText('#dialog-location',[project.location,project.year].filter(Boolean).join(' · '));
  changeGalleryImage();dialog.showModal();document.body.classList.add('dialog-open');
}
function changeGalleryImage(){
  const src=imgUrl(activeGallery[activeImageIndex]);const n=$('#dialog-image');n.src=src;n.alt=`作品照片 ${activeImageIndex+1} / ${activeGallery.length}`;
  n.onerror=()=>{n.onerror=null;n.src=imgUrl('assets/photo-placeholder.svg')};
  setText('#gallery-count',`${activeImageIndex+1} / ${activeGallery.length}`);
  $('#gallery-prev').disabled=activeGallery.length<2;$('#gallery-next').disabled=activeGallery.length<2;
}
function galleryStep(n){if(activeGallery.length<2)return;activeImageIndex=(activeImageIndex+n+activeGallery.length)%activeGallery.length;changeGalleryImage()}
$('#gallery-prev').addEventListener('click',()=>galleryStep(-1));
$('#gallery-next').addEventListener('click',()=>galleryStep(1));
$('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
dialog.addEventListener('close',()=>document.body.classList.remove('dialog-open'));
document.addEventListener('keydown',e=>{if(!dialog.open)return;if(e.key==='ArrowLeft')galleryStep(-1);if(e.key==='ArrowRight')galleryStep(1)});

const observer = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){document.querySelectorAll('.nav-link').forEach(a=>a.classList.toggle('is-active',a.hash===`#${entry.target.id}`))}
  });
},{rootMargin:'-30% 0px -55% 0px'});
document.querySelectorAll('main section[id]').forEach(sec=>observer.observe(sec));

async function loadContent(){
  try { const res=await fetch(new URL('data/site.json',document.baseURI),{cache:'no-cache'});if(!res.ok)throw Error('site.json unavailable');renderSite(await res.json()) }
  catch(err){console.warn('Using embedded site data:',err.message); if(window.__SETTLE_SITE_FALLBACK) renderSite(window.__SETTLE_SITE_FALLBACK)}
  try { const res=await fetch(new URL('data/projects.json',document.baseURI),{cache:'no-cache'});if(!res.ok)throw Error('projects.json unavailable');renderProjects(await res.json()) }
  catch(err){console.warn('Using embedded portfolio data:',err.message);renderProjects(window.__SETTLE_PROJECTS_FALLBACK || [])}
}
loadContent();
