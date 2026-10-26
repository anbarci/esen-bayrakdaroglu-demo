(() => {
  const NO = '905305481709';
  const SAAT = [null, [9, 20], [9, 20], [9, 20], [9, 20], [9, 20], [9, 20]];
  const GUN = ['pazar', 'pazartesi', 'salı', 'çarşamba', 'perşembe', 'cuma', 'cumartesi'];
  const iki = s => String(s).padStart(2, '0') + '.00';

  document.querySelectorAll('form[data-randevu]').forEach(form => {
    const cikti = form.querySelector('[data-mesaj]');
    const gonder = form.querySelector('[data-gonder]');
    const yenile = () => {
      const satir = ['Merhaba, randevu almak istiyorum.'];
      for (const el of form.elements) {
        if (!el.name) continue;
        const deger = String(el.value).trim();
        if (deger) satir.push(form.querySelector('label[for="' + el.id + '"]').textContent.trim() + ': ' + deger);
      }
      const metin = satir.join('\n');
      cikti.textContent = metin;
      gonder.href = 'https://wa.me/' + NO + '?text=' + encodeURIComponent(metin);
    };
    form.addEventListener('input', yenile);
    form.addEventListener('submit', e => { e.preventDefault(); location.href = gonder.href; });
    yenile();
  });

  const durum = (gun, dk) => {
    const s = SAAT[gun];
    if (s && dk >= s[0] * 60 && dk < s[1] * 60) return 'Şu an açık. Kapanış ' + iki(s[1]) + '.';
    if (s && dk < s[0] * 60) return 'Şu an kapalı. Açılış bugün ' + iki(s[0]) + '.';
    let g = (gun + 1) % 7, n = 1;
    while (!SAAT[g]) { g = (g + 1) % 7; n++; }
    return 'Şu an kapalı. Açılış ' + (n === 1 ? 'yarın' : GUN[g]) + ' ' + iki(SAAT[g][0]) + '.';
  };
  console.assert(durum(1, 600) === 'Şu an açık. Kapanış 20.00.');
  console.assert(durum(1, 500) === 'Şu an kapalı. Açılış bugün 09.00.');
  console.assert(durum(0, 600) === 'Şu an kapalı. Açılış yarın 09.00.');
  console.assert(durum(6, 1250) === 'Şu an kapalı. Açılış pazartesi 09.00.');
  console.assert(durum(5, 1250) === 'Şu an kapalı. Açılış yarın 09.00.');

  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Istanbul', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map(x => [x.type, x.value]));
  const gun = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
  if (gun > -1) {
    const metin = durum(gun, +p.hour * 60 + +p.minute);
    document.querySelectorAll('[data-durum]').forEach(el => { el.textContent = metin; el.dataset.acik = metin.startsWith('Şu an açık') ? '1' : '0'; el.hidden = false; });
    document.querySelectorAll('tr[data-gun="' + gun + '"]').forEach(tr => {
      tr.classList.add('bugun');
      tr.querySelector('th').insertAdjacentHTML('beforeend', ' <span>bugün</span>');
    });
  }

  const cubuk = document.querySelector('.cubuk');
  if (cubuk && 'IntersectionObserver' in window) {
    const gorunen = new Set();
    const io = new IntersectionObserver(girdiler => {
      girdiler.forEach(g => g.isIntersecting ? gorunen.add(g.target) : gorunen.delete(g.target));
      cubuk.classList.toggle('gizle', gorunen.size > 0);
    }, { rootMargin: '-1px 0px 0px 0px' });
    document.querySelectorAll('[data-cubuk-gizle]').forEach(el => io.observe(el));
  }

  const dugme = document.querySelector('[data-tema-dugme]');
  if (dugme) {
    const kok = document.documentElement;
    const sorgu = matchMedia('(prefers-color-scheme: dark)');
    const koyuMu = () => (kok.dataset.theme || (sorgu.matches ? 'dark' : 'light')) === 'dark';
    const goster = () => {
      const yazi = koyuMu() ? 'Açık temaya geç' : 'Koyu temaya geç';
      dugme.setAttribute('aria-label', yazi);
      dugme.title = yazi;
      dugme.dataset.koyu = koyuMu() ? '1' : '0';
      dugme.hidden = false;
    };
    goster();
    sorgu.addEventListener('change', goster);
    dugme.addEventListener('click', () => {
      const yeni = koyuMu() ? 'light' : 'dark';
      kok.dataset.theme = yeni;
      try { localStorage.setItem('esen-tema', yeni); } catch (e) {}
      goster();
    });
  }
})();
