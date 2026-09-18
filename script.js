/*
 * VORBY — чистый JavaScript, без библиотек, сервера и базы данных.
 * Стартовый прайс для небольших проектов. Обоснование — в PRICING.md.
 * В telegramUsername укажите свой username без @ (например, 'vorby_design').
 * Для номера телефона измените ссылку tel: в контактном блоке index.html.
 */
const SITE_CONFIG = {
  brand: 'VORBY',
  telegramUsername: 'A_Lioznov',
  projects: {
    site: {
      name: 'Сайт-визитка', label: 'Сайт', baseLabel: 'Создание сайта', price: 6000,
      extrasLegend: 'Что добавить к сайту?',
      description: 'Одностраничный сайт до 5 блоков с базовым оформлением, по готовым текстам и изображениям. Мобильная версия, кнопки связи, иконка, публикация, исходники и два раунда правок включены.',
      details: {
        includes: 'Одна страница до 5 блоков, адаптация под телефон, кнопки связи, иконка сайта, публикация на GitHub Pages, исходные файлы и два раунда правок до запуска.',
        required: 'Готовые тексты, фотографии, контакты, список услуг и примеры сайтов, которые вам нравятся.',
        note: 'Не входят интернет-магазин, регистрация, база данных, SEO-продвижение, написание текстов и серверная логика.'
      },
      extras: [
        {id:'domain', title:'Подключение домена', description:'Настрою адрес сайта и HTTPS.', price:500, details:{includes:'Привязка купленного домена к сайту, настройка DNS и проверка защищённого подключения HTTPS.', required:'Домен, купленный и оформленный на вас, плюс доступ к кабинету регистратора.', note:'Покупка и ежегодное продление домена оплачиваются вами напрямую регистратору.'}},
        {id:'custom-design', title:'Индивидуальный дизайн', description:'Цвета, шрифты и оформление под вашу задачу.', price:3500, details:{includes:'Индивидуальное оформление страницы, палитра, шрифты, композиция блоков и адаптация выбранного стиля под телефон.', required:'Кратко расскажите о деле, целевой аудитории и пришлите 2–3 примера сайтов, которые вам близки.', note:'Палитра и шрифтовая пара уже входят в эту услугу. Полный брендбук и сложный логотип не входят.'}},
        {id:'images', title:'Подбор изображений', description:'До 5 подходящих бесплатных изображений.', price:500, details:{includes:'Поиск до 5 изображений в подходящем стиле на бесплатных фотостоках и подготовка их для сайта.', required:'Тема сайта, предпочтения по атмосфере и ваши собственные фото, если они есть.', note:'Платные лицензии, профессиональная ретушь и съёмка не входят.'}},
        {id:'instruction', title:'Инструкция по обновлению', description:'Памятка по замене контента в файлах.', price:500, details:{includes:'Понятная инструкция: где заменить текст, ссылку или фотографию в файлах сайта.', required:'Скажите, какие элементы вы хотите обновлять самостоятельно.', note:'Подходит для простых статичных сайтов без админ-панели.'}},
        {id:'maintenance', title:'Поддержка на 30 дней', description:'До 3 небольших обновлений после запуска.', price:2000, details:{includes:'До 3 небольших обновлений текста, фотографий, ссылок или контактов в течение 30 дней после публикации.', required:'Присылайте изменения одним сообщением: старый вариант, новый вариант и место на сайте.', note:'Новые блоки, новый дизайн и сложные изменения считаются по разделу «Доработки».'}}
      ]
    },
    design: {
      name: 'Дизайн', label: 'Дизайн', baseLabel: 'Выберите услугу', price:0, fromPrice:500,
      extrasLegend: 'Выберите услуги дизайна',
      description: 'Выберите одну услугу или несколько. Каждая считается отдельно — например, обычная презентация до 5 слайдов стоит 500 ₽, без доплаты за баннер.',
      details: {
        includes: 'Работа по готовым материалам клиента и согласованный итоговый файл в нужном формате.',
        required: 'Текст, размер или площадка, логотип и фотографии, если они должны быть использованы.',
        note: 'Если нужна сложная иллюстрация, большой объём текста или нестандартная анимация, сначала оценю задачу отдельно.'
      },
      extras: [
        {id:'banner', title:'Баннер или рекламный креатив', description:'Один баннер для сайта, рекламы или соцсетей.', price:1000, details:{includes:'Один готовый баннер в согласованном размере, оформление и два небольших раунда правок.', required:'Готовый текст, размер баннера, площадка размещения и логотип/фото при наличии.', note:'Не включает написание текста, покупку изображений и создание серии баннеров.'}},
        {id:'figma', title:'Макет сайта в Figma', description:'Страница до 5 блоков, компьютер и телефон.', price:4000, details:{includes:'Макет одностраничного сайта до 5 блоков, палитра, шрифты и версии для компьютера и телефона.', required:'Структура страницы, готовые тексты, материалы и примеры по стилю.', note:'Это дизайн-макет. Вёрстка и публикация сайта заказываются отдельно в разделе «Сайт».'}},
        {id:'logo', title:'Простой логотип или знак', description:'Текстовый знак или несложный символ.', price:1500, details:{includes:'Один выбранный вариант простого логотипа, PNG на прозрачном фоне и базовая версия для светлого/тёмного фона.', required:'Название, сфера деятельности, желаемое настроение и примеры того, что нравится.', note:'Не входит полноценный фирменный стиль, детальное исследование конкурентов и неограниченное число концептов.'}},
        {id:'social', title:'Оформление соцсетей', description:'Аватар, обложка и несколько шаблонов.', price:1500, details:{includes:'Аватар, обложка и до 3 простых шаблонов публикаций или сторис для одного профиля.', required:'Ссылка на профиль, логотип, тексты и размеры нужных площадок.', note:'Ведение аккаунта и подготовка регулярного контента не входят.'}},
        {id:'slides', title:'Презентация в PowerPoint', description:'До 5 слайдов по готовому тексту.', price:500, details:{includes:'Оформление до 5 слайдов в PowerPoint и готовый файл .pptx.', required:'Готовый текст по слайдам, логотип, изображения и порядок материалов.', note:'Дополнительный слайд — 100–150 ₽. Написание текста, сложная инфографика и анимация не входят.'}},
        {id:'print', title:'Макет для печати', description:'Визитка, листовка, меню или прайс.', price:1000, details:{includes:'Один макет до 2 сторон для визитки, листовки, небольшого меню или прайс-листа.', required:'Точный текст, размеры, логотип и требования типографии, если они уже известны.', note:'Печать и доставка оплачиваются отдельно.'}},
        {id:'style', title:'Палитра и шрифтовая пара', description:'Небольшая памятка по стилю материалов.', price:1000, details:{includes:'Основные и дополнительные цвета, шрифт заголовков и текста, короткая памятка по применению.', required:'Описание дела, целевая аудитория и примеры визуального направления.', note:'Для индивидуального дизайна сайта эта услуга уже включена и отдельно не добавляется.'}},
        {id:'redesign', title:'Рестайлинг одного экрана', description:'Обновление цветов, шрифтов и композиции.', price:2000, details:{includes:'Новый визуальный вариант одного экрана существующего сайта или макета.', required:'Ссылка или исходник, цель изменений и примеры желаемого результата.', note:'Полный редизайн сайта и разработка новых страниц оцениваются отдельно.'}}
      ]
    },
    support: {
      name: 'Доработки сайта', label: 'Доработки', baseLabel: 'Выберите доработки', price:0, fromPrice:150, minimum:300,
      extrasLegend: 'Что нужно изменить?',
      description: 'Выберите нужные изменения. Для чужого сайта сначала посмотрю исходники: иногда его устройство не позволяет внести правку быстро и безопасно.',
      details: {
        includes: 'Оценка выбранной задачи и внесение согласованных изменений в статичный сайт.',
        required: 'Ссылка на сайт, доступ к исходным файлам или репозиторию, а также точный список изменений.',
        note: 'Две правки до запуска нового сайта уже входят в разработку. Этот раздел — для изменений после публикации.'
      },
      extras: [
        {id:'text', title:'Замена небольшого текста', description:'До 3 коротких фрагментов текста.', price:200, details:{includes:'Замена до 3 коротких фрагментов: заголовка, описания, цены или подписи.', required:'Старый текст, новый текст и ссылка либо скриншот места на странице.', note:'Переписывание большой статьи, перевод или создание текста с нуля не входят.'}},
        {id:'photo', title:'Замена фотографии', description:'Одна подготовленная фотография.', price:200, details:{includes:'Замена одного изображения с подгонкой под существующий блок сайта.', required:'Готовое фото хорошего качества и ссылка или скриншот места замены.', note:'Профессиональная ретушь, покупка лицензии и создание изображений не входят.'}},
        {id:'link', title:'Изменение ссылки или контакта', description:'Одна ссылка, кнопка или контакт.', price:150, details:{includes:'Замена одной ссылки, номера телефона, почты, кнопки связи или ссылки на соцсеть.', required:'Новый адрес или контакт и место, где он должен появиться.', note:'Минимальная стоимость одного заказа на доработки — 300 ₽.'}},
        {id:'small-pack', title:'Пакет мелких изменений', description:'До 5 правок текста, фото или ссылок.', price:500, details:{includes:'До 5 небольших замен текста, фотографий, ссылок или контактов в одном сообщении.', required:'Единый список правок с понятным указанием, что и где меняется.', note:'Не включает перестройку блоков и изменение общего дизайна.'}},
        {id:'restyle', title:'Изменение оформления', description:'Цвета, шрифты или отступы одного экрана.', price:700, details:{includes:'Корректировка оформления одного экрана: цвет, шрифт, отступы или размер несложного элемента.', required:'Ссылка/скриншот текущего экрана и точное описание желаемого результата.', note:'Полная смена визуального стиля сайта считается как рестайлинг от 2 000 ₽.'}},
        {id:'new-block', title:'Новый блок', description:'Один простой блок в существующем стиле.', price:800, details:{includes:'Один новый простой блок в текущем стиле сайта: отзывы, прайс, вопросы или контакты.', required:'Готовый текст, материалы и пример того, как блок должен работать.', note:'Если нужен уникальный дизайн или сложная логика, стоимость начинается от 1 200 ₽.'}},
        {id:'fix', title:'Исправление проблемы', description:'Одна небольшая ошибка после оценки.', price:500, details:{includes:'Исправление одной проблемы с отображением, адаптацией или кнопкой после просмотра исходников.', required:'Ссылка, описание проблемы и скриншот/видео, если ошибка видна не всегда.', note:'Ошибки, допущенные мной при разработке, исправляю бесплатно в течение 14 дней после запуска.'}},
        {id:'instruction', title:'Инструкция по обновлению', description:'Памятка для самостоятельных изменений.', price:500, details:{includes:'Пошаговая памятка по самостоятельной замене контента в конкретном сайте.', required:'Доступ к исходным файлам и список элементов, которые вы хотите менять сами.', note:'Подходит для статичных сайтов без админ-панели.'}},
        {id:'maintenance', title:'Поддержка на 30 дней', description:'До 3 небольших обновлений за месяц.', price:2000, details:{includes:'До 3 небольших обновлений текста, фотографий, ссылок или контактов в течение 30 дней.', required:'Присылайте каждую задачу одним понятным сообщением с готовыми материалами.', note:'Новые блоки, редизайн и сложные функции считаются отдельно.'}}
      ]
    }
  }
};

(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const money = value => new Intl.NumberFormat('ru-RU', {maximumFractionDigits:0}).format(value) + ' ₽';
  const fromPrice = project => project.fromPrice ?? project.price;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const state = {project:'site', selections:{site:new Set(), design:new Set(), support:new Set()}};
  let toastTimer;
  let themeTimer;

  // Тема сохраняется только в браузере посетителя: сервер и аккаунты не нужны.
  const themeToggle = $('#theme-toggle');
  const themeLabel = $('#theme-toggle-label');
  const themeMeta = $('#theme-color');
  function applyTheme(theme, animate = false) {
    const root = document.documentElement;
    const isLight = theme === 'light';
    root.dataset.theme = isLight ? 'light' : 'dark';
    themeToggle.setAttribute('aria-pressed', String(isLight));
    themeToggle.setAttribute('aria-label', isLight ? 'Включить тёмную тему' : 'Включить светлую тему');
    themeToggle.title = isLight ? 'Включить тёмную тему' : 'Включить светлую тему';
    themeLabel.textContent = isLight ? 'Светлая' : 'Тёмная';
    themeMeta.setAttribute('content', isLight ? '#f6f4ee' : '#111211');
    try {localStorage.setItem('vorby-theme', isLight ? 'light' : 'dark');} catch {}
    if (!animate || motion.matches) return;
    root.classList.remove('theme-switching');
    void root.offsetWidth;
    root.classList.add('theme-switching');
    clearTimeout(themeTimer);
    themeTimer = setTimeout(() => root.classList.remove('theme-switching'), 700);
  }
  applyTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  themeToggle.addEventListener('click', () => {
    applyTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light', true);
  });

  // Все суммы берутся из одного объекта конфигурации.
  function getEstimate() {
    const project = SITE_CONFIG.projects[state.project];
    const extras = project.extras.filter(item => state.selections[state.project].has(item.id));
    const rawTotal = project.price + extras.reduce((sum,item) => sum + item.price, 0);
    const minimumFee = extras.length && project.minimum ? Math.max(project.minimum - rawTotal, 0) : 0;
    return {project, extras, minimumFee, total:rawTotal + minimumFee};
  }

  function estimateText() {
    const {project, extras, minimumFee, total} = getEstimate();
    const lines = ['Привет! Хочу обсудить проект с ' + SITE_CONFIG.brand + '.', '', 'Задача: ' + project.name];
    if (project.price) lines.push(project.baseLabel + ': ' + money(project.price));
    lines.push(...extras.map(item => '+ ' + item.title + ': ' + money(item.price)));
    if (minimumFee) lines.push('+ Минимальная стоимость заказа: ' + money(minimumFee));
    if (!project.price && !extras.length) lines.push('Нужно выбрать услугу в калькуляторе.');
    return [...lines,
      '', 'Примерная стоимость: ' + (total ? money(total) : 'уточняется'),
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
    const {project, extras, minimumFee, total} = getEstimate();
    $('#estimate-name').textContent = project.name;
    const totalText = total ? money(total) : 'Выберите услугу';
    $('#estimate-total').textContent = totalText;
    $('#estimate-total').classList.toggle('empty-total', !total);
    $('#mobile-estimate-total').textContent = total ? money(total) : '—';
    const lines = [...(project.price ? [{title:project.baseLabel, price:project.price}] : []), ...extras];
    if (minimumFee) lines.push({title:'Минимальная стоимость заказа', price:minimumFee});
    if (!lines.length) lines.push({title:'Выберите нужную услугу', price:null});
    $('#estimate-lines').replaceChildren(...lines.map(item => {
      const row = document.createElement('div');
      const title = document.createElement('span');
      const price = document.createElement('span');
      title.textContent = item.title;
      price.textContent = item.price === null ? '—' : money(item.price);
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

  function fillDetails(container, details) {
    container.replaceChildren(...[
      ['Входит:', details.includes],
      ['От заказчика:', details.required],
      ['Важно:', details.note]
    ].map(([label, text]) => {
      const paragraph = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = label + ' ';
      paragraph.append(strong, text);
      return paragraph;
    }));
  }

  function renderExtras() {
    const project = SITE_CONFIG.projects[state.project];
    $('#base-description').textContent = project.description;
    $('#extras-legend').replaceChildren(Object.assign(document.createElement('span'), {className:'step-badge', textContent:'2'}), ' ' + project.extrasLegend);
    const baseDetails = $('#base-details');
    const baseMore = $('#base-more');
    baseDetails.hidden = true;
    baseMore.setAttribute('aria-expanded', 'false');
    fillDetails(baseDetails, project.details);
    $('#extras-list').replaceChildren(...project.extras.map(item => {
      const option = document.createElement('div');
      option.className = 'extra-option';
      const label = document.createElement('label');
      label.className = 'extra-selector';
      const input = document.createElement('input');
      input.type = 'checkbox'; input.value = item.id;
      input.checked = state.selections[state.project].has(item.id);
      const info = document.createElement('span'); info.className = 'extra-info';
      const title = document.createElement('span'); title.className = 'extra-title'; title.textContent = item.title;
      const description = document.createElement('span'); description.className = 'extra-description'; description.textContent = item.description;
      const price = document.createElement('span'); price.className = 'extra-price'; price.textContent = '+ ' + money(item.price);
      const actions = document.createElement('span'); actions.className = 'extra-actions';
      const more = document.createElement('button');
      more.className = 'more-button'; more.type = 'button'; more.textContent = 'Подробнее ';
      const arrow = document.createElement('span'); arrow.setAttribute('aria-hidden', 'true'); arrow.textContent = '↓';
      more.append(arrow);
      const detail = document.createElement('div'); detail.className = 'service-details'; detail.hidden = true;
      const detailId = 'detail-' + state.project + '-' + item.id;
      detail.id = detailId; more.setAttribute('aria-controls', detailId); more.setAttribute('aria-expanded', 'false');
      fillDetails(detail, item.details);
      more.addEventListener('click', () => {
        const expanded = more.getAttribute('aria-expanded') === 'true';
        more.setAttribute('aria-expanded', String(!expanded));
        detail.hidden = expanded;
      });
      info.append(title, description); label.append(input, info); actions.append(price, more); option.append(label, actions, detail);
      input.addEventListener('change', () => {
        const selected = state.selections[state.project];
        input.checked ? selected.add(item.id) : selected.delete(item.id);
        if (state.project === 'support') {
          const singleEdits = ['text', 'photo', 'link'];
          if (item.id === 'small-pack' && input.checked) singleEdits.forEach(id => selected.delete(id));
          if (singleEdits.includes(item.id) && input.checked) selected.delete('small-pack');
          renderExtras();
          return;
        }
        renderEstimate();
      });
      return option;
    }));
    $$('input[name="project"]').forEach(input => {input.checked = input.value === state.project;});
    renderEstimate();
  }

  $('#base-more').addEventListener('click', () => {
    const button = $('#base-more');
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    $('#base-details').hidden = expanded;
  });

  function setProject(key) {
    if (!Object.hasOwn(SITE_CONFIG.projects, key)) return;
    state.project = key;
    renderExtras();
  }

  $$('[data-brand]').forEach(element => {element.textContent = SITE_CONFIG.brand + ' / digital';});
  $$('[data-owner]').forEach(element => {element.textContent = SITE_CONFIG.brand;});
  document.title = SITE_CONFIG.brand + ' — сайты и дизайн';
  $('#year').textContent = new Date().getFullYear();
  $$('[data-service-price]').forEach(element => {element.textContent = money(fromPrice(SITE_CONFIG.projects[element.dataset.servicePrice]));});
  $$('input[name="project"]').forEach(input => {
    const project = SITE_CONFIG.projects[input.value];
    input.nextElementSibling.lastElementChild.textContent = 'от ' + money(fromPrice(project));
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
    $('#contact-note').textContent = 'Telegram: @' + SITE_CONFIG.telegramUsername.trim().replace(/^@/, '');
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
