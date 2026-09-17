/*
 * VORBY — чистый JavaScript, без библиотек, сервера и базы данных.
 * Стартовый прайс для небольших проектов. Обоснование — в PRICING.md.
 * В telegramUsername укажите свой username без @ (например, 'vorby_design').
 * Оставьте пустую строку, пока контакт не готов: чужая ссылка не появится.
 */
const SITE_CONFIG = {
  brand: 'VORBY',
  telegramUsername: '',
  projects: {
    site: {
      name: 'Сайт-визитка', label: 'Сайт', baseLabel: 'Создание сайта', price: 6000,
      description: 'Одностраничный сайт до 5 блоков с базовым оформлением, по готовым текстам и изображениям. Мобильная версия, кнопки связи, иконка, публикация, исходники и два раунда правок включены.',
      extras: [
        {id:'domain', title:'Подключение домена', description:'Настройка вашего адреса. Покупка и продление домена отдельно.', price:500},
        {id:'custom-design', title:'Индивидуальный дизайн', description:'Макет в Figma: оформление, цвета и шрифты под вашу задачу.', price:3500},
        {id:'texts', title:'Помощь с текстами и структурой', description:'До 5 блоков и 3 000 знаков по информации о вашем деле.', price:1500},
        {id:'images', title:'Подбор изображений', description:'До 5 изображений. Покупка платных фотографий отдельно.', price:500},
        {id:'extra-block', title:'Дополнительный блок', description:'Один простой блок сверх пяти включённых: отзывы или прайс.', price:800},
        {id:'instruction', title:'Инструкция по обновлению', description:'Как самостоятельно заменить текст и фотографии в файлах.', price:500},
        {id:'maintenance', title:'Поддержка на 30 дней', description:'До 3 небольших обновлений текстов или фотографий.', price:2000},
        {id:'revision', title:'Дополнительный раунд правок', description:'Ещё один список правок в рамках согласованной структуры.', price:1000}
      ]
    },
    design: {
      name: 'Дизайн', label: 'Дизайн', baseLabel: 'Один баннер или креатив', price:1000,
      description: 'Один баннер или рекламный креатив по вашему содержанию. Подбор оформления, цветов и шрифтов, два раунда правок и готовый файл включены.',
      extras: [
        {id:'figma', title:'Макет сайта в Figma', description:'Одностраничный сайт до 5 блоков, версии для компьютера и телефона.', price:4000},
        {id:'logo', title:'Простой логотип или знак', description:'Один концепт простого знака. Полный фирменный стиль отдельно.', price:1500},
        {id:'social', title:'Оформление соцсетей', description:'Обложка и аватар для одного профиля.', price:1500},
        {id:'slides', title:'Дизайн презентации', description:'До 5 слайдов по готовому тексту.', price:2500},
        {id:'print', title:'Меню, прайс-лист или визитка', description:'Один макет до 2 сторон по готовому тексту. Печать отдельно.', price:1000},
        {id:'style', title:'Палитра и шрифтовая пара', description:'Небольшая памятка для единого оформления ваших материалов.', price:1000},
        {id:'redesign', title:'Концепт редизайна', description:'Новое оформление одного экрана существующего сайта.', price:2000}
      ]
    },
    support: {
      name: 'Доработки сайта', label: 'Доработки', baseLabel: 'Обновление контента', price:1000,
      description: 'Замена текстов и до 5 фотографий на существующей статичной странице. Перед началом посмотрю исходные файлы и уточню возможность доработки.',
      extras: [
        {id:'domain', title:'Подключение домена', description:'Настройка адреса сайта. Сам домен оплачивается отдельно.', price:500},
        {id:'new-block', title:'Новый блок', description:'Один простой блок в оформлении существующего сайта.', price:1200},
        {id:'restyle', title:'Изменение оформления', description:'Цвета, шрифты и отступы одного экрана.', price:1500},
        {id:'fix', title:'Исправление небольшой ошибки', description:'Одна проблема с отображением или кнопкой после оценки исходников.', price:1000},
        {id:'instruction', title:'Инструкция по обновлению', description:'Памятка для самостоятельной замены контента.', price:500},
        {id:'maintenance', title:'Поддержка на 30 дней', description:'До 3 небольших обновлений текстов или фотографий.', price:2000}
      ]
    }
  }
};

(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const money = value => new Intl.NumberFormat('ru-RU', {maximumFractionDigits:0}).format(value) + ' ₽';
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const state = {project:'site', selections:{site:new Set(), design:new Set(), support:new Set()}};
  let toastTimer;

  // Все суммы берутся из одного объекта конфигурации.
  function getEstimate() {
    const project = SITE_CONFIG.projects[state.project];
    const extras = project.extras.filter(item => state.selections[state.project].has(item.id));
    return {project, extras, total:project.price + extras.reduce((sum,item) => sum + item.price, 0)};
  }

  function estimateText() {
    const {project, extras, total} = getEstimate();
    return ['Привет! Хочу обсудить проект с ' + SITE_CONFIG.brand + '.', '',
      'Задача: ' + project.name, project.baseLabel + ': ' + money(project.price),
      ...extras.map(item => '+ ' + item.title + ': ' + money(item.price)), '',
      'Примерная стоимость: ' + money(total),
      'Точная цена — после обсуждения объёма и сложности.', '',
      'О моей задаче:'].join('\n');
  }

  function telegramURL(withEstimate = false) {
    const username = SITE_CONFIG.telegramUsername.trim().replace(/^@/, '');
    if (!/^[a-zA-Z0-9_]{5,32}$/.test(username)) return '';
    return 'https://t.me/' + username + (withEstimate ? '?text=' + encodeURIComponent(estimateText()) : '');
  }

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 4000);
  }

  function renderEstimate() {
    const {project, extras, total} = getEstimate();
    $('#estimate-name').textContent = project.name;
    $('#estimate-total').textContent = money(total);
    $('#mobile-estimate-total').textContent = money(total);
    const lines = [{title:project.baseLabel, price:project.price}, ...extras];
    $('#estimate-lines').replaceChildren(...lines.map(item => {
      const row = document.createElement('div');
      const title = document.createElement('span');
      const price = document.createElement('span');
      title.textContent = item.title;
      price.textContent = money(item.price);
      row.append(title, price);
      return row;
    }));
    const contact = $('#estimate-contact');
    const url = telegramURL(true);
    contact.href = url || '#contact';
    if (url) {contact.target = '_blank'; contact.rel = 'noopener noreferrer';}
    else {contact.removeAttribute('target'); contact.removeAttribute('rel');}
    $('#estimate-text').value = estimateText();
  }

  function renderExtras() {
    const project = SITE_CONFIG.projects[state.project];
    $('#base-description').textContent = project.description;
    $('#extras-list').replaceChildren(...project.extras.map(item => {
      const label = document.createElement('label');
      label.className = 'extra-option';
      const input = document.createElement('input');
      input.type = 'checkbox'; input.value = item.id;
      input.checked = state.selections[state.project].has(item.id);
      const info = document.createElement('span'); info.className = 'extra-info';
      const title = document.createElement('span'); title.className = 'extra-title'; title.textContent = item.title;
      const description = document.createElement('span'); description.className = 'extra-description'; description.textContent = item.description;
      const price = document.createElement('span'); price.className = 'extra-price'; price.textContent = '+ ' + money(item.price);
      info.append(title, description); label.append(input, info, price);
      input.addEventListener('change', () => {
        const selected = state.selections[state.project];
        input.checked ? selected.add(item.id) : selected.delete(item.id);
        renderEstimate();
      });
      return label;
    }));
    $$('input[name="project"]').forEach(input => {input.checked = input.value === state.project;});
    renderEstimate();
  }

  function setProject(key) {
    if (!Object.hasOwn(SITE_CONFIG.projects, key)) return;
    state.project = key;
    renderExtras();
  }

  $$('[data-brand]').forEach(element => {element.textContent = SITE_CONFIG.brand + ' / digital';});
  $$('[data-owner]').forEach(element => {element.textContent = SITE_CONFIG.brand;});
  document.title = SITE_CONFIG.brand + ' — сайты и дизайн';
  $('#year').textContent = new Date().getFullYear();
  $$('[data-service-price]').forEach(element => {element.textContent = money(SITE_CONFIG.projects[element.dataset.servicePrice].price);});
  $$('input[name="project"]').forEach(input => {
    const project = SITE_CONFIG.projects[input.value];
    input.nextElementSibling.lastElementChild.textContent = 'от ' + money(project.price);
    input.addEventListener('change', () => setProject(input.value));
  });
  $$('[data-preset]').forEach(link => link.addEventListener('click', () => setProject(link.dataset.preset)));
  $('#reset-estimate').addEventListener('click', () => {
    Object.values(state.selections).forEach(selected => selected.clear());
    setProject('site');
    showToast('Расчёт сброшен');
  });

  // Копирование работает на HTTPS и localhost; для обычного файла есть запасной вариант.
  $('#copy-estimate').addEventListener('click', async () => {
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(estimateText());
      showToast('Расчёт скопирован — можно отправить его вместе с описанием задачи');
    } catch {
      $('#estimate-text').value = estimateText();
      $('#copy-dialog').showModal();
      $('#estimate-text').focus(); $('#estimate-text').select();
    }
  });
  $('#close-copy-dialog').addEventListener('click', () => $('#copy-dialog').close());
  $('#select-estimate-text').addEventListener('click', () => {$('#estimate-text').focus(); $('#estimate-text').select();});
  $('#copy-dialog').addEventListener('click', event => {
    if (event.target !== $('#copy-dialog')) return;
    const rect = $('#copy-dialog').getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) $('#copy-dialog').close();
  });

  const contactURL = telegramURL();
  if (contactURL) {
    $('#telegram-link').href = contactURL;
    $('#telegram-link').target = '_blank'; $('#telegram-link').rel = 'noopener noreferrer';
    $('#contact-note').textContent = '@' + SITE_CONFIG.telegramUsername.trim().replace(/^@/, '');
  } else {
    $('#telegram-link').addEventListener('click', event => {
      event.preventDefault();
      showToast('Контакт для заявок скоро появится. Пока можно скопировать расчёт.');
    });
  }

  // Мобильное меню: закрывается при переходе, Escape и возврате на широкий экран.
  const menu = $('.menu-button');
  const nav = $('#navigation');
  function closeMenu() {menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label','Открыть меню'); nav.classList.remove('open');}
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    nav.classList.toggle('open', open);
  });
  $$('#navigation a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {if (event.key === 'Escape' && nav.classList.contains('open')) {closeMenu(); menu.focus();}});
  window.matchMedia('(min-width: 801px)').addEventListener('change', event => {if (event.matches) closeMenu();});
  document.addEventListener('click', event => {if (!event.target.closest('.header')) closeMenu();});

  // Плавное появление блоков. Без JavaScript всё содержимое остаётся видимым.
  if ('IntersectionObserver' in window && !motion.matches) {
    document.documentElement.classList.add('js-motion');
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {if (entry.isIntersecting) {entry.target.classList.add('visible'); revealObserver.unobserve(entry.target);}});
    }, {threshold:.08});
    $$('.reveal').forEach(element => revealObserver.observe(element));

    // Мини-сайты начинают прокрутку, когда посетитель дошёл до примеров.
    const previewObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('preview-active');
        previewObserver.unobserve(entry.target);
      });
    }, {threshold:.45});
    $$('.live-preview-card').forEach(card => previewObserver.observe(card));
  }

  const progress = $('.page-progress');
  let scrollScheduled = false;
  function updateProgress() {
    const available = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = 'scaleX(' + (available > 0 ? Math.min(1,window.scrollY / available) : 0) + ')';
    scrollScheduled = false;
  }
  window.addEventListener('scroll', () => {if (!scrollScheduled) {scrollScheduled = true; requestAnimationFrame(updateProgress);}}, {passive:true});
  window.addEventListener('resize', updateProgress);
  updateProgress();

  // Меняющийся текст без сдвига соседних блоков.
  const word = $('#rotating-word');
  const words = ['сайт.', 'дизайн.'];
  let wordIndex = 0;
  let wordTimer;
  function rotateWord() {
    if (motion.matches || document.hidden) return;
    word.className = 'word-out';
    wordTimer = setTimeout(() => {wordIndex = (wordIndex + 1) % words.length; word.textContent = words[wordIndex]; word.className = 'word-in';}, 250);
  }
  const wordInterval = setInterval(rotateWord, 3800);
  motion.addEventListener('change', () => {if (motion.matches) {clearTimeout(wordTimer); word.className = ''; word.textContent = words[0];}});

  // На телефоне сумма остаётся под рукой, пока посетитель выбирает услуги.
  if ('IntersectionObserver' in window) {
    let calculatorVisible = false, totalVisible = false;
    const updateMobileEstimate = () => $('#mobile-estimate').classList.toggle('visible', calculatorVisible && !totalVisible);
    new IntersectionObserver(entries => {calculatorVisible = entries[0].isIntersecting; updateMobileEstimate();}).observe($('#calculator'));
    new IntersectionObserver(entries => {totalVisible = entries[0].isIntersecting; updateMobileEstimate();}).observe($('#estimate-total'));
  }

  // Запуск основного интерфейса.
  renderExtras();
  window.addEventListener('pagehide', () => {clearInterval(wordInterval); clearTimeout(wordTimer); clearTimeout(toastTimer);});
})();
