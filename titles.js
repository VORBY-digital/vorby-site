/* Каскадные заголовки. Текст и смысловая разметка сохраняются; без JS всё видно. */
(() => {
  'use strict';
  const tokens=text=>text.match(/\s+|\S+/gu)||[];
  if(typeof module!=='undefined'&&module.exports)module.exports={tokens};
  if(typeof document==='undefined')return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const headings=[...document.querySelectorAll('h1,.section-heading h2,.faq-heading h2,.contact-panel h2,.featured-project h3')];
  function label(heading){
    const copy=heading.cloneNode(true);
    copy.querySelectorAll('br').forEach(br=>br.replaceWith(document.createTextNode(' ')));
    copy.querySelectorAll('.text-caret').forEach(caret=>caret.remove());
    heading.setAttribute('aria-label',copy.textContent.replace(/\s+/g,' ').trim());
  }
  headings.forEach(heading=>{
    let order=0;
    const walker=document.createTreeWalker(heading,NodeFilter.SHOW_TEXT,{acceptNode:node=>node.parentElement.closest('.rotating-line')||!node.textContent.trim()?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      const fragment=document.createDocumentFragment();
      tokens(node.textContent).forEach(part=>{
        if(!part.trim()){fragment.append(document.createTextNode(part));return;}
        const word=document.createElement('span');word.className='title-word';word.setAttribute('aria-hidden','true');
        for(const character of part){
          const letter=document.createElement('span');letter.className='title-letter';letter.textContent=character;
          letter.style.setProperty('--letter-delay',Math.min(order++*18,430)+'ms');word.append(letter);
        }
        fragment.append(word);
      });
      node.replaceWith(fragment);
    });
    heading.classList.add('motion-title');
    heading.closest('.section-heading,.faq-heading')?.classList.add('title-group');
    label(heading);
  });
  const rotating=document.querySelector('#rotating-word');
  if(rotating){rotating.closest('.rotating-line').setAttribute('aria-hidden','true');new MutationObserver(()=>label(rotating.closest('h1'))).observe(rotating,{childList:true,characterData:true,subtree:true});}
  function setVisible(heading,visible){
    heading.classList.toggle('title-visible',visible);
    heading.closest('.section-heading,.faq-heading')?.classList.toggle('heading-visible',visible);
  }
  let observer;
  if('IntersectionObserver' in window){
    observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(reduced.matches||entry.isIntersecting)setVisible(entry.target,true);
        else if(entry.boundingClientRect.top>innerHeight||entry.boundingClientRect.bottom<0)setVisible(entry.target,false);
      });
    },{rootMargin:'0px 0px -8% 0px',threshold:0});
    headings.forEach(heading=>observer.observe(heading));
  }
  function sync(){
    document.documentElement.classList.toggle('title-motion',!reduced.matches);
    headings.forEach(heading=>{const r=heading.getBoundingClientRect();setVisible(heading,reduced.matches||!observer||(r.top<innerHeight*.92&&r.bottom>0));});
  }
  reduced.addEventListener('change',sync);
  addEventListener('pageshow',sync);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync();});
  requestAnimationFrame(sync);
})();
