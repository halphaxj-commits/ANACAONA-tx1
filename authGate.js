const AuthGate = (() => {
  function render(onSuccess) {
    const splash = document.getElementById('splashScreen');
    if (!splash) return onSuccess();

    splash.className = 'auth-shell';
    splash.innerHTML = `
      <div class="auth-wrap">
        <div class="auth-brand-block">
          <div class="auth-logo">⚜️</div>
          <div class="auth-brand-name">SCOUT HUB</div>
          <div class="auth-tagline">Òganize • Aprann • Sèvi</div>
        </div>

        <div class="auth-card-v8">
          <div class="auth-switch">
            <button type="button" class="auth-switch-btn active" data-auth-view="login">Konekte</button>
            <button type="button" class="auth-switch-btn" data-auth-view="register">Enskri</button>
          </div>

          <section id="authLoginPanel" class="auth-view">
            <h2>Bon retou 👋🏽</h2>
            <p class="auth-sub">Konekte pou jwenn kont ou ak done SCOUT HUB yo.</p>
            <button type="button" id="gateGoogleLogin" class="google-auth-btn">
              <span class="google-g-mark">G</span><span>Kontinye ak Google</span>
            </button>
            <div class="auth-or"><span>oswa</span></div>
            <form id="gateLogin" class="auth-form-v8">
              <label>Email<input id="gateLoginEmail" type="email" autocomplete="email" placeholder="exemple@email.com" required></label>
              <label>Modpas<input id="gateLoginPass" type="password" autocomplete="current-password" placeholder="••••••••" required></label>
              <label class="auth-remember"><input id="gateRemember" type="checkbox" checked> <span>Kenbe m konekte</span></label>
              <button class="auth-main-btn" type="submit">Konekte <span>→</span></button>
            </form>
            <div class="auth-links">
              <button type="button" id="forgotBtn">🔑 Mwen pèdi modpas mwen</button>
              <button type="button" id="resendBtn">📧 Voye email verifikasyon an ankò</button>
            </div>
          </section>

          <section id="authRegisterPanel" class="auth-view hidden">
            <h2>Kreye kont ou ✨</h2>
            <p class="auth-sub">Apre enskripsyon an, verifye email ou si konfimasyon an aktive.</p>
            <form id="gateRegister" class="auth-form-v8">
              <div class="auth-row">
                <label>Prénom<input id="gateRegFirst" autocomplete="given-name" required></label>
                <label>Nom<input id="gateRegLast" autocomplete="family-name" required></label>
              </div>
              <label>Email<input id="gateRegEmail" type="email" autocomplete="email" placeholder="exemple@email.com" required></label>
              <label>Modpas<input id="gateRegPass" type="password" minlength="8" autocomplete="new-password" placeholder="8+ karaktè" required></label>
              <label>Matricule unique<input id="gateRegMat" autocomplete="off" required></label>
              <label>Fonksyon nan unité<select id="gateRegUnitRole" required>${ScoutRoles.unitOptions('Sp')}</select></label>
              <button class="auth-main-btn" type="submit">Kreye kont <span>→</span></button>
            </form>
          </section>

          <section id="authRecoveryPanel" class="auth-view hidden">
            <button type="button" class="auth-back" id="backAuth">← Retounen</button>
            <h2>Reprann kont ou 🔑</h2>
            <p class="auth-sub">Mete email kont ou. Supabase ap voye yon lyen pou chanje modpas la.</p>
            <form id="recoveryForm" class="auth-form-v8">
              <label>Email<input id="recoveryEmail" type="email" autocomplete="email" required></label>
              <button class="auth-main-btn" type="submit">Voye lyen reset la <span>→</span></button>
            </form>
          </section>

          <section id="authResetPanel" class="auth-view hidden">
            <button type="button" class="auth-back" id="backReset">← Retounen</button>
            <h2>Nouvo modpas 🔐</h2>
            <p class="auth-sub">Mete yon nouvo modpas pou kont ou.</p>
            <form id="resetForm" class="auth-form-v8">
              <label>Nouvo modpas<input id="resetPass" type="password" minlength="8" autocomplete="new-password" required></label>
              <label>Konfime modpas<input id="resetPass2" type="password" minlength="8" autocomplete="new-password" required></label>
              <button class="auth-main-btn" type="submit">Sove nouvo modpas <span>→</span></button>
            </form>
          </section>

          <div id="gateMessage" class="auth-message hidden" aria-live="polite"></div>
        </div>

        <div class="auth-foot">🔒 Koneksyon sekirize • 🔄 Real-time • 📡 Offline Direct</div>
      </div>`;

    const show = (name) => {
      splash.querySelectorAll('[data-auth-view]').forEach(b =>
        b.classList.toggle('active', b.dataset.authView === name)
      );
      document.getElementById('authLoginPanel').classList.toggle('hidden', name !== 'login');
      document.getElementById('authRegisterPanel').classList.toggle('hidden', name !== 'register');
      document.getElementById('authRecoveryPanel').classList.toggle('hidden', name !== 'recovery');
      document.getElementById('authResetPanel').classList.toggle('hidden', name !== 'reset');
      clearMessage();
    };

    splash.querySelectorAll('[data-auth-view]').forEach(b => b.onclick = () => show(b.dataset.authView));
    document.getElementById('forgotBtn').onclick = () => show('recovery');
    document.getElementById('backAuth').onclick = () => show('login');
    document.getElementById('backReset').onclick = () => show('login');

    document.getElementById('resendBtn').onclick = async () => {
      const email = document.getElementById('gateLoginEmail').value.trim();
      if (!email) return message('Mete email ou an dabò.', 'error');
      await busy(document.getElementById('gateLogin'), async () => {
        await API.resendConfirmation(email);
        message('Nou mande Supabase ren voye verifikasyon an. Tcheke Inbox ak Spam.', 'success');
      });
    };

    document.getElementById('gateGoogleLogin')?.addEventListener('click', async () => {
      const btn = document.getElementById('gateGoogleLogin');
      try {
        if (btn) { btn.disabled = true; btn.innerHTML = '<span class="google-g-mark">G</span><span>⏳ Google ap louvri...</span>'; }
        await API.loginWithGoogle();
      } catch (err) {
        message(err?.message || 'Koneksyon Google echwe.', 'error');
        if (btn) { btn.disabled = false; btn.innerHTML = '<span class="google-g-mark">G</span><span>Kontinye ak Google</span>'; }
      }
    });

    document.getElementById('gateLogin').onsubmit = async e => {
      e.preventDefault();
      await busy(e.target, async () => {
        const remember = document.getElementById('gateRemember')?.checked !== false;
        localStorage.setItem('scout_hub_remember_session', remember ? '1' : '0');
        await API.login({
          email: document.getElementById('gateLoginEmail').value.trim(),
          password: document.getElementById('gateLoginPass').value
        });
        await Auth.restore();
        onSuccess();
      });
    };

    document.getElementById('gateRegister').onsubmit = async e => {
      e.preventDefault();
      const email = document.getElementById('gateRegEmail').value.trim();
      await busy(e.target, async () => {
        const r = await API.register({
          email,
          password: document.getElementById('gateRegPass').value,
          first_name: document.getElementById('gateRegFirst').value.trim(),
          last_name: document.getElementById('gateRegLast').value.trim(),
          member_id: document.getElementById('gateRegMat').value.trim(),
          unit_role: document.getElementById('gateRegUnitRole').value
        });
        if (r.data.needsEmailConfirmation) {
          message('✅ Kont lan kreye. 📧 Verifye email ou anvan ou konekte. Tcheke Inbox ak Spam; si ou pa resevwa li, itilize “Voye email verifikasyon an ankò”.', 'success');
          show('login');
          document.getElementById('gateLoginEmail').value = email;
          return;
        }
        await Auth.restore();
        message('✅ Kont lan kreye epi email la deja verifye. Ou ka antre kounye a.', 'success');
        onSuccess();
      });
    };

    document.getElementById('recoveryForm').onsubmit = async e => {
      e.preventDefault();
      await busy(e.target, async () => {
        await API.resetPassword(document.getElementById('recoveryEmail').value.trim());
        message('Si email la egziste, Supabase ap voye lyen rekiperasyon an. Tcheke Inbox ak Spam.', 'success');
      });
    };

    document.getElementById('resetForm').onsubmit = async e => {
      e.preventDefault();
      const a = document.getElementById('resetPass').value;
      const b = document.getElementById('resetPass2').value;
      if (a.length < 8) return message('Nouvo modpas la dwe gen omwen 8 karaktè.', 'error');
      if (a !== b) return message('De modpas yo pa menm.', 'error');

      await busy(e.target, async () => {
        await API.updatePassword(a);
        message('Modpas la chanje. Kounye a ou ka konekte ak nouvo modpas la.', 'success');
        setTimeout(() => show('login'), 900);
      });
    };

    // Password recovery can arrive through ?reset=1, a #fragment, or
    // Supabase's PASSWORD_RECOVERY auth event. Never leave the user
    // stuck on the splash screen while waiting for the reset UI.
    const savedRemember = localStorage.getItem('scout_hub_remember_session');
    const rememberBox = document.getElementById('gateRemember');
    if (rememberBox && savedRemember !== '0') rememberBox.checked = true;

    const hasRecoveryHint = () => {
      const q = new URLSearchParams(location.search);
      const h = new URLSearchParams(String(location.hash || '').replace(/^#/, ''));
      return q.get('reset') === '1' || h.get('type') === 'recovery' || h.get('access_token') || h.get('code');
    };
    if (hasRecoveryHint()) setTimeout(() => show('reset'), 80);

    SupabaseClient.get().then(client => {
      client.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') { show('reset'); return; }
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
          await Auth.restore();
          if (Auth.get()) {
            try { await SyncEngine.start(); } catch (e) { console.warn('[AuthGate] sync after OAuth:', e); }
            document.dispatchEvent(new CustomEvent('scout:auth-ready'));
          }
        }
      });
    }).catch(err => console.warn('[AuthGate] recovery listener:', err));
  }

  function clearMessage() {
    const e = document.getElementById('gateMessage');
    if (e) { e.className = 'auth-message hidden'; e.textContent = ''; }
  }

  function message(t, type) {
    const e = document.getElementById('gateMessage');
    if (!e) return;
    e.textContent = t;
    e.className = 'auth-message ' + type;
  }

  async function busy(form, fn) {
    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.dataset.old = btn.innerHTML;
      btn.innerHTML = '⏳ Tanpri tann...';
    }
    try { await fn(); }
    catch (e) { message(e.message || 'Yon erè rive.', 'error'); }
    finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = btn.dataset.old || btn.innerHTML;
      }
    }
  }

  async function ensureAuthenticated() {
    if (Auth.get()) return;
    const client = await SupabaseClient.get();
    const { data } = await client.auth.getSession();
    if (data.session) {
      await Auth.restore();
      if (Auth.get()) return;
    }
    return new Promise(resolve => render(resolve));
  }

  async function openLogin(reason = 'Konekte pou kontinye.') {
    if (Auth.get()) return true;
    const client = await SupabaseClient.get();
    const { data } = await client.auth.getSession();
    if (data?.session) {
      await Auth.restore();
      return !!Auth.get();
    }

    if (typeof App === 'undefined' || !App.modal) {
      message(reason, 'error');
      return false;
    }

    App.modal(`
      <div class="auth-inline-login">
        <div class="auth-brand-block">
          <div class="auth-logo">⚜️</div>
          <div class="auth-brand-name">SCOUT HUB</div>
        </div>
        <h2 id="inlineAuthTitle">Konekte pou voye mesaj 🔐</h2>
        <p class="auth-sub">Ou ka itilize SCOUT HUB san kont. Men pou voye yon mesaj, ou dwe konekte.</p>
        <div class="auth-switch" style="margin-bottom:14px">
          <button type="button" class="auth-switch-btn active" id="inlineLoginTab">Konekte</button>
          <button type="button" class="auth-switch-btn" id="inlineRegisterTab">Enskri</button>
        </div>
        <button type="button" id="inlineGoogleLogin" class="google-auth-btn">
          <span class="google-g-mark">G</span><span>Kontinye ak Google</span>
        </button>
        <div class="auth-or"><span>oswa</span></div>
        <form id="inlineLoginForm" class="auth-form-v8">
          <label>Email<input id="inlineLoginEmail" type="email" autocomplete="email" placeholder="exemple@email.com" required></label>
          <label>Modpas<input id="inlineLoginPass" type="password" autocomplete="current-password" placeholder="••••••••" required></label>
          <button class="auth-main-btn" type="submit">Konekte <span>→</span></button>
        </form>
        <form id="inlineRegisterForm" class="auth-form-v8 hidden">
          <div class="auth-row">
            <label>Prénom<input id="inlineRegFirst" autocomplete="given-name" required></label>
            <label>Nom<input id="inlineRegLast" autocomplete="family-name" required></label>
          </div>
          <label>Email<input id="inlineRegEmail" type="email" autocomplete="email" required></label>
          <label>Modpas<input id="inlineRegPass" type="password" minlength="8" autocomplete="new-password" required></label>
          <label>Matricule unique<input id="inlineRegMat" autocomplete="off" required></label>
          <label>Fonksyon nan unité<select id="inlineRegUnitRole" required>${ScoutRoles.unitOptions('Sp')}</select></label>
          <button class="auth-main-btn" type="submit">Kreye kont <span>→</span></button>
        </form>
        <p id="inlineLoginMessage" class="auth-message hidden" aria-live="polite"></p>
      </div>`);

    const form = document.getElementById('inlineLoginForm');
    const registerForm = document.getElementById('inlineRegisterForm');
    const out = document.getElementById('inlineLoginMessage');
    const loginTab = document.getElementById('inlineLoginTab');
    const registerTab = document.getElementById('inlineRegisterTab');
    const title = document.getElementById('inlineAuthTitle');
    const setOut = (text, type='error') => { if(out){ out.textContent=text; out.className='auth-message '+type; } };
    const switchAuth = (mode) => {
      const login = mode === 'login';
      form?.classList.toggle('hidden', !login);
      registerForm?.classList.toggle('hidden', login);
      loginTab?.classList.toggle('active', login);
      registerTab?.classList.toggle('active', !login);
      if(title) title.textContent = login ? 'Konekte pou voye mesaj 🔐' : 'Kreye kont ou ✨';
      setOut('', 'hidden');
    };
    loginTab?.addEventListener('click', () => switchAuth('login'));
    registerTab?.addEventListener('click', () => switchAuth('register'));
    document.getElementById('inlineGoogleLogin')?.addEventListener('click', async () => {
      const btn = document.getElementById('inlineGoogleLogin');
      try {
        if (btn) { btn.disabled = true; btn.innerHTML = '<span class="google-g-mark">G</span><span>⏳ Google ap louvri...</span>'; }
        await API.loginWithGoogle();
      } catch (err) {
        setOut(err?.message || 'Koneksyon Google echwe.', 'error');
        if (btn) { btn.disabled = false; btn.innerHTML = '<span class="google-g-mark">G</span><span>Kontinye ak Google</span>'; }
      }
    });

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if(btn){ btn.disabled=true; btn.dataset.old=btn.innerHTML; btn.innerHTML='⏳ Tanpri tann...'; }
      try {
        await API.login({
          email: document.getElementById('inlineLoginEmail').value.trim(),
          password: document.getElementById('inlineLoginPass').value
        });
        await Auth.restore();
        if(!Auth.get()) throw new Error('Sesyon an pa t kapab retabli.');
        App.closeModal();
        await SyncEngine.start();
        await Chat.loadMembersFromCloud?.();
        document.dispatchEvent(new CustomEvent('scout:auth-ready'));
      } catch(err) {
        setOut(err?.message || 'Koneksyon an echwe.', 'error');
      } finally {
        if(btn){ btn.disabled=false; btn.innerHTML=btn.dataset.old || 'Konekte →'; }
      }
    });
    registerForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = registerForm.querySelector('button[type=submit]');
      if(btn){ btn.disabled=true; btn.dataset.old=btn.innerHTML; btn.innerHTML='⏳ Tanpri tann...'; }
      try {
        const r = await API.register({
          email: document.getElementById('inlineRegEmail').value.trim(),
          password: document.getElementById('inlineRegPass').value,
          first_name: document.getElementById('inlineRegFirst').value.trim(),
          last_name: document.getElementById('inlineRegLast').value.trim(),
          member_id: document.getElementById('inlineRegMat').value.trim(),
          unit_role: document.getElementById('inlineRegUnitRole').value
        });
        if(r.data?.needsEmailConfirmation){
          setOut('✅ Kont lan kreye. 📧 Verifye email ou anvan ou konekte.', 'success');
          switchAuth('login');
          document.getElementById('inlineLoginEmail').value = document.getElementById('inlineRegEmail').value.trim();
        } else {
          await Auth.restore();
          if(!Auth.get()) throw new Error('Kont lan kreye, men sesyon an pa t kapab retabli.');
          App.closeModal();
          await SyncEngine.start();
          await Chat.loadMembersFromCloud?.();
          document.dispatchEvent(new CustomEvent('scout:auth-ready'));
        }
      } catch(err) {
        setOut(err?.message || 'Enskripsyon an echwe.', 'error');
      } finally {
        if(btn){ btn.disabled=false; btn.innerHTML=btn.dataset.old || 'Kreye kont →'; }
      }
    });
    document.getElementById('inlineLoginEmail')?.focus();
    return false;
  }

  async function openRegister(reason = 'Kreye kont SCOUT HUB ou.') {
    if (Auth.get()) return true;
    const client = await SupabaseClient.get();
    const { data } = await client.auth.getSession();
    if (data?.session) { await Auth.restore(); return !!Auth.get(); }
    if (typeof App === 'undefined' || !App.modal) return false;
    const ok = await openLogin(reason);
    setTimeout(() => document.getElementById('inlineRegisterTab')?.click(), 0);
    return ok;
  }

  return { ensureAuthenticated, openLogin, openRegister };
})();
