import { createScrollPlayback } from './scroll-playback.js';

const icon = (name) => `<i data-icon="${name}" aria-hidden="true"></i>`;

const stages = [
  {
    eyebrow: '01 / UNDERSTAND THE LANDSCAPE',
    title: 'A clear view of<br>where you stand.',
    description: 'We look at your technology, business goals, and day-to-day challenges to understand what’s working and where the opportunities are.',
    label: 'Illustrative assessment of people, cloud systems, and data.',
    visual: `<div class="exp-assessment">
      <div class="exp-inventory-row">${icon('user')}<span>People & access</span><b aria-hidden="true">✓</b></div>
      <div class="exp-inventory-row exp-active">${icon('cloud')}<span>Cloud & systems</span><b aria-hidden="true">✓</b></div>
      <div class="exp-inventory-row">${icon('database')}<span>Data & workflows</span><b aria-hidden="true">✓</b></div>
    </div>`
  },
  {
    eyebrow: '02 / BUILD THE ROADMAP',
    title: 'The right plan.<br>For your business.',
    description: 'We connect your priorities to a practical technology roadmap, with security, architecture, and the people using it considered from the start.',
    label: 'Illustrative roadmap: secure the foundation, connect the environment, then build what comes next.',
    visual: `<div class="exp-roadmap">
      <ol class="exp-roadmap-list">
        <li><b>01</b><span>Secure the foundation</span></li>
        <li class="exp-active"><b>02</b><span>Connect the environment</span></li>
        <li><b>03</b><span>Build what’s next</span></li>
      </ol>
    </div>`
  },
  {
    eyebrow: '03 / PUT THE PLAN TO WORK',
    title: 'Expertise that<br>follows through.',
    description: 'From cloud migrations to security operations and AI workflows, we bring the technical expertise to put your plan into practice.',
    label: 'Illustrative delivery flow: prepare, validate, and roll out.',
    visual: `<div class="exp-delivery">
      <div class="exp-delivery-line" aria-hidden="true"></div>
      <div class="exp-release-node">${icon('code')}<span>Prepare</span></div>
      <div class="exp-release-node exp-active">${icon('shield')}<span>Validate</span></div>
      <div class="exp-release-node">${icon('network')}<span>Roll out</span></div>
    </div>`
  },
  {
    eyebrow: '04 / KEEP MOVING FORWARD',
    title: 'Built to adapt.<br>Ready to grow.',
    description: 'Your business keeps evolving. Ongoing support, monitoring, and optimization help your technology evolve with it.',
    label: 'Illustrative continuous improvement cycle: observe, review, and improve.',
    visual: `<div class="exp-evolve">
      <svg class="exp-cycle-path" viewBox="0 0 300 200" preserveAspectRatio="none" aria-hidden="true"><path d="M150 44 62 150H238Z"/><path class="exp-cycle-arrow" d="m92 105-8 5 1-9m63 53 8-4-8-4m55-46-1-9-8 4"/></svg>
      <div class="exp-cycle-node exp-cycle-observe">${icon('pulse')}<span>Observe</span></div>
      <div class="exp-cycle-node exp-cycle-review">${icon('scan')}<span>Review</span></div>
      <div class="exp-cycle-node exp-cycle-improve exp-active">${icon('sliders')}<span>Improve</span></div>
    </div>`
  }
];

const industryVisuals = [
  {
    className: 'care',
    label: 'Illustrative healthcare flow: patient and care team connect through protected records.',
    markup: `<div class="exp-care-line" aria-hidden="true"></div><div class="exp-industry-node exp-care-patient">${icon('user')}<span>Patient</span></div><div class="exp-industry-node exp-care-records">${icon('shield')}<span>Protected<br>records</span></div><div class="exp-industry-node exp-care-team">${icon('pulse')}<span>Care team</span></div><span class="exp-industry-caption">CONNECTED CARE. PROTECTED INFORMATION.</span>`
  },
  {
    className: 'logistics',
    label: 'Illustrative logistics route: connected warehouse, transit, and destination systems.',
    markup: `<svg class="exp-route-map" viewBox="0 0 420 120" preserveAspectRatio="none" aria-hidden="true"><path class="exp-map-grid" d="M0 24H420M0 60H420M0 96H420M52 0V120M105 0V120M157 0V120M210 0V120M262 0V120M315 0V120M367 0V120"/><path class="exp-route-shadow" d="M50 78H124Q148 78 148 54V38Q148 24 168 24H243Q265 24 265 45V55Q265 78 290 78H370"/><path class="exp-route" d="M50 78H124Q148 78 148 54V38Q148 24 168 24H243Q265 24 265 45V55Q265 78 290 78H370"/><circle cx="50" cy="78" r="4"/><circle cx="210" cy="24" r="4"/><circle cx="370" cy="78" r="4"/></svg><span class="exp-route-label exp-route-start">Warehouse</span><span class="exp-route-label exp-route-mid">Transit</span><span class="exp-route-label exp-route-end">Destination</span><span class="exp-industry-caption">VISIBILITY ACROSS THE JOURNEY.</span>`
  },
  {
    className: 'retail',
    label: 'Illustrative retail systems: point of sale, inventory, and service connected to one operating foundation.',
    markup: `<div class="exp-retail-systems"><div>${icon('monitor')}<span>Point of sale</span></div><div>${icon('layers')}<span>Inventory</span></div><div>${icon('headphones')}<span>Service</span></div></div><div class="exp-retail-bus"><span></span><b>Connected operations</b><span></span></div><span class="exp-industry-caption">ONE EXPERIENCE. CONNECTED SYSTEMS.</span>`
  },
  {
    className: 'finance',
    label: 'Illustrative financial services controls: verified identity, protected documents, and a traceable audit trail.',
    markup: `<div class="exp-finance-flow"><div class="exp-finance-identity">${icon('user')}<span>Identity</span></div><span class="exp-finance-connector" aria-hidden="true">→</span><div class="exp-finance-documents">${icon('document')}<span>Documents</span><b class="exp-doc-line"></b><b class="exp-doc-line short"></b></div><span class="exp-finance-connector" aria-hidden="true">→</span><div class="exp-finance-audit">${icon('shield')}<span>Audit trail</span></div></div><span class="exp-industry-caption">CONTROLLED ACCESS. CLEAR ACCOUNTABILITY.</span>`
  }
];

export function initExperienceDemos(renderIcons) {
  const visual = document.querySelector('.journey-visual');
  const panel = document.getElementById('journey-panel');
  const tabs = [...document.querySelectorAll('[data-step]')];
  if (visual && panel && tabs.length === stages.length) {
    visual.classList.add('exp-journey-visual');
    function selectStage(index) {
      const stage = stages[index];
      tabs.forEach((tab, tabIndex) => {
        const active = index === tabIndex;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
      });
      panel.setAttribute('aria-labelledby', tabs[index].id);
      document.getElementById('journey-eyebrow').textContent = stage.eyebrow;
      document.getElementById('journey-title').innerHTML = stage.title;
      document.getElementById('journey-description').textContent = stage.description;
      visual.innerHTML = `<div class="exp-artifact exp-stage-${index}" role="img" aria-label="${stage.label}">${stage.visual}</div>`;
      renderIcons(visual);
    }
    selectStage(0);
    const root = visual.closest('.journey-dashboard');
    const controls = document.createElement('div');
    controls.className = 'exp-playback';
    root.querySelector('.journey-bottom').append(controls);
    const playback = createScrollPlayback({
      root,
      target: visual,
      controls,
      stepCount: stages.length,
      initialStep: 0,
      durations: [7000, 7000, 7000, 7000],
      compact: true,
      onStep: selectStage
    });
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => playback.seek(index));
      tab.addEventListener('keydown', (event) => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next !== undefined) {
          event.preventDefault();
          playback.seek(next);
          tabs[next].focus();
        }
      });
    });
  }

  document.querySelectorAll('.industry-card').forEach((card, index) => {
    const design = industryVisuals[index];
    if (!design || card.querySelector('.exp-industry-visual')) return;
    const figure = document.createElement('div');
    figure.className = `exp-industry-visual exp-industry-${design.className}`;
    figure.setAttribute('role', 'img');
    figure.setAttribute('aria-label', design.label);
    figure.innerHTML = design.markup;
    const oldIcon = card.querySelector(':scope > i');
    if (oldIcon) oldIcon.replaceWith(figure);
    else card.prepend(figure);
    renderIcons(figure);
  });
}
