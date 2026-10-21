// Quiet, illustrative service scenes. Playback is local and starts in view.
import { createScrollPlayback } from './scroll-playback.js';

const icon=name=>`<i data-icon="${name}" aria-hidden="true"></i>`;
const tick='<span class="sd-tick" aria-hidden="true">✓</span>';
const providers=[
  {name:'AWS',file:'aws.svg'},
  {name:'Azure',file:'microsoft.svg'},
  {name:'Google Cloud',file:'google-cloud.svg'}
];

const scenes=[
  {selector:'.security-art',key:'security',name:'Cybersecurity',steps:3,durations:[3600,3600,5000],render:securityScene,description:'An unusual sign-in is detected, reviewed by an analyst, and contained at the affected endpoint.'},
  {selector:'.cloud-art',key:'cloud',name:'Cloud solutions',steps:3,durations:[3600,3600,5000],render:cloudScene,description:'A workload is prepared, moved to its cloud destination, and validated.'},
  {selector:'.ai-art',key:'ai',name:'AI solutions',steps:4,durations:[3600,3600,4500,5000],render:aiScene,description:'A request becomes a draft. A human reviews it before the approved handoff.'},
  {selector:'.support-art',key:'it',name:'Managed IT',steps:4,durations:[3600,3600,3600,5000],render:itScene,description:'An application connection issue moves through triage, a fix, and verification.'}
];

function securityScene(step){
  const labels=['Unusual sign-in','Analyst review','Endpoint response'];
  const icons=['scan','user','shield'];
  const details=[['Flagged','Waiting','Ready'],['Detected','Reviewing','Ready'],['Detected','Reviewed','Contained']][step];
  return `<div class="sd-window sd-security-window"><div class="sd-window-bar">${icon('shield')}<span>VegaProtect</span><span class="sd-window-indicator" aria-hidden="true"></span></div><div class="sd-alert-list">${labels.map((label,i)=>`<div class="sd-alert-row ${i===step?'is-current':''} ${i<step?'is-complete':''}"><span class="sd-row-icon">${icon(icons[i])}</span><span>${label}</span><span class="sd-row-state">${i<step||step===2&&i===2?tick:''}${details[i]}</span></div>`).join('')}</div></div>`;
}

function cloudScene(step,provider){
  const destination=providers[provider];
  return `<div class="sd-cloud-flow"><div class="sd-workload ${step===0?'is-current':''}">${icon('database')}<span>Business workload</span><span class="sd-workload-dot" aria-hidden="true"></span></div><div class="sd-cloud-branches" aria-hidden="true"><span></span><span></span><span></span></div><div class="sd-cloud-providers">${providers.map((item,i)=>`<div class="sd-provider ${i===provider&&step>0?'is-current':''}"><div class="sd-provider-mark"><img src="assets/tech/${item.file}" alt="${item.name==='Azure'?'Microsoft':item.name}" width="80" height="24" class="sd-logo-${i}">${item.name==='Azure'?'<small>Azure</small>':''}</div><span class="sd-provider-state">${i===provider?(step===2?'Verified':step===1?'Deploying':'Selected'):'Available'}</span></div>`).join('')}</div><div class="sd-cloud-note">${step===2?tick:icon('layers')}<span>${step===0?'Ready to migrate':step===1?`Moving to ${destination.name}`:'Deployment validated'}</span></div></div>`;
}

function aiScene(step){
  const active=Math.min(step,2);
  const labels=['Service plan request','A response, drafted','Human review'];
  const captions=['Approved context','Ready for review',step===3?'Approved for handoff':step===2?'Reviewer checks the draft':'Required before handoff'];
  return `<div class="sd-ai-flow">${labels.map((label,i)=>`${i?'<div class="sd-ai-connector" aria-hidden="true"></div>':''}<div class="sd-ai-card ${active===i?'is-current':''} ${i<active||step===3?'is-complete':''}"><span class="sd-ai-icon">${icon(['document','spark','user'][i])}</span><span><strong>${label}</strong><small>${captions[i]}</small></span><span class="sd-ai-mark" aria-hidden="true">${i<active||step===3?'✓':active===i?'· · ·':'↳'}</span></div>`).join('')}<div class="sd-ai-handoff ${step===3?'is-visible':''}">${icon('headphones')}<span>To the account team</span><span aria-hidden="true">↗</span></div></div>`;
}

function itScene(step){
  const state=['Open','In review','Fix applied','Resolved'][step];
  return `<div class="sd-window sd-it-window"><div class="sd-window-bar">${icon('headphones')}<span>IT support</span><span class="sd-inbox-label">Inbox</span></div><div class="sd-ticket-list"><div class="sd-ticket-row is-current"><span class="sd-ticket-icon">${icon(step===3?'shield':'monitor')}</span><div><strong>App connection</strong><small>${['Connection interrupted','Route issue identified','Configuration restored','Connection verified'][step]}</small></div><span class="sd-ticket-state ${step===3?'is-resolved':''}">${step===3?tick:''}${state}</span></div><div class="sd-ticket-row"><span class="sd-ticket-icon">${icon('grid')}</span><div><strong>Device onboarding</strong><small>Workplace setup</small></div><span class="sd-ticket-state">Scheduled</span></div><div class="sd-ticket-row"><span class="sd-ticket-icon">${icon('user')}</span><div><strong>Workspace access</strong><small>Account provisioning</small></div><span class="sd-ticket-state">Ready</span></div></div></div>`;
}

export function initServiceDemos(renderIcons){
  scenes.forEach(def=>{
    const root=document.querySelector(def.selector);
    if(!root||root.dataset.demoReady)return;
    root.dataset.demoReady='true';
    root.classList.add('service-demo',`sd-${def.key}`);
    root.setAttribute('role','group');
    root.setAttribute('aria-label',`${def.name}. Illustrative workflow: ${def.description}`);
    root.innerHTML='<div class="sd-scene" aria-live="off"></div><div class="sd-playback"></div>';
    const scene=root.querySelector('.sd-scene');
    let provider=0;
    function render(step,{animate=false}={}){
      root.dataset.stage=String(step);
      scene.innerHTML=def.render(step,provider);
      renderIcons(scene);
      if(animate&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches&&scene.animate){
        scene.animate([{opacity:.65},{opacity:1}],{duration:450,easing:'ease-out'});
      }
    }
    render(0);
    createScrollPlayback({
      root,
      controls:root.querySelector('.sd-playback'),
      compact:true,
      stepCount:def.steps,
      durations:def.durations,
      onStep(step){
        if(step===0&&def.key==='cloud')provider=(provider+1)%providers.length;
        render(step,{animate:true});
      }
    });
  });
}
