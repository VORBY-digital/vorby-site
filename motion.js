/* Эффекты VORBY. Позиция страницы не меняется: движутся только декоративные элементы. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const hero = document.querySelector('.hero');
  const process = document.querySelector('.process-grid');
  const project = document.querySelector('.featured-project');
  const capture = document.querySelector('.site-capture');
  const viewport = document.querySelector('.capture-viewport');
  const pause = document.querySelector('#preview-control');
  const cards = [...document.querySelectorAll('.service-card')];
  const hasVoyager=Boolean(document.querySelector('.cube-voyager'));
  const header=document.querySelector('.header');
  let processTop=process?process.getBoundingClientRect().top+scrollY:0;
  let previousProcess='',previousScrolled=null;

  document.querySelectorAll('.service-grid, .work-grid, .process-grid').forEach(grid => {
    [...grid.children].forEach((child, index) => child.style.setProperty('--reveal-delay', Math.min(index * 90, 270) + 'ms'));
  });

  let raf = 0;
  const clamp = value => Math.max(0, Math.min(1, value));
  function updateScroll() {
    raf = 0;
    if(!hasVoyager){const rect=hero.getBoundingClientRect();const progress=reduced.matches?0:clamp(-rect.top/Math.max(1,rect.height*.8));hero.style.setProperty('--hero-progress',progress.toFixed(4));}
    if (process) {
      const value=reduced.matches?'1':clamp((innerHeight*.9-(processTop-scrollY))/(innerHeight*.6)).toFixed(4);
      if(value!==previousProcess){process.style.setProperty('--process-progress',value);previousProcess=value;}
    }
    const scrolled=scrollY>24;
    if(scrolled!==previousScrolled){header.classList.toggle('scrolled',scrolled);previousScrolled=scrolled;}
  }
  function queueScroll() {if (!raf) raf = requestAnimationFrame(updateScroll);}
  addEventListener('scroll', queueScroll, {passive:true});
  addEventListener('resize',()=>{if(process)processTop=process.getBoundingClientRect().top+scrollY;queueScroll();});
  addEventListener('pageshow', queueScroll);
  addEventListener('vorby-layout-measured',event=>{processTop=event.detail.processTop;queueScroll();});

  function measureCapture() {
    if (!capture?.complete || !capture.naturalWidth) return;
    // clientWidth не включает перспективу устройства: экран не должен прокручиваться за конец снимка.
    const shift = Math.max(0, capture.clientWidth * capture.naturalHeight / capture.naturalWidth - viewport.clientHeight);
    project.style.setProperty('--capture-shift', -shift + 'px');
    project.style.setProperty('--capture-duration', Math.max(24, Math.min(48, shift / 90)) + 's');
  }
  capture?.addEventListener('load', measureCapture);
  if (window.ResizeObserver && viewport) new ResizeObserver(measureCapture).observe(viewport);
  else addEventListener('resize', measureCapture);
  measureCapture();
  pause?.addEventListener('click', () => {
    const paused = project.classList.toggle('preview-paused');
    pause.setAttribute('aria-pressed', String(paused));
    pause.setAttribute('aria-label', paused ? 'Продолжить прокрутку примера' : 'Приостановить прокрутку примера');
    pause.querySelector('.preview-control-label').textContent = paused ? 'Продолжить превью' : 'Остановить превью';
    pause.querySelector('.preview-control-symbol').textContent = paused ? '▷' : 'Ⅱ';
  });

  if (window.IntersectionObserver) {
    const visible = new Set();
    const previews = [...document.querySelectorAll('.live-preview-card, .featured-project')];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target);
        entry.target.classList.toggle('is-inview', entry.isIntersecting && !document.hidden && !reduced.matches);
      });
    }, {threshold:.12});
    previews.forEach(card => observer.observe(card));
    const syncPreviews = () => previews.forEach(card => card.classList.toggle('is-inview', visible.has(card) && !document.hidden && !reduced.matches));
    document.addEventListener('visibilitychange', syncPreviews);
    reduced.addEventListener('change', syncPreviews);

    const ornaments=[...document.querySelectorAll('.hero-visual,.marquee')],activeOrnaments=new Set();
    const syncOrnaments=()=>ornaments.forEach(element=>element.classList.toggle('effects-paused',document.hidden||!activeOrnaments.has(element)));
    const ornamentObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{entry.isIntersecting?activeOrnaments.add(entry.target):activeOrnaments.delete(entry.target);});syncOrnaments();},{rootMargin:'80px 0px'});
    ornaments.forEach(element=>ornamentObserver.observe(element));
    document.addEventListener('visibilitychange',syncOrnaments);

    const sections = [...document.querySelectorAll('main > section[id]')];
    const links = [...document.querySelectorAll('#navigation a')];
    const positions = new Map();
    // Один observer для всех секций меню.
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => positions.set(entry.target.id, entry.isIntersecting));
      const current = sections.find(section => positions.get(section.id));
      links.forEach(link => {
        const active = current && link.hash === '#' + current.id;
        link.classList.toggle('active', Boolean(active));
        active ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current');
      });
    }, {rootMargin:'-15% 0px -60% 0px', threshold:0});
    sections.forEach(section => navObserver.observe(section));
  }

  cards.forEach(card => {
    let pointerFrame = 0;
    let x = 0, y = 0;
    let width=1,height=1;
    card.addEventListener('pointermove', event => {
      if (reduced.matches || !finePointer.matches) return;
      const rect = card.getBoundingClientRect();
      width=rect.width;height=rect.height;
      x = event.clientX - rect.left; y = event.clientY - rect.top;
      if (!pointerFrame) pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        card.style.setProperty('--pointer-x', x + 'px');
        card.style.setProperty('--pointer-y', y + 'px');
        card.style.setProperty('--card-rx',((.5-y/height)*5).toFixed(2)+'deg');
        card.style.setProperty('--card-ry',((x/width-.5)*6).toFixed(2)+'deg');
      });
    });
    card.addEventListener('pointerleave',()=>{if(pointerFrame)cancelAnimationFrame(pointerFrame);pointerFrame=0;card.style.setProperty('--card-rx','0deg');card.style.setProperty('--card-ry','0deg');});
  });
  reduced.addEventListener('change', () => {
    document.documentElement.classList.toggle('js-motion', !reduced.matches);
    if (reduced.matches) document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));
    queueScroll();
  });
  updateScroll();
})();
