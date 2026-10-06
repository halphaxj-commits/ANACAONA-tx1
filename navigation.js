/* SCOUT HUB V22 — stable UI-first navigation */
const Navigation=(()=>{let current='home';const pages=['home','learn','members','activities','games','messages','more'];
function renderPage(id){try{if(id==='members')Members?.render?.();if(id==='activities')Activities?.render?.();if(id==='learn'&&typeof ScoutLearning!=='undefined')ScoutLearning.render();if(id==='games')Games?.init?.();if(id==='messages'){Chat?.renderConversations?.();Chat?.render?.()}}catch(e){console.warn('[Navigation] render',id,e)}}
function show(page){if(!pages.includes(page))page='home';const p=document.getElementById(page);if(!p)return;
document.querySelectorAll('.page').forEach(x=>{const on=x.id===page;x.classList.toggle('active',on);x.setAttribute('aria-hidden',on?'false':'true');x.hidden=!on});
document.querySelectorAll('.nav-btn').forEach(x=>x.classList.toggle('active',x.dataset.action===page));
current=page;try{history.replaceState({page},'',`#${page}`)}catch{}
const main=document.getElementById('main');if(main)main.scrollTop=0;renderPage(page)}
function init(){document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action;if(a==='new-member'){e.preventDefault();Members?.open?.();return}if(a==='new-activity'){e.preventDefault();Activities?.open?.();return}if(!pages.includes(a))return;e.preventDefault();e.stopPropagation();show(a)},true);
window.addEventListener('hashchange',()=>show(location.hash.slice(1)||'home'));show(location.hash.slice(1)||'home')}
return{init,show}})();