// Shared playback for illustrative demos. Timers run only while the scene is visible.
export function createScrollPlayback({root,target=root,controls,stepCount,initialStep=0,durations=4000,compact=false,onStep}) {
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let step=initialStep, visible=false, entered=false, paused=false, explicitPlay=false;
  let timer=null, startedAt=0, animation=null;
  const duration=()=>Array.isArray(durations)?(durations[step]||4000):durations;
  let remaining=duration();
  controls.classList.add('demo-playback');
  controls.classList.toggle('demo-playback-compact',compact);
  controls.setAttribute('role','group');
  controls.setAttribute('aria-label','Demo playback');
  controls.innerHTML=`<div class="demo-playback-row"><button type="button" class="demo-toggle" aria-label="Pause demo"><span class="demo-toggle-symbol" aria-hidden="true">Ⅱ</span><span class="demo-toggle-label">Pause demo</span></button><div class="demo-secondary-controls"><button type="button" class="demo-replay" aria-label="Replay demo"><span aria-hidden="true">↻</span> Replay</button><button type="button" class="demo-next" aria-label="Show next step">Next <span aria-hidden="true">→</span></button></div></div><div class="demo-progress" aria-hidden="true"><span></span></div>`;
  const toggle=controls.querySelector('.demo-toggle'), bar=controls.querySelector('.demo-progress span');
  function stopClock(){
    if(timer!==null){clearTimeout(timer);timer=null;remaining=Math.max(0,remaining-(performance.now()-startedAt));}
    animation?.cancel();animation=null;
    bar.style.transform=`scaleX(${Math.max(0,Math.min(1,1-remaining/duration()))})`;
  }
  function wantsPlay(){return !paused&&(!motion.matches||explicitPlay);}
  function sync(){
    const playing=wantsPlay()&&visible&&!document.hidden;
    if(!playing)stopClock();
    root.dataset.playback=paused?'paused':!wantsPlay()?'reduced-motion':document.hidden?'background':!visible?(entered?'offscreen':'waiting'):'playing';
    root.dataset.playbackStep=String(step);
    const shouldPause=wantsPlay();
    toggle.setAttribute('aria-label',shouldPause?'Pause demo':'Play demo');
    toggle.setAttribute('title',shouldPause?'Pause demo':'Play demo');
    toggle.querySelector('.demo-toggle-label').textContent=shouldPause?'Pause demo':'Play demo';
    toggle.querySelector('.demo-toggle-symbol').textContent=shouldPause?'Ⅱ':'▷';
    if(playing&&timer===null){
      startedAt=performance.now();
      if(!motion.matches&&bar.animate)animation=bar.animate([{transform:`scaleX(${1-remaining/duration()})`},{transform:'scaleX(1)'}],{duration:remaining,easing:'linear',fill:'forwards'});
      timer=setTimeout(()=>{timer=null;animation?.cancel();animation=null;step=(step+1)%stepCount;remaining=duration();onStep(step,{automatic:true});sync();},remaining);
    }
  }
  function pause(){paused=true;sync();}
  function play(){paused=false;explicitPlay=true;sync();}
  function seek(index,{play:resume=false,render=true}={}){
    stopClock();step=((index%stepCount)+stepCount)%stepCount;remaining=duration();paused=!resume;if(resume)explicitPlay=true;
    if(render)onStep(step,{automatic:false});
    bar.style.transform='scaleX(0)';sync();
  }
  function replay(){seek(0,{play:true});}
  function next(){seek(step+1);}
  toggle.addEventListener('click',()=>wantsPlay()?pause():play());
  controls.querySelector('.demo-replay').addEventListener('click',replay);
  controls.querySelector('.demo-next').addEventListener('click',next);
  // A focused control outside playback belongs to the visitor; do not replace it.
  root.addEventListener('focusin',event=>{if(!event.target.closest('.demo-playback'))pause();});
  document.addEventListener('visibilitychange',sync);
  motion.addEventListener('change',()=>{if(motion.matches)explicitPlay=false;sync();});
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{const entry=entries[0];visible=entry.isIntersecting&&entry.intersectionRatio>=.4;if(visible)entered=true;sync();},{threshold:[0,.4],rootMargin:'-76px 0px -4% 0px'});
    observer.observe(target);
  }else visible=true;
  sync();
  return {seek,play,pause,replay,next,getState:()=>({step,visible,paused,remaining,playing:timer!==null})};
}
