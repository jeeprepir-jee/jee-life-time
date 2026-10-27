(function(){
'use strict';
const KEY='jeeOSVideos';
const seed=[
 {id:'seed-1',title:'Video 1 — review and extract useful ideas',url:'https://youtu.be/IpjZVvlBSEw?si=urRIvrcg16bAVV8d',subject:'JEE Strategy',transcript:'',takeaways:[],createdAt:Date.now()},
 {id:'seed-2',title:'Video 2 — review and extract useful ideas',url:'https://youtu.be/jP1YQLr1Nvs?si=fhRWVlKFOqX3drNF',subject:'JEE Strategy',transcript:'',takeaways:[],createdAt:Date.now()}
];
let videos=[];try{videos=JSON.parse(localStorage.getItem(KEY)||'null')||seed}catch(e){videos=seed}
const $=id=>document.getElementById(id);
const esc=s=>String(s||'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(videos))}catch(e){alert('Could not save locally. Please export or clear browser storage.')}};
function getMainState(){try{return JSON.parse(localStorage.getItem('jeeOS')||'{}')}catch(e){return {}}}
function saveMainState(s){localStorage.setItem('jeeOS',JSON.stringify(s))}
function render(){
 const box=$('videoList');if(!box)return;
 if(!videos.length){box.innerHTML='<div class="video-empty">Your inbox is clear. Add a video above or restore your two starter links.</div>';return}
 box.innerHTML=videos.map(v=>'<article class="panel video-card"><h3>'+esc(v.title)+'</h3><div class="video-meta">'+esc(v.subject)+' · '+new Date(v.createdAt).toLocaleDateString()+'</div><a href="'+esc(v.url)+'" target="_blank" rel="noopener noreferrer">Open on YouTube ↗</a><p class="video-notes">'+esc(v.transcript||'No transcript or notes added yet.')+'</p><div class="video-actions"><button type="button" data-action="edit" data-id="'+v.id+'">Edit notes</button><button type="button" class="secondary" data-action="extract" data-id="'+v.id+'">Make takeaways</button><button type="button" class="secondary" data-action="delete" data-id="'+v.id+'">Remove</button></div>'+(v.takeaways&&v.takeaways.length?'<div class="takeaways">'+v.takeaways.map((t,i)=>'<div class="takeaway"><span>'+esc(t)+'</span><span><button type="button" data-action="task" data-id="'+v.id+'" data-index="'+i+'">＋ Task</button> <button type="button" class="secondary" data-action="note" data-id="'+v.id+'" data-index="'+i+'">Save note</button></span></div>').join('')+'</div>':'')+'</article>').join('');
}
$('videoForm')?.addEventListener('submit',e=>{e.preventDefault();const title=$('videoTitle').value.trim(),url=$('videoUrl').value.trim();if(!title||!/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(url)){alert('Enter a title and a valid YouTube URL.');return}videos.unshift({id:'v-'+Date.now(),title,url,subject:$('videoSubject').value,transcript:$('videoTranscript').value.trim(),takeaways:[],createdAt:Date.now()});persist();e.target.reset();render()});
$('videoList')?.addEventListener('click',e=>{const b=e.target.closest('button[data-action]');if(!b)return;const v=videos.find(x=>x.id===b.dataset.id);if(!v)return;const action=b.dataset.action;
 if(action==='delete'){if(confirm('Remove this video and its saved takeaways?')){videos=videos.filter(x=>x.id!==v.id);persist();render()}return}
 if(action==='edit'){const val=prompt('Paste transcript, captions, or your notes for this video:',v.transcript||'');if(val!==null){v.transcript=val;persist();render()}return}
 if(action==='extract'){if(!v.transcript.trim()){alert('First choose Edit notes and paste transcript/captions or your own notes.');return}const lines=v.transcript.split(/\n+|(?<=[.!?])\s+/).map(x=>x.replace(/^[-•*\d.)\s]+/,'').trim()).filter(x=>x.length>12);v.takeaways=[...new Set(lines)].slice(0,20);if(!v.takeaways.length)v.takeaways=[v.transcript.trim()];persist();render();return}
 const t=v.takeaways[Number(b.dataset.index)];if(!t)return;
 if(action==='task'){const s=getMainState();s.tasks=Array.isArray(s.tasks)?s.tasks:[];s.tasks.push({text:'From video: '+t,done:false});saveMainState(s);alert('Added to your study tasks. Open Dashboard to see it.');return}
 if(action==='note'){const s=getMainState();const existing=typeof s.notes==='string'?s.notes:'';s.notes=existing+'\n\n[Video takeaway — '+v.title+']\n'+t;saveMainState(s);alert('Added to your existing Notes. Open Notes to review it.')}
});
render();
})();