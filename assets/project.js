'use strict';
const $=s=>document.querySelector(s);
const params=new URLSearchParams(location.search);
const key=params.get('project');
const asset=(path)=>{
 if(!path)return 'assets/photo-placeholder.svg';
 if(/^https?:\/\//i.test(path))return path;
 return path.startsWith('/')?path:'./'+path.replace(/^\.\//,'');
};
function render(p){
 document.title=(p.title||'Project')+' | SETTLE DESIGN';
 $('#case-title').textContent=p.title||'Untitled Project';
 $('#case-category').textContent=p.category||'RESIDENTIAL';
 const typ=$('#case-type');if(typ)typ.textContent=p.category||'Residential Interior';
 $('#case-location').textContent=p.location||'';
 $('#case-year').textContent=p.year||'';
 const cover=$('#case-cover-img');cover.src=asset(p.cover);cover.alt=(p.title||'作品')+' — 封面照片';
 const blocks=String(p.description||'').trim().split(/\n\s*\n/).filter(Boolean);
 const wrap=$('#case-description');
 blocks.forEach((s,i)=>{const paragraph=document.createElement('p');paragraph.textContent=s;paragraph.lang=/[\u4e00-\u9fff]/.test(s)?'zh-Hant':'en';wrap.append(paragraph)});
 if(!blocks.length)$('#case-story').hidden=true;
 const photos=(Array.isArray(p.gallery)?p.gallery:[]).filter(Boolean).filter(x=>x!==p.cover);
 const gallery=$('#case-gallery');
 photos.forEach((src,i)=>{let figure=document.createElement('figure');figure.className='case-gallery-item';const img=new Image();img.src=asset(src);img.alt=(p.title||'設計作品')+' — '+(i+1);img.loading=i<2?'eager':'lazy';img.decoding='async';figure.append(img);gallery.append(figure)});
 if(!photos.length)gallery.hidden=true;
}
async function init(){
 try{
  const res=await fetch('data/projects.json',{cache:'no-cache'});
  if(!res.ok)throw new Error('作品資料尚未載入');
  const all=await res.json();
  const p=all.find(x=>x&&x.visible!==false&&x.title===key);
  if(!p)throw new Error('找不到此作品');
  render(p);
 }catch(err){
  $('#case-study').innerHTML='<div class="case-error"><h1>作品暫時無法顯示</h1><p>請返回作品集，或稍後重試。</p><a href="index.html#portfolio">← 返回作品集</a></div>';
  console.warn(err);
 }
}
init();