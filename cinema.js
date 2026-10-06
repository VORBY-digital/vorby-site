/* Свободная нативная прокрутка. Параллакс двигает декорации, не колесо и не документ. */
(() => {
  'use strict';
  const clamp = value => Math.max(0,Math.min(1,value));
  const smooth = value => {const p=clamp(value);return p*p*(3-2*p);};
  const mix = (a,b,p) => a+(b-a)*p;
  function planeMotion(travel,index,width,height,mx=0,my=0){
    const depth=[.14,.46,.92][index],phase=travel*.75;
    return {x:(Math.sin(phase)*Math.min(width*.075,110)+mx*155)*depth,y:(-Math.sin(phase)*height*.27+my*110)*depth,turn:Math.sin(phase*.6)*4*depth,scale:1+Math.sin(phase*.55)*.035*depth};
  }
  if (typeof module !== 'undefined' && module.exports) module.exports={clamp,smooth,mix,planeMotion};
  if (typeof document === 'undefined') return;
  const root=document.documentElement;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  const hero=document.querySelector('#home');
  const stage=document.querySelector('.hero-visual');
  const process=document.querySelector('.process-grid');
  const world=document.querySelector('.parallax-world');
  const layers=[...document.querySelectorAll('.depth-layer')];
  const sections=[...document.querySelectorAll('main > section[id]')];
  const project=document.querySelector('.featured-project');
  const devices=project?.querySelector('.project-devices');
  const contactPanel=document.querySelector('.contact-panel');
  const heroContent=hero.querySelector('.hero-content'),heroBottom=hero.querySelector('.hero-bottom');
  const atmosphere=stage.querySelector('.cube-atmosphere'),glow=stage.querySelector('.cube-glow');
  const lensOne=stage.querySelector('.lens-ring-one'),lensTwo=stage.querySelector('.lens-ring-two'),scan=stage.querySelector('.scan-plane'),flash=stage.querySelector('.assembly-flash');
  const sun=world.querySelector('.depth-sun'),ribbons=world.querySelector('.depth-ribbons');
  const dust=document.querySelector('.scene-dust');
  const ctx=dust.getContext('2d',{alpha:true});
  const fragments=document.querySelector('.depth-fragments');
  const styleCache=new WeakMap();
  function setStyle(element,name,value){
    let values=styleCache.get(element);
    if(!values){values=new Map();styleCache.set(element,values);}
    if(values.get(name)===value)return;
    values.set(name,value);element.style.setProperty(name,value);
  }
  const pieces=[];
  const locations=[[2,17,64],[98,5,82],[97,68,116],[1,78,92],[10,94,42],[90,94,48],[3,48,34],[98,39,32]];
  locations.forEach(([x,y,size],i)=>{
    const item=document.createElement('span');item.className='depth-fragment';
    item.style.setProperty('--size',size+'px');
    item.style.setProperty('--fragment-alpha',i%3===0?'.6':'.32');
    item.style.setProperty('--fragment-blur',i%3===0?'1px':'0px');
    item.style.left=x+'%';item.style.top=y+'%';
    const solid=document.createElement('span');solid.className='fragment-solid';
    for(let f=0;f<6;f++){const face=document.createElement('i');face.className='fragment-face';solid.append(face);}
    item.append(solid);fragments.append(item);pieces.push({item,solid,x,y,i});
  });
  let width=innerWidth,height=innerHeight,scroll=scrollY,targetScroll=scrollY;
  let mouseX=0,mouseY=0,targetX=0,targetY=0,frame=0,maxScroll=1;
  let chapterPositions=[],assemblyRange=1,projectBox=null,heroBox=null,layerGeometry=[],nearHeight=1,measureFrame=0;
  let dustColor='#d8f58c';
  const stars=Array.from({length:48},(_,i)=>({x:((i*71+23)%997)/997,y:((i*137+41)%991)/991,r:i%9===0?1.7:.6+(i%3)*.25}));
  function colors(){dustColor=getComputedStyle(root).getPropertyValue('--scene-a').trim();}
  function measure(){
    measureFrame=0;
    width=innerWidth;height=innerHeight;maxScroll=Math.max(1,document.documentElement.scrollHeight-height);
    layerGeometry=layers.map(layer=>{const style=getComputedStyle(layer);return {z:style.getPropertyValue('--plane-z').trim()||'0px',base:parseFloat(style.getPropertyValue('--plane-base'))||1};});
    nearHeight=layers[2].clientHeight;
    const heroRect=hero.getBoundingClientRect();heroBox={top:heroRect.top+scrollY,height:heroRect.height};
    // Кубик находится в своём блоке на всех экранах. Позиция больше не пересчитывается.
    const stageTop=stage.getBoundingClientRect().top+scrollY;
    assemblyRange=width<=900
      ? Math.max(350,stageTop+stage.clientHeight*.85-height*.4)
      : Math.max(250,hero.offsetTop+hero.offsetHeight-height+50);
    const dpr=Math.min(devicePixelRatio||1,1.5);
    const pixelWidth=Math.round(width*dpr),pixelHeight=Math.round(height*dpr);
    if(dust.width!==pixelWidth||dust.height!==pixelHeight){dust.width=pixelWidth;dust.height=pixelHeight;}
    ctx?.setTransform(dpr,0,0,dpr,0,0);
    chapterPositions=sections.map(section=>{const r=section.getBoundingClientRect();return {section,heading:section.querySelector('.section-heading h2'),top:r.top+scrollY,height:r.height};});
    if(project){const r=project.getBoundingClientRect();projectBox={top:r.top+scrollY,height:r.height};}
    const processTop=process?process.getBoundingClientRect().top+scrollY:0;
    dispatchEvent(new CustomEvent('vorby-layout-measured',{detail:{maxScroll,assemblyRange,processTop}}));
    colors();queue();
  }
  function queueMeasure(){if(!measureFrame&&!document.hidden)measureFrame=requestAnimationFrame(measure);}
  function drawDust(progress){
    if(!ctx||reduced.matches)return;
    ctx.clearRect(0,0,width,height);ctx.fillStyle=dustColor;ctx.strokeStyle=dustColor;
    const count=width<=900?18:48;
    for(let i=0;i<count;i++){
      const star=stars[i];
      star.drawX=star.x*width+mouseX*star.r*15+Math.sin(progress*5+star.x*6)*18;
      star.drawY=((star.y*height-progress*(70+star.r*90))%height+height)%height;
    }
    // Те же точки и яркость, но три пути вместо отдельного fill/stroke для каждой частицы.
    for(let group=0;group<2;group++) {
      ctx.globalAlpha=group?.5:.22;ctx.beginPath();
      for(let i=0;i<count;i++){const s=stars[i];if((s.r>1.5)!==Boolean(group))continue;ctx.moveTo(s.drawX+s.r,s.drawY);ctx.arc(s.drawX,s.drawY,s.r,0,Math.PI*2);}
      ctx.fill();
    }
    ctx.globalAlpha=.14;ctx.beginPath();
    for(let i=0;i<count;i++){const s=stars[i];if(s.r<=1.5)continue;ctx.moveTo(s.drawX-6,s.drawY);ctx.lineTo(s.drawX+6,s.drawY);ctx.moveTo(s.drawX,s.drawY-6);ctx.lineTo(s.drawX,s.drawY+6);}
    ctx.stroke();
    ctx.globalAlpha=1;
  }
  function paint(time){
    frame=0;
    if(document.hidden)return;
    const still=reduced.matches;
    const mobile=width<=900;
    const steps=lastPaint?Math.min(4,(time-lastPaint)/(1000/60)):1;
    lastPaint=time;
    scroll=still||mobile?targetScroll:mix(scroll,targetScroll,1-Math.pow(.86,steps));
    mouseX=still?0:mix(mouseX,targetX,1-Math.pow(.915,steps));mouseY=still?0:mix(mouseY,targetY,1-Math.pow(.915,steps));
    const progress=clamp(scroll/maxScroll);
    const range=assemblyRange;
    const phase=scroll/range;
    const assembly=clamp(phase);
    if(targetScroll<heroBox.top+heroBox.height+80) {
      const heroProgress=mobile?0:Number(assembly.toFixed(4));
      const opacity=still||mobile?'1':(1-smooth((phase-.78)/.48)).toFixed(3);
      setStyle(heroContent,'opacity',opacity);setStyle(heroBottom,'opacity',opacity);
      setStyle(heroContent,'transform',still||mobile?'none':'translateY('+(-smooth((phase-.78)/.48)*30).toFixed(2)+'px)');
      setStyle(atmosphere,'transform','perspective(800px) rotateX('+heroProgress*10+'deg) rotateZ('+heroProgress*48+'deg)');
      setStyle(glow,'transform','scale('+(1+heroProgress*.16)+')');
      setStyle(lensOne,'transform','rotateX(60deg) rotateZ('+heroProgress*180+'deg)');
      setStyle(lensTwo,'transform','rotateY(60deg) rotateZ('+heroProgress*-160+'deg)');
      setStyle(scan,'transform','translateY('+heroProgress*-55+'px)');
      setStyle(flash,'--assembly-flash',still||mobile?'0':(Math.exp(-Math.pow((assembly-.92)/.052,2))*.35).toFixed(3));
    }
    layers.forEach((layer,i)=>{
      const pose=planeMotion(scroll/height,i,width,height,mouseX,mouseY),weight=mobile?.35:1;
      const geometry=layerGeometry[i];
      const x=still?'0':(pose.x*weight).toFixed(2),y=still?'0':(pose.y*weight).toFixed(2);
      const turn=still?'0':(pose.turn*weight).toFixed(3),scale=still?1:Number(mix(1,pose.scale,weight).toFixed(4));
      setStyle(layer,'transform','translate3d('+x+'px,'+y+'px,'+geometry.z+') rotate('+turn+'deg) scale('+(geometry.base*scale)+')');
    });
    setStyle(sun,'transform','scale('+(still?'1':(1+Math.sin(progress*Math.PI)*.25).toFixed(4))+')');
    if(ribbons)setStyle(ribbons,'transform','rotate('+(still?'0':(progress*24).toFixed(3))+'deg) scale(1.05)');
    if(!mobile&&!still)pieces.forEach(({item,solid,i})=>{
      setStyle(item,'transform','translate3d(0,'+(-progress*(22+i*2)*nearHeight/100)+'px,0)');
      setStyle(solid,'transform','rotateX('+(26+i*27+progress*105).toFixed(2)+'deg) rotateY('+(32+i*33-progress*170).toFixed(2)+'deg) rotateZ('+(i*11+progress*55).toFixed(2)+'deg)');
    });
    chapterPositions.forEach(({section,heading,top,height:sectionHeight})=>{
      const local=clamp((height-(top-targetScroll))/(height+sectionHeight));
      if(heading)setStyle(heading,'transform',still?'none':'translateY('+((.5-local)*32).toFixed(2)+'px)');
      if(section.id==='contact')setStyle(contactPanel,'--contact-glow',still?'1':(1+local*.16).toFixed(3));
    });
    if(projectBox){const p=clamp((height-(projectBox.top-targetScroll))/(height+projectBox.height));setStyle(devices,'transform',still||mobile?'none':'translateY('+((.5-p)*45).toFixed(2)+'px) rotate('+((.5-p)*3).toFixed(3)+'deg)');}
    drawDust(progress);
    if(!still&&(Math.abs(scroll-targetScroll)>.08||Math.abs(mouseX-targetX)>.001||Math.abs(mouseY-targetY)>.001))queue();
    else lastPaint=0;
  }
  let lastPaint=0;
  function queue(){if(!frame&&!document.hidden)frame=requestAnimationFrame(paint);}
  addEventListener('scroll',()=>{targetScroll=scrollY;queue();},{passive:true});
  addEventListener('pointermove',event=>{if(reduced.matches||!fine.matches||width<=900)return;targetX=event.clientX/width-.5;targetY=event.clientY/height-.5;queue();},{passive:true});
  document.addEventListener('pointerleave',()=>{targetX=targetY=0;queue();});
  addEventListener('resize',queueMeasure);
  addEventListener('pageshow',()=>{scroll=targetScroll=scrollY;measure();});
  addEventListener('vorby-theme-change',queueMeasure);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){if(frame)cancelAnimationFrame(frame);if(measureFrame)cancelAnimationFrame(measureFrame);frame=measureFrame=0;lastPaint=0;}else{scroll=targetScroll=scrollY;queueMeasure();}});
  reduced.addEventListener('change',()=>{root.classList.toggle('cinema-running',!reduced.matches);queueMeasure();});
  if(window.ResizeObserver)new ResizeObserver(queueMeasure).observe(document.querySelector('main'));
  root.classList.toggle('cinema-running',!reduced.matches);
  measure();
})();
