/* ==========================================================
   SCOUT HUB ONLINE — js/chat.js

   Same public interface as before (Chat.init/open/renderConversations/
   render/sync/send) so index.html's bindings and members.js's
   Chat.open(m) call need ZERO changes.

   Was: 3-second polling against a PHP endpoint.
   Now: real Supabase Realtime — the peer receives new messages
   instantly, no polling.

   BUG FIXED while adapting this: the original optimistic local
   echo used a client-generated id that never matched the id the
   server eventually assigned, so a message could appear twice
   once sync caught up (no client_id reconciliation existed). The
   Postgres schema's `messages.client_id` column now closes that
   gap — the realtime handler recognizes "this is my own message
   coming back" by client_id and skips re-adding it.
   ========================================================== */

const Chat = (function () {
  let peer = null;
  let conversationId = null;
  let realtimeUnsub = null;

  async function sb() { return SupabaseClient.get(); }

  async function requireLogin() {
    const client = await sb();
    const { data } = await client.auth.getSession();
    if (data?.session) {
      await Auth.restore();
      return true;
    }
    await AuthGate.openLogin('Konekte pou voye mesaj.');
    return !!Auth.get();
  }

  async function resolveConversation(myId, peerId) {
    const client = await sb();
    const { data: mine } = await client.from('conversation_members').select('conversation_id').eq('member_id', myId);
    const convIds = (mine || []).map((r) => r.conversation_id);
    if (convIds.length) {
      const { data: shared } = await client
        .from('conversation_members')
        .select('conversation_id')
        .eq('member_id', peerId)
        .in('conversation_id', convIds);
      if (shared && shared.length) return shared[0].conversation_id;
    }
    const { data: conv, error } = await client.from('conversations').insert({}).select().single();
    if (error) throw error;
    await client.from('conversation_members').insert([
      { conversation_id: conv.id, member_id: myId },
      { conversation_id: conv.id, member_id: peerId }
    ]);
    return conv.id;
  }

  function subscribeRealtime() {
    if (realtimeUnsub) { realtimeUnsub(); realtimeUnsub = null; }
    if (!conversationId) return;
    sb().then((client) => {
      const channel = client
        .channel('chat-' + conversationId)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, (payload) => {
          mergeIncoming(payload.new);
        })
        .subscribe();
      realtimeUnsub = () => client.removeChannel(channel);
    });
  }

  function mergeIncoming(row) {
    const my = SyncEngine.getMyMemberId();
    const all = StorageService.data();
    // If this is the server-confirmed echo of a message WE sent locally
    // (matched by client_id), replace the temp local row instead of
    // duplicating it.
    const localIdx = row.client_id ? all.messages.findIndex((m) => m.id === row.client_id) : -1;
    const mapped = {
      id: row.id,
      peer_local_id: peer ? peer.id : null,
      sender: row.sender_id === my ? 'me' : 'them',
      type: row.message_type,
      content: row.content,
      created_at: row.created_at
    };
    if (localIdx >= 0) all.messages[localIdx] = mapped;
    else if (!all.messages.some((m) => m.id === row.id)) all.messages.push(mapped);
    localStorage.setItem('scoutHub.v2', JSON.stringify(all));
    render();
  }

  async function pullMessages() {
    if (!conversationId) return;
    const client = await sb();
    const my = SyncEngine.getMyMemberId();
    const { data } = await client.from('messages').select('*').eq('conversation_id', conversationId).order('created_at');
    if (!data) return;
    const all = StorageService.data();
    for (const row of data) {
      const localIdx = row.client_id ? all.messages.findIndex((m) => m.id === row.client_id) : -1;
      const mapped = { id: row.id, peer_local_id: peer.id, sender: row.sender_id === my ? 'me' : 'them', type: row.message_type, content: row.content, created_at: row.created_at };
      if (localIdx >= 0) all.messages[localIdx] = mapped;
      else if (!all.messages.some((m) => m.id === row.id)) all.messages.push(mapped);
    }
    localStorage.setItem('scoutHub.v2', JSON.stringify(all));
    render();
  }

  async function open(m) {
    peer = m;
    renderConversations();
    Navigation.show('messages');
    renderConversations();
    render();
    document.getElementById('chatInput').disabled = false;
    document.getElementById('chatForm').querySelector('button').disabled = false;
    document.getElementById('imageInput').disabled = false;
    document.getElementById('recordBtn').disabled = false;

    conversationId = null;
    const client = await sb();
    const { data: sessionData } = await client.auth.getSession();
    const my = SyncEngine.getMyMemberId();
    if (sessionData.session && my && peer.id !== my) {
      try {
        conversationId = await resolveConversation(my, peer.id);
        await pullMessages();
        subscribeRealtime();
      } catch (err) {
        console.warn('[Chat] could not resolve conversation', err);
      }
    }
  }

  async function loadMembersFromCloud() {
    try {
      const client = await sb();
      const { data: sessionData } = await client.auth.getSession();
      if (!sessionData?.session) {
        renderConversations();
        return;
      }
      const { data, error } = await client.from('members').select('*').order('first_name');
      if (error) throw error;
      if (Array.isArray(data)) {
        StorageService.replaceCollection('members', data);
      }
    } catch (err) {
      console.warn('[Chat] member refresh failed:', err);
    }
    renderConversations();
  }

  function initials(m) {
    return `${String(m?.first_name || '').charAt(0)}${String(m?.last_name || '').charAt(0)}`.toUpperCase() || '👤';
  }

  function renderConversations() {
    const l = document.getElementById('conversationList');
    if (!l) return;
    const ms = StorageService.collection('members').filter((m) => {
      const my = SyncEngine.getMyMemberId();
      return !my || String(m.id) !== String(my);
    });

    l.innerHTML = ms.length
      ? `<div class="conversation-list-title">SCOUTS <span>${ms.length}</span></div>` +
        ms.map((m) => `
          <button class="conversation-item conversation-item-modern ${peer?.id === m.id ? 'active' : ''}" data-peer="${m.id}">
            <span class="conversation-avatar">${Utils.esc(initials(m))}</span>
            <span class="conversation-copy">
              <strong>${Utils.esc(m.first_name)} ${Utils.esc(m.last_name)}</strong>
              <small>${Utils.esc(m.scout_name || m.member_id || 'Scout')}</small>
            </span>
            <span class="conversation-arrow">›</span>
          </button>
        `).join('')
      : `<div class="chat-empty-members">
           <div class="chat-empty-icon">👥</div>
           <strong>Pa gen manm ki chaje</strong>
           <p>Verifye koneksyon an epi rafrechi lis la.</p>
           <button type="button" class="chat-empty-refresh" id="chatEmptyRefresh">↻ Rafrechi</button>
         </div>`;
  }


  async function mediaMarkup(msg) {
    try {
      const meta = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
      if (!meta?.path) return '';
      const client = await sb();
      const {data,error} = await client.storage.from('scout-media').createSignedUrl(meta.path, 60*60*24*365);
      if(error || !data?.signedUrl) return `<div class="chat-file-error">Fichye a pa disponib.</div>`;
      const url = Utils.esc(data.signedUrl);
      const name = Utils.esc(meta.name || 'Fichye');
      const size = meta.size ? `${(meta.size/1024/1024).toFixed(1)} MB` : '';
      if(msg.type==='image') return `<img src="${url}" alt="${name}" class="chat-image chat-image-large">`;
      if(msg.type==='video') return `<div class="chat-video-wrap"><video controls preload="metadata" src="${url}" class="chat-video"></video><a href="${url}" target="_blank" rel="noopener" class="chat-file-link">🎬 ${name} · ${size}</a></div>`;
      if(msg.type==='audio') return `<audio controls preload="metadata" src="${url}" class="chat-audio"></audio><a href="${url}" target="_blank" rel="noopener" class="chat-file-link">🎵 ${name} · ${size}</a>`;
      return `<a href="${url}" target="_blank" rel="noopener" class="chat-file-card">📎 <span><strong>${name}</strong><small>${size}</small></span>↗</a>`;
    } catch {
      return `<div class="chat-file-error">Fichye a pa disponib.</div>`;
    }
  }

  async function render() {
    const h = document.getElementById('chatHeader');
    const box = document.getElementById('chatMessages');
    const avatar = document.getElementById('chatAvatar');
    const presence = document.getElementById('chatPresence');
    if (!h || !box) return;

    if (!peer) {
      h.textContent = 'Chwazi yon manm';
      if (avatar) avatar.textContent = '💬';
      if (presence) presence.textContent = 'Pa gen konvèsasyon chwazi';
      box.innerHTML = `<div class="chat-welcome">
        <div class="chat-welcome-icon">💬</div>
        <h3>Mesaj SCOUT HUB</h3>
        <p>Chwazi yon Scout nan lis la pou kòmanse yon konvèsasyon.</p>
      </div>`;
      return;
    }

    h.textContent = `${peer.first_name || ''} ${peer.last_name || ''}`.trim();
    if (avatar) avatar.textContent = initials(peer);
    if (presence) presence.textContent = peer.scout_name || peer.member_id || 'Scout';

    const msgs = StorageService.collection('messages')
      .filter((x) => x.peer_local_id === peer.id)
      .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));

    box.innerHTML = msgs.length
      ? msgs.map((x) => `
          <div class="bubble bubble-modern ${x.sender === 'me' ? 'me' : ''}" data-msg-id="${Utils.esc(x.id)}">
            <div class="bubble-content">
              ${x.type === 'text'
                ? `<div class="bubble-text">${Utils.esc(x.content)}</div>`
                : `<div class="chat-media-loading">⏳ Chargement du média…</div>`}
            </div>
            <small>${new Date(x.created_at).toLocaleString()}</small>
          </div>
        `).join('')
      : `<div class="chat-no-messages"><span>✨</span><strong>Nouvo konvèsasyon</strong><small>Voye premye mesaj la.</small></div>`;

    for(const x of msgs){
      if(x.type==='text') continue;
      const el=box.querySelector(`[data-msg-id="${CSS.escape(String(x.id))}"] .bubble-content`);
      if(el) el.innerHTML=await mediaMarkup(x);
    }

    box.scrollTop = box.scrollHeight;
  }


  async function send(content, type = 'text') {
    if (!peer) return false;
    if (!(await requireLogin())) return false;
    const localId = Utils.uid();
    const m = { id: localId, peer_local_id: peer.id, sender: 'me', type, content, created_at: new Date().toISOString() };
    const all = StorageService.data();
    all.messages.push(m);
    localStorage.setItem('scoutHub.v2', JSON.stringify(all));
    render();

    if (type === 'text' && OfflineDirect && OfflineDirect.isConnected && OfflineDirect.isConnected()) {
      OfflineDirect.send(peer, content, type);
      return true;
    }
    const my = SyncEngine.getMyMemberId();
    if (my && conversationId) {
      try {
        const client = await sb();
        let file_path = null;
        if (type !== 'text') {
          try {
            const meta = JSON.parse(content);
            if (meta && typeof meta.path === 'string') file_path = meta.path;
          } catch (_) {}
        }
        await client.from('messages').insert({
          conversation_id: conversationId, sender_id: my, receiver_id: peer.id,
          message_type: type, content, client_id: localId, file_path
        });
      } catch (e) { console.warn('[Chat] send failed', e); }
    }
    return true;
  }

  // Kept for interface compatibility — real delivery is realtime-driven
  // now, but this still works as a manual refresh if ever called.
  async function sync() { await pullMessages(); }

  function handleOfflineMessage(e){const x=e.detail||{};if(!peer || (x.peer && String(x.peer)!==String(peer.id))) return;const all=StorageService.data();all.messages.push({id:Utils.uid(),peer_local_id:peer.id,sender:'them',type:x.messageType||'text',content:x.content,created_at:x.created_at||new Date().toISOString(),offline_direct:true});localStorage.setItem('scoutHub.v2',JSON.stringify(all));render()}

  function bindChatAI() {
    const b=document.getElementById('chatAiBtn');
    if(!b || b.dataset.bound) return;
    b.dataset.bound='1';
    b.addEventListener('click',()=>{
      if(typeof ScoutAI==='undefined'){Utils.toast('🤖 Scout IA pa chaje.');return;}
      ScoutAI.open({context:'messages'});
    });
  }

  function init() {
    bindChatAI();
    window.addEventListener('scout:offline-message',handleOfflineMessage);
    window.addEventListener('scout:realtime-ready', () => loadMembersFromCloud());
    window.addEventListener('online', () => loadMembersFromCloud());

    document.getElementById('chatRefreshBtn')?.addEventListener('click', () => loadMembersFromCloud());
    document.getElementById('chatEmptyRefresh')?.addEventListener('click', () => loadMembersFromCloud());
    document.getElementById('conversationList')?.addEventListener('click', (e) => {
      if (e.target.closest('#chatEmptyRefresh')) {
        loadMembersFromCloud();
        return;
      }
      const b = e.target.closest('[data-peer]');
      if (!b) return;
      const m = StorageService.collection('members').find((x) => x.id === b.dataset.peer);
      if (m) open(m);
    });
    document.getElementById('chatForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const i = document.getElementById('chatInput');
      const v = i.value.trim();
      if (v) send(v);
      i.value = '';
    });
    renderConversations();
    document.addEventListener('scout:auth-ready', () => {
      loadMembersFromCloud();
      if (peer) open(peer);
    });
  }

  return { init, open, renderConversations, render, sync, send, requireLogin, loadMembersFromCloud };
})();
