import { createScrollPlayback } from './scroll-playback.js';

const views = {
  overview: {
    title:'Your connected enterprise', icon:'user', request:'A new teammate joins', context:'One coordinated workflow',
    steps:[['user','Verify identity'],['cloud','Prepare workspace'],['shield','Protect device']],
    status:['The right access, from day one.','Identity verified.','Their workspace is ready.','Protected, connected, ready to work.']
  },
  security: {
    title:'Cybersecurity', icon:'shield', request:'Unusual sign-in detected', context:'A coordinated response',
    steps:[['scan','Detect'],['layers','Investigate'],['shield','Contain']],
    status:['An alert enters the queue.','The signal is captured.','Identity and device context checked.','Suspicious access contained.']
  },
  cloud: {
    title:'Cloud & infrastructure', icon:'cloud', request:'Move an application to the cloud', context:'A planned migration',
    steps:[['layers','Plan'],['cloud','Migrate'],['pulse','Validate']],
    status:['Map the workload and its dependencies.','The migration path is ready.','The workload moves in stages.','Health checks complete. Ready to operate.']
  },
  ai: {
    title:'AI & automation', icon:'spark', request:'Help a team resolve a request', context:'People stay in control',
    steps:[['database','Gather context'],['spark','Prepare draft'],['user','Human review']],
    status:['A request starts the workflow.','Relevant knowledge is connected.','A proposed response is ready.','Reviewed and approved for handoff.']
  }
};

export function initCommandCenter(renderIcons) {
  const dashboard=document.querySelector('.overview-dashboard');
  const content=dashboard.querySelector('.dashboard-content');
  dashboard.classList.add('command-dashboard');
  let current='overview', stage=0, playback;
  content.innerHTML=`<div class="command-toolbar"><span id="command-title"></span><span>EXAMPLE</span></div>
    <div class="command-canvas">
      <div class="command-example" role="group" aria-label="Illustrative connected workflow">
        <div class="command-request"><span class="command-request-icon"></span><div><strong id="command-request"></strong><small id="command-context"></small></div><span class="command-request-dot" aria-hidden="true"></span></div>
        <div class="command-pipeline"></div>
        <div class="command-result" aria-live="off"><span class="command-result-icon" aria-hidden="true"></span><span id="command-status"></span></div>
      </div>
      <div class="command-playback"></div>
    </div>`;
  function updateProgress({automatic=false}={}) {
    const v=views[current];
    content.querySelector('.command-result').setAttribute('aria-live',automatic?'off':'polite');
    content.querySelectorAll('.command-node').forEach((el,i)=>{
      el.classList.toggle('is-active',i===Math.min(stage,2));
      el.classList.toggle('is-complete',i<stage);
      if(i===Math.min(stage,2))el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');
    });
    content.querySelector('.command-example').dataset.stage=String(stage);
    content.querySelector('#command-status').textContent=v.status[stage];
    content.querySelector('.command-result-icon').textContent=stage===3?'✓':'•';
  }
  function select(key) {
    current=key;stage=0;const v=views[key];
    content.querySelector('#command-title').textContent=v.title;
    content.querySelector('#command-request').textContent=v.request;
    content.querySelector('#command-context').textContent=v.context;
    content.querySelector('.command-request-icon').innerHTML=`<i data-icon="${v.icon}"></i>`;
    content.querySelector('.command-pipeline').innerHTML=v.steps.map(([icon,title])=>`<div class="command-node"><span class="command-node-icon"><i data-icon="${icon}"></i><b aria-hidden="true">✓</b></span><span>${title}</span></div>`).join('');
    dashboard.querySelectorAll('.dash-tab').forEach(tab=>{const active=tab.dataset.view===key;tab.classList.toggle('active',active);tab.setAttribute('aria-pressed',String(active));});
    renderIcons(content);updateProgress();
  }
  dashboard.querySelectorAll('.dash-tab').forEach(tab=>tab.addEventListener('click',()=>{select(tab.dataset.view);playback.seek(0,{render:false});}));
  select(current);
  playback=createScrollPlayback({root:dashboard,target:content.querySelector('.command-example'),controls:content.querySelector('.command-playback'),compact:true,stepCount:4,durations:[3500,3500,3500,5000],onStep:(index,options)=>{stage=index;updateProgress(options);}});
}
