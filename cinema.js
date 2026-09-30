/* Свободная нативная прокрутка. Параллакс двигает декорации, не колесо и не документ. */
(() => {
  'use strict';
  const clamp = value => Math.max(0,Math.min(1,value));
  const smooth = value => {const p=clamp(value);return p*p*(3-2*p);};
  const mix = (a,b,p) => a+(b-a)*p;
  if (typeof module !== 'undefined' && module.exports) module.exports={clamp,smooth,mix};
  if (typeof document === 'undefined') return;
  const root=document.documentElement;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  const hero=document.querySelector('#home');
  const stage=document.querySelector('.hero-visual');
  const voyager=document.querySelector('.cube-voyager');
  const world=document.querySelector('.parallax-world');
  const layers=[...document.querySelectorAll('.depth-layer')];
  const sections=[...document.querySelectorAll('main > section[id]')];
  const project=document.querySelector('.featured-project');
  const dust=document.querySelector('.scene-dust');
  const ctx=dust.getContext('2d',{alpha:true});
  const fragments=document.querySelector('.depth-fragments');
  const pieces=[];
  const locations=[[4,15,19],[94,7,25],[97,71,36],[2,77,28],[14,93,13],[87,92,17],[5,48,12],[93,39,10]];
  locations.forEach(([x,y,size],i)=>{
    const item=document.createElement('span');item.className='depth-fragment';
    item.style.setProperty('--size',size+'px');
    item.style.setProperty('--fragment-alpha',i%3===0?'.48':'.22');
    const solid=document.createElement('span');solid.className='fragment-solid';
    for(let f=0;f<6;f++){const face=document.createElement('i');face.className='fragment-face';solid.append(face);}
    item.append(solid);fragments.append(item);pieces.push({item,solid,x,y,i});
  });
  let width=innerWidth,height=innerHeight,scroll=scrollY,targetScroll=scrollY;
  let mouseX=0,mouseY=0,targetX=0,targetY=0,frame=0,size=600,maxScroll=1;
  let chapterPositions=[],assemblyRange=1,handoffStart=1,handoffRange=1;
  let dustColor='#d8f58c';
  const stars=Array.from({length:48},(_,i)=>({x:((i*71+23)%997)/997,y:((i*137+41)%991)/991,r:i%9===0?1.7:.6+(i%3)*.25}));
  function colors(){dustColor=getComputedStyle(root).getPropertyValue('--scene-a').trim();}
  function measure(){
    width=innerWidth;height=innerHeight;maxScroll=Math.max(1,document.documentElement.scrollHeight-height);
    const stageTop=stage.getBoundingClientRect().top+scrollY;
    assemblyRange=width<=900
      ? Math.max(350,stageTop+stage.clientHeight*.85-height*.4)
      : Math.max(250,hero.offsetTop+hero.offsetHeight-height+50);
    handoffStart=width<=900?Math.max(assemblyRange,hero.offsetTop+hero.offsetHeight-height*.55):assemblyRange;
    handoffRange=width<=900?Math.max(160,height*.3):assemblyRange*.28;
    size=Math.min(650,stage.clientWidth*1.04);
    voyager.style.width=size+'px';voyager.style.height=size+'px';
    const dpr=Math.min(devicePixelRatio||1,1.5);
    dust.width=Math.round(width*dpr);dust.height=Math.round(height*dpr);
    ctx?.setTransform(dpr,0,0,dpr,0,0);
    chapterPositions=sections.map(section=>({section,top:section.getBoundingClientRect().top+scrollY}));
    colors();queue();
  }
  function drawDust(progress){
    if(!ctx||reduced.matches)return;
    ctx.clearRect(0,0,width,height);ctx.fillStyle=dustColor;ctx.strokeStyle=dustColor;
    for(const star of stars){
      const x=star.x*width+mouseX*star.r*15+Math.sin(progress*5+star.x*6)*18;
      const y=((star.y*height-progress*(70+star.r*90))%height+height)%height;
      ctx.globalAlpha=star.r>1.5?.5:.22;
      ctx.beginPath();ctx.arc(x,y,star.r,0,Math.PI*2);ctx.fill();
      if(star.r>1.5){ctx.globalAlpha=.14;ctx.beginPath();ctx.moveTo(x-6,y);ctx.lineTo(x+6,y);ctx.moveTo(x,y-6);ctx.lineTo(x,y+6);ctx.stroke();}
    }
    ctx.globalAlpha=1;
  }
  function path(progress){
    const anchors=[
      {p:0,x:1.04,y:.45,s:.28,o:.22},
      {p:.22,x:.98,y:.22,s:.37,o:.15},
      {p:.42,x:.04,y:.75,s:.3,o:.17},
      {p:.61,x:1.02,y:.72,s:.36,o:.16},
      {p:.78,x:.05,y:.27,s:.33,o:.15},
      {p:1,x:.84,y:.85,s:.28,o:.14}
    ];
    let first=anchors[0],last=anchors[1];
    for(let i=0;i<anchors.length-1;i++){if(progress>=anchors[i].p){first=anchors[i];last=anchors[i+1];}}
    const p=smooth((progress-first.p)/(last.p-first.p));
    return {x:mix(first.x,last.x,p)*width,y:mix(first.y,last.y,p)*height,s:mix(first.s,last.s,p),o:mix(first.o,last.o,p)};
  }
  function paint(){
    frame=0;
    if(document.hidden)return;
    const still=reduced.matches;
    scroll=still?targetScroll:mix(scroll,targetScroll,.14);
    mouseX=still?0:mix(mouseX,targetX,.085);mouseY=still?0:mix(mouseY,targetY,.085);
    const progress=clamp(scroll/maxScroll);
    const range=assemblyRange;
    const phase=scroll/range;
    const assembly=clamp(phase);
    const stageRect=stage.getBoundingClientRect();
    const handoff=still?0:smooth((scroll-handoffStart)/handoffRange);
    const journey=path(clamp((scroll-handoffStart)/Math.max(1,maxScroll-handoffStart)));
    const x=mix(stageRect.left+stageRect.width/2,journey.x,handoff);
    const y=mix(stageRect.top+stageRect.height/2,journey.y,handoff);
    const scale=mix(1,journey.s,handoff);
    const opacity=still?(stageRect.bottom>0&&stageRect.top<height?1:0):mix(1,journey.o,handoff);
    voyager.style.setProperty('--cube-x',(x-size/2).toFixed(2)+'px');
    voyager.style.setProperty('--cube-y',(y-size/2).toFixed(2)+'px');
    voyager.style.setProperty('--cube-scale',scale.toFixed(4));
    voyager.style.setProperty('--cube-opacity',opacity.toFixed(4));
    hero.style.setProperty('--hero-progress',assembly.toFixed(4));
    hero.style.setProperty('--intro-opacity',still?'1':(1-smooth((phase-.78)/.48)).toFixed(3));
    hero.style.setProperty('--intro-y',still?'0px':(-smooth((phase-.78)/.48)*30).toFixed(2)+'px');
    hero.style.setProperty('--assembly-flash',still?'0':(Math.exp(-Math.pow((assembly-.92)/.052,2))*.35).toFixed(3));
    layers.forEach((layer,i)=>{
      const factor=[.12,.32,.65][i];
      layer.style.setProperty('--layer-x',still?'0px':(mouseX*100*factor+Math.sin(progress*5)*36*factor).toFixed(2)+'px');
      layer.style.setProperty('--layer-y',still?'0px':(-progress*250*factor+mouseY*75*factor).toFixed(2)+'px');
      layer.style.setProperty('--layer-turn',still?'0deg':((progress-.1)*factor*14).toFixed(3)+'deg');
    });
    world.style.setProperty('--sun-scale',still?'1':(1+Math.sin(progress*Math.PI)*.25).toFixed(4));
    world.style.setProperty('--ribbon-turn',still?'0deg':(progress*24).toFixed(3)+'deg');
    pieces.forEach(({item,solid,x,y,i})=>{
      item.style.left=x+'%';
      item.style.top=(y-progress*(22+i*2))+'%';
      solid.style.setProperty('--rx',(26+i*27+progress*105).toFixed(2)+'deg');
      solid.style.setProperty('--ry',(32+i*33-progress*170).toFixed(2)+'deg');
      solid.style.setProperty('--rz',(i*11+progress*55).toFixed(2)+'deg');
    });
    chapterPositions.forEach(({section})=>{
      const r=section.getBoundingClientRect();
      const local=clamp((height-r.top)/(height+r.height));
      section.style.setProperty('--title-y',still?'0px':((.5-local)*32).toFixed(2)+'px');
      if(section.id==='contact')section.style.setProperty('--contact-glow',still?'1':(1+local*.16).toFixed(3));
    });
    if(project){const r=project.getBoundingClientRect();const p=clamp((height-r.top)/(height+r.height));project.style.setProperty('--device-y',still?'0px':((.5-p)*45).toFixed(2)+'px');project.style.setProperty('--device-tilt',still?'0deg':((.5-p)*3).toFixed(3)+'deg');}
    drawDust(progress);
    if(!still&&(Math.abs(scroll-targetScroll)>.08||Math.abs(mouseX-targetX)>.001||Math.abs(mouseY-targetY)>.001))queue();
  }
  function queue(){if(!frame&&!document.hidden)frame=requestAnimationFrame(paint);}
  addEventListener('scroll',()=>{targetScroll=scrollY;queue();},{passive:true});
  addEventListener('pointermove',event=>{if(reduced.matches||!fine.matches)return;targetX=event.clientX/width-.5;targetY=event.clientY/height-.5;queue();},{passive:true});
  document.addEventListener('pointerleave',()=>{targetX=targetY=0;queue();});
  addEventListener('resize',measure);
  addEventListener('pageshow',()=>{scroll=targetScroll=scrollY;measure();});
  addEventListener('vorby-theme-change',measure);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&frame){cancelAnimationFrame(frame);frame=0;}else{scroll=targetScroll=scrollY;queue();}});
  reduced.addEventListener('change',()=>{root.classList.toggle('cinema-running',!reduced.matches);measure();});
  if(window.ResizeObserver)new ResizeObserver(measure).observe(document.querySelector('main'));
  document.querySelectorAll('.service-card').forEach(card=>{
    card.addEventListener('pointermove',event=>{if(reduced.matches||!fine.matches)return;const r=card.getBoundingClientRect();card.style.setProperty('--card-rx',((.5-(event.clientY-r.top)/r.height)*5).toFixed(2)+'deg');card.style.setProperty('--card-ry',(((event.clientX-r.left)/r.width-.5)*6).toFixed(2)+'deg');},{passive:true});
    card.addEventListener('pointerleave',()=>{card.style.setProperty('--card-rx','0deg');card.style.setProperty('--card-ry','0deg');});
  });
  root.classList.toggle('cinema-running',!reduced.matches);
  measure();
})();
