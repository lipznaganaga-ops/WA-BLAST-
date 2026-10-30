try{var t=localStorage.getItem("token"),u=JSON.parse(localStorage.getItem("user")||"null");if(t&&u){var a=["master","captain","agent"].indexOf(u.role)>=0||(u.permissions||[]).length>0;location.replace(a?"/admin":"/dashboard")}}catch(e){}

(() => {
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');

  // Â§5 â teruskan ?ref=KODE ke semua tombol Daftar
  const ref = new URLSearchParams(location.search).get('ref');
  if (ref && /^[A-Fa-f0-9]{8}$/.test(ref)) {
    document.querySelectorAll('.js-register').forEach(a => {
      const u = new URL(a.href); u.searchParams.set('ref', ref.toUpperCase()); a.href = u.toString();
    });
  }

  // Native controls remain available on every screen, including autoplay rejection.
  const v = document.getElementById('promo');
  const sound = document.getElementById('soundToggle');
  sound.hidden = false;
  const syncSound = () => {
    sound.textContent = v.muted ? 'Aktifkan suara â' : 'Matikan suara â';
    sound.setAttribute('aria-label', v.muted ? 'Aktifkan suara video' : 'Matikan suara video');
  };
  sound.addEventListener('click', () => {
    v.muted = !v.muted;
    if (v.paused) v.play().catch(() => {});
    syncSound();
  });
  v.addEventListener('volumechange', syncSound);
  const promoError = () => {
    document.getElementById('videoError').hidden = false;
    sound.hidden = true;
  };
  v.addEventListener('error', promoError);
  v.querySelector('source').addEventListener('error', promoError);
  document.querySelectorAll('[data-card]').forEach(button => {
    button.disabled = false;
    button.addEventListener('click', () => {
      const kind = button.dataset.card;
      const path = `/landing/assets/footage/card-${kind}.png`;
      document.getElementById('cardPreview').src = path;
      window.CuanTerusMotion?.cardChanged(document.getElementById('cardPreview'));
      document.getElementById('cardPreview').alt = kind === 'sent'
        ? 'Contoh kartu total kirim: 7.057 pesan; data demo'
        : 'Contoh kartu: pendapatan Rp7.971.450, 7.057 pesan; data demo';
      const full = document.getElementById('cardFull');
      full.href = path;
      full.setAttribute('aria-label', `Buka contoh kartu ${kind === 'sent' ? 'total kirim' : 'pendapatan dan kirim'} ukuran penuh di tab baru`);
      document.getElementById('cardDownload').href = path;
      document.querySelectorAll('[data-card]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    });
  });
  const shareVideo = document.getElementById('shareVideo');
  const shareError = () => { document.getElementById('shareVideoError').hidden = false; };
  shareVideo.addEventListener('error', shareError);
  shareVideo.querySelector('source').addEventListener('error', shareError);

  // Demo ports geometry, palette and quartic easing from components/SpinWheel.vue.
  // No account API calls, tickets or money: outcomes are local and illustrative.
  const svg = document.getElementById('demoWheel');
  const segments = ['Saldo', 'Tiket', 'Zonk', 'Saldo', 'Tiket', 'Zonk', 'Saldo', 'Tiket'];
  const palette = ['#f97316','#7c3aed','#1e293b','#4f46e5','#ea580c','#334155','#eab308','#4338ca'];
  const point = (deg,r=178) => [200+r*Math.sin(deg*Math.PI/180),200-r*Math.cos(deg*Math.PI/180)];
  let paths = '';
  segments.forEach((label,i) => {
    const a=point(i*45),b=point((i+1)*45);
    paths += `<path d="M200 200 L${a} A178 178 0 0 1 ${b} Z" fill="${palette[i]}" stroke="#140d24" stroke-width="2"/><g transform="rotate(${i*45+22.5} 200 200)"><text x="200" y="50" text-anchor="middle" font-size="24">${label==='Saldo'?'ð°':label==='Tiket'?'ðï¸':'ð'}</text><text x="200" y="116" text-anchor="middle" fill="${[0,4,6].includes(i)?'#0d0a18':'#ffffff'}" font-weight="800" font-size="16" transform="rotate(-90 200 116)">${label}</text></g>`;
  });
  svg.innerHTML = `<defs><linearGradient id="demoRim"><stop stop-color="#fbbf24"/><stop offset=".5" stop-color="#7c3aed"/><stop offset="1" stop-color="#f97316"/></linearGradient><radialGradient id="demoHub"><stop stop-color="#fde68a"/><stop offset=".6" stop-color="#f59e0b"/><stop offset="1" stop-color="#b45309"/></radialGradient></defs><circle cx="200" cy="200" r="192" fill="url(#demoRim)"/><circle cx="200" cy="200" r="182" fill="#140d24"/><g id="demoRotor">${paths}</g>`;
  for(let k=1;k<=24;k++){const [x,y]=point(k*15,187);svg.innerHTML+=`<circle class="wheel-light" cx="${x}" cy="${y}" r="4.5" fill="#fde68a"/>`;}
  svg.innerHTML += '<circle cx="200" cy="200" r="30.26" fill="url(#demoHub)" stroke="#fff7ed" stroke-width="3"/><text x="200" y="206" text-anchor="middle" fill="#451a03" font-weight="900" font-size="18">SPIN</text><path d="M184 6 L216 6 L200 46 Z" fill="#fff7ed" stroke="#b45309" stroke-width="3" stroke-linejoin="round"/><circle cx="200" cy="12" r="5" fill="#f97316"/>';
  const rotor=document.getElementById('demoRotor'),button=document.getElementById('spinButton'),result=document.getElementById('spinResult');
  let angle=0, spinning=false, idleVisible=false, idleFrameId=0, idleLast=0;
  const canMove = () => !motionPreference.matches && document.documentElement.dataset.motion === 'running';
  const idleTick = now => {
    idleFrameId = 0;
    if (!idleVisible || !canMove() || document.hidden) { idleLast = 0; return; }
    if (!spinning && idleLast) {
      angle = (angle + Math.min(now-idleLast,100)*.006)%360;
      rotor.setAttribute('transform', `rotate(${angle} 200 200)`);
    }
    idleLast=now; idleFrameId=requestAnimationFrame(idleTick);
  };
  const resumeIdle = () => { if (!idleFrameId && idleVisible && canMove() && !document.hidden) idleFrameId=requestAnimationFrame(idleTick); };
  new IntersectionObserver(([entry]) => { idleVisible=entry.isIntersecting; if (idleVisible) resumeIdle(); }, {threshold:.15}).observe(svg);
  document.addEventListener('cuanterus:motion', resumeIdle);
  document.addEventListener('visibilitychange', resumeIdle);
  motionPreference.addEventListener('change', resumeIdle);
  button.disabled = false;
  button.addEventListener('click',()=>{
    if(button.disabled)return;
    spinning=true;button.disabled=true;button.textContent='Rodanya lagi berputarâ¦';result.textContent='Ini simulasi. Tidak memakai tiket atau saldo akun.';
    const random=new Uint32Array(1);crypto.getRandomValues(random);const idx=random[0]%segments.length;
    const centre=idx*45+22.5,from=angle,delta=(((-centre-from)%360)+360)%360,to=from+360*7+delta,duration=5600,t0=performance.now();
    function frame(now){
      const p=canMove()?Math.min(1,(now-t0)/duration):1;
      angle=from+(to-from)*(1-Math.pow(1-p,4));
      rotor.setAttribute('transform',`rotate(${angle} 200 200)`);
      if(p<1)requestAnimationFrame(frame);
      else {
        angle=to%360;spinning=false;button.disabled=false;button.textContent='Coba putar lagi â»';
        result.textContent=segments[idx]==='Zonk'?'Hasil demo: Zonk. Coba lagi, yuk!':`Hasil demo: ${segments[idx]}. Tidak ada hadiah atau saldo asli.`;
        window.CuanTerusMotion?.celebrate(document.querySelector('.spin-demo'));
      }
    }
    if (!canMove()) frame(t0 + duration);
    else requestAnimationFrame(frame);
  });

})();

/* Message editor feature: edit and preview text before copying it to send. */
(() => {
  const draft = document.getElementById('messageDraft');
  if (!draft) return;
  const preview = document.getElementById('messagePreview');
  const count = document.getElementById('messageCount');
  const status = document.getElementById('messageEditorStatus');
  const initial = draft.value;
  const updatePreview = () => {
    preview.textContent = draft.value || 'Pratinjau pesan akan muncul di sini.';
    count.textContent = `${draft.value.length} karakter`;
  };
  draft.addEventListener('input', () => {
    updatePreview();
    status.textContent = 'Pesan sedang diedit. Tekan “Simpan edit” untuk menandai perubahan selesai.';
  });
  document.getElementById('saveMessageEdit').addEventListener('click', () => {
    updatePreview();
    status.textContent = 'Edit pesan tersimpan di pratinjau. Kamu bisa menyalin teks untuk digunakan saat mengirim.';
  });
  document.getElementById('resetMessageEdit').addEventListener('click', () => {
    draft.value = initial;
    updatePreview();
    status.textContent = 'Pesan contoh dikembalikan.';
  });
  document.getElementById('copyEditedMessage').addEventListener('click', async () => {
    if (!draft.value.trim()) {
      status.textContent = 'Tulis pesan terlebih dahulu sebelum menyalin.';
      draft.focus();
      return;
    }
    try {
      await navigator.clipboard.writeText(draft.value);
      status.textContent = 'Pesan berhasil disalin. Tempelkan ke tempat kamu akan mengirim pesan.';
    } catch (error) {
      draft.focus();
      draft.select();
      status.textContent = 'Salin otomatis tidak tersedia di browser ini. Tekan lama teks yang dipilih lalu pilih Salin.';
    }
  });
  updatePreview();
})();
