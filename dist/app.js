import { initCommandCenter } from './command-center.js';
import { initServiceDemos } from './service-demos.js';
import { initExperienceDemos } from './experience-demos.js';

const icons = {
  shield:'<path d="M12 3 20 6v6c0 5-8 9-8 9s-8-4-8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  cloud:'<path d="M7 18h11a4 4 0 0 0 .7-7.94 7 7 0 0 0-13.45-1.4A4.8 4.8 0 0 0 7 18Z"/>',
  spark:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5zM20 2v4m-2-2h4"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  monitor:'<rect x="3" y="3" width="18" height="13" rx="2"/><path d="M8 21h8m-4-5v5"/>',
  layers:'<path d="m12 3 10 5-10 5L2 8zM2 12l10 5 10-5M2 16l10 5 10-5"/>',
  headphones:'<path d="M4 14v-3a8 8 0 0 1 16 0v3M20 17v1a3 3 0 0 1-3 3h-3"/><rect x="2" y="11" width="4" height="7" rx="2"/><rect x="18" y="11" width="4" height="7" rx="2"/>',
  network:'<rect x="8" y="2" width="8" height="6" rx="1"/><rect x="2" y="16" width="7" height="6" rx="1"/><rect x="15" y="16" width="7" height="6" rx="1"/><path d="M12 8v5M5.5 16v-3h13v3"/>',
  database:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
  infinity:'<path d="M12 12C4-1-4 12 4 17c4 3 8-5 8-5s4-8 8-5c8 5 0 18-8 5Z"/>',
  user:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  pulse:'<path d="M2 12h5l3-8 4 16 3-8h5"/>',
  code:'<path d="m8 5-6 7 6 7m8-14 6 7-6 7m-3-16-2 18"/>',
  document:'<path d="M14 2H5v20h14V7zM14 2v5h5M8 12h8m-8 4h5"/>',
  phone:'<path d="M6 3H3v4c0 8 6 14 14 14h4v-4l-5-2-2 2a15 15 0 0 1-7-7l2-2z"/>',
  sliders:'<path d="M4 3v18M12 3v18M20 3v18"/><path d="M1 8h6m2 8h6m2-10h6"/>',
  scan:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5M7 12h10M12 7v10"/>'
};
function renderIcons(root=document){root.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[el.dataset.icon]||icons.spark}</svg>`;});}
renderIcons();

const technologies=[['Microsoft','microsoft.svg'],['AWS','aws.svg'],['Google Cloud','google-cloud.svg'],['SentinelOne','sentinelone.svg'],['Palo Alto Networks','palo-alto-networks.svg'],['Fortinet','fortinet.svg'],['Ubiquiti','ubiquiti.png'],['N-able','n-able.svg']];
const marquee=document.querySelector('.service-marquee');
marquee.setAttribute('role','group');
marquee.setAttribute('aria-label',`Built on best-in-class technology: ${technologies.map(([name])=>name).join(', ')}.`);
const caption=document.createElement('p');caption.className='marquee-caption';caption.textContent='BUILT ON BEST-IN-CLASS TECHNOLOGY';marquee.prepend(caption);
document.querySelector('.marquee-track').innerHTML=[0,1].map(copy=>technologies.map(([name,file])=>`<span class="marquee-item"${copy?' data-duplicate="true"':''}><img src="assets/tech/${file}" alt="${name}" width="140" height="38"></span>`).join('')).join('');

const header=document.querySelector('.site-header');
const menuToggle=document.querySelector('.menu-toggle');
function closeMenu(){header.classList.remove('menu-open');document.body.classList.remove('nav-open');menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','Open navigation');}
menuToggle.addEventListener('click',()=>{const open=header.classList.toggle('menu-open');document.body.classList.toggle('nav-open',open);menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
document.querySelectorAll('#main-nav a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{
  if(!header.classList.contains('menu-open'))return;
  if(e.key==='Escape'){closeMenu();menuToggle.focus();}
  if(e.key==='Tab'){
    const controls=[...header.querySelectorAll('a,button')].filter(el=>el.getClientRects().length);
    const first=controls[0],last=controls.at(-1);
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
});
document.addEventListener('pointerdown',e=>{if(header.classList.contains('menu-open')&&!header.contains(e.target))closeMenu();});
window.matchMedia('(max-width: 800px)').addEventListener('change',e=>{if(!e.matches)closeMenu();});
const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
const parallaxViewport=window.matchMedia('(min-width: 801px) and (min-height: 600px) and (pointer: fine)');
const hero=document.querySelector('.hero'),heroContent=document.querySelector('.hero-content');
let ticking=false;
function onScroll(){if(!ticking){requestAnimationFrame(()=>{header.classList.toggle('scrolled',window.scrollY>20);if(!motionPreference.matches&&parallaxViewport.matches){const y=window.scrollY;heroContent.style.transform=`translateY(${Math.min(y*.12,110)}px)`;heroContent.style.opacity=String(Math.max(0,1-y/(hero.offsetHeight*.85)));}else{heroContent.style.transform='none';heroContent.style.opacity='1';}ticking=false;});ticking=true;}}
window.addEventListener('scroll',onScroll,{passive:true});onScroll();
window.addEventListener('resize',onScroll,{passive:true});
motionPreference.addEventListener('change',onScroll);
parallaxViewport.addEventListener('change',onScroll);
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}});},{threshold:.08,rootMargin:'0px 0px -25px 0px'});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}else document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));

initCommandCenter(renderIcons);
initServiceDemos(renderIcons);
initExperienceDemos(renderIcons);

const services={
cybersecurity:{title:'Cybersecurity',icon:'shield',description:'Build resilience into your business with VegaProtect. Bring prevention, detection, and response together to protect your systems and the people who depend on them.',items:['Managed detection and response','Incident response and recovery','Zero-trust architecture','Threat intelligence and security operations']},
cloud:{title:'Cloud solutions',icon:'cloud',description:'Build the infrastructure your business needs next. VegaNext helps you migrate, optimize, and operate across public cloud, private data centers, and your network.',items:['AWS, Microsoft Azure, and Google Cloud','Cloud migration and workload placement','Cloud cost optimization','Managed cloud operations and scaling']},
ai:{title:'AI solutions',icon:'spark',description:'Move from AI possibility to practical business workflows. Prepare your data, connect your systems, and automate with clear governance and human oversight.',items:['Data cleansing and AI readiness','Agentic workflows and business automation','Human escalation and review gates','AI governance and explainability']},
managed:{title:'Managed IT',icon:'monitor',description:'Give your business a connected foundation. VegaNext manages the infrastructure behind your operations, so your people can focus on the work in front of them.',items:['Cloud and private data center operations','Networking and infrastructure management','Monitoring and engineering support','Technology planning as your needs evolve']},
support:{title:'Support that scales',icon:'headphones',description:'Add expertise alongside your team. Ongoing monitoring and engineering support help keep your infrastructure and daily operations moving as your business grows.',items:['Ongoing infrastructure support','Around-the-clock monitoring','Engineering expertise across your platforms','A coordinated approach to your IT environment']},
devops:{title:'DevOps',icon:'code',description:'Connect development and operations with a repeatable way to build, deploy, and improve. Give your teams the foundations to deliver with confidence.',items:['CI/CD pipelines','Kubernetes and container workflows','Infrastructure as code','Monitoring and operational visibility']},
compliance:{title:'Compliance readiness',icon:'document',description:'Understand the gaps and build a practical path forward. VegaNext helps you prepare for the requirements that matter to your business.',items:['CMMC, SOC 2, and HIPAA readiness','Risk assessments and gap analysis','Policy mapping','Evidence collection and readiness support']},
voip:{title:'VoIP',icon:'phone',description:'Keep your business connected with modern voice communications. Bring calls, routing, and useful intelligence into the way your team works.',items:['Business voice communications','Intelligent call routing','AI transcription and sentiment features','SIP trunking']}
};
const dialog=document.getElementById('service-dialog');let dialogTrigger=null;
document.querySelectorAll('[data-service]').forEach(button=>button.addEventListener('click',()=>{const service=services[button.dataset.service];dialogTrigger=button;document.getElementById('dialog-title').textContent=service.title;document.getElementById('dialog-description').textContent=service.description;document.getElementById('dialog-list').innerHTML=service.items.map(item=>`<li>${item}</li>`).join('');document.querySelector('.dialog-icon').innerHTML=`<i data-icon="${service.icon}"></i>`;renderIcons(document.querySelector('.dialog-icon'));dialog.showModal();dialog.querySelector('.dialog-content').scrollTop=0;document.body.classList.add('dialog-open');}));
document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const bounds=dialog.getBoundingClientRect();if(e.clientX<bounds.left||e.clientX>bounds.right||e.clientY<bounds.top||e.clientY>bounds.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{document.body.classList.remove('dialog-open');dialogTrigger?.focus({preventScroll:true});});
document.getElementById('year').textContent=new Date().getFullYear();
