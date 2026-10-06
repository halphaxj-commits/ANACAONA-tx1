/* SCOUT HUB V30.5 — Global UI i18n
 * Translates the whole visible interface, not only the bottom navigation.
 * Every text node keeps its original Haitian source so language switching is reversible.
 */
const I18n = (() => {
  const nav = {
    ht:{home:'Akèy',members:'Manm',activities:'Aktivite',games:'Jwèt',messages:'Mesaj',more:'Plis'},
    fr:{home:'Accueil',members:'Membres',activities:'Activités',games:'Jeux',messages:'Messages',more:'Plus'},
    en:{home:'Home',members:'Members',activities:'Activities',games:'Games',messages:'Messages',more:'More'},
    es:{home:'Inicio',members:'Miembros',activities:'Actividades',games:'Juegos',messages:'Mensajes',more:'Más'},
    pt:{home:'Início',members:'Membros',activities:'Atividades',games:'Jogos',messages:'Mensagens',more:'Mais'},
    de:{home:'Start',members:'Mitglieder',activities:'Aktivitäten',games:'Spiele',messages:'Nachrichten',more:'Mehr'},
    it:{home:'Home',members:'Membri',activities:'Attività',games:'Giochi',messages:'Messaggi',more:'Altro'},
    zh:{home:'首页',members:'成员',activities:'活动',games:'游戏',messages:'消息',more:'更多'},
    ja:{home:'ホーム',members:'メンバー',activities:'活動',games:'ゲーム',messages:'メッセージ',more:'その他'},
    ko:{home:'홈',members:'회원',activities:'활동',games:'게임',messages:'메시지',more:'더보기'},
    ar:{home:'الرئيسية',members:'الأعضاء',activities:'الأنشطة',games:'الألعاب',messages:'الرسائل',more:'المزيد'},
    ru:{home:'Главная',members:'Участники',activities:'Мероприятия',games:'Игры',messages:'Сообщения',more:'Ещё'},
    tr:{home:'Ana Sayfa',members:'Üyeler',activities:'Etkinlikler',games:'Oyunlar',messages:'Mesajlar',more:'Daha Fazla'}
  };

  const ht = {
    'SCOUT HUB ONLINE':'SCOUT HUB ONLINE','Òganize • Aprann • Sèvi':'Òganize • Aprann • Sèvi','Bon retou, Scout 👋':'Bon retou, Scout 👋',
    'Tout sa ou bezwen, san w pa pèdi nan twòp meni.':'Tout sa ou bezwen, san w pa pèdi nan twòp meni.','Offline':'Offline','✨ Enskri':'✨ Enskri',
    '🎯 JODI A':'🎯 JODI A','Ki sa w vle fè?':'Ki sa w vle fè?','Aprann, jwe, kominike oswa òganize aktivite yo.':'Aprann, jwe, kominike oswa òganize aktivite yo.',
    'Aprann':'Aprann','Leson + recherche':'Leson + rechèch','Jwe':'Jwe','Mini-jeux Scout':'Mini-jeux Scout','Aktivite':'Aktivite','Planifye':'Planifye','Mesaj':'Mesaj','Tan reyèl':'Tan reyèl',
    'PROGRESSION':'PWOGRÈ','Kontinye avanti a':'Kontinye avanti a','Gade nivo, XP ak defi ou yo.':'Gade nivo, XP ak defi ou yo.','🏆 Gade pwogrè':'🏆 Gade pwogrè',
    'Manm':'Manm','Badges':'Badges','Tâches':'Tâches','État du service':'Eta sèvis','Tcheke koneksyon...':'Tcheke koneksyon...','Teste':'Teste','Internet:':'Entènèt:','Supabase:':'Supabase:','Session:':'Sesyon:','Realtime:':'Tan reyèl:','Cloud:':'Cloud:','Local:':'Lokal:','Teste 2 telefòn nan Sync Health si sa nesesè.':'Teste 2 telefòn nan Sync Health si sa nesesè.',
    'RAPID':'RAPID','Aksè rapid':'Aksè rapid','4 zouti ki pi itil yo.':'4 zouti ki pi itil yo.','Leson':'Leson','Aprann + rechèch':'Aprann + rechèch','Jwèt':'Jwèt','Aprann pandan w jwe':'Aprann pandan w jwe','Misyon':'Misyon','Mizik':'Mizik','Scout Music':'Mizik Scout','Scout IA':'Scout IA','Online + offline':'Anliy + offline','Progression':'Pwogrè',
    'Tout zouti':'Tout zouti','Jere manm gwoup la.':'Jere manm gwoup la.','+ Ajoute':'+ Ajoute','Planifye aktivite Scout yo.':'Planifye aktivite Scout yo.','Jwèt ak zouti Scout verifye.':'Jwèt ak zouti Scout verifye.','Eksplore mesaj yo san kont. Konekte pou voye yon mesaj.':'Eksplore mesaj yo san kont. Konekte pou voye yon mesaj.',
    'Chwazi yon manm':'Chwazi yon manm','Pa gen konvèsasyon chwazi':'Pa gen konvèsasyon chwazi','Fichye':'Fichye','Vwa':'Vwa','FICHYE / VIDÉO — LIMIT DOSYE SUPABASE':'FICHYE / VIDEYO — LIMIT DOSYE SUPABASE',
    'Kòd Mòs':'Kòd Mòs','Academy / Leson':'Academy / Leson','Compétences':'Compétences','Kalandriye':'Kalandriye','Anons':'Anons','Notifikasyon':'Notifikasyon','Pwofil':'Pwofil','Patwouy':'Patwouy','Defi':'Defi','Dashboard':'Dashboard','Jounal':'Jounal','Koneksyon sèvè':'Koneksyon sèvè','Sovgad':'Sovgad','Retabli':'Retabli','Lang':'Lang','Kont':'Kont','Créateur':'Créateur','About':'Sou aplikasyon an','⚠️ Zòn danje':'⚠️ Zòn danje','🗑️ Efase tout done':'🗑️ Efase tout done'
  };

  const fr = {
    'SCOUT HUB ONLINE':'SCOUT HUB EN LIGNE','Òganize • Aprann • Sèvi':'Organiser • Apprendre • Servir','Bon retou, Scout 👋':'Bon retour, Scout 👋','Tout sa ou bezwen, san w pa pèdi nan twòp meni.':'Tout ce dont tu as besoin, sans te perdre dans trop de menus.','Offline':'Hors ligne','✨ Enskri':'✨ S’inscrire',
    '🎯 JODI A':'🎯 AUJOURD’HUI','Ki sa w vle fè?':'Que veux-tu faire ?','Aprann, jwe, kominike oswa òganize aktivite yo.':'Apprendre, jouer, communiquer ou organiser des activités.','Aprann':'Apprendre','Leson + recherche':'Leçons + recherche','Jwe':'Jouer','Mini-jeux Scout':'Mini-jeux scouts','Aktivite':'Activités','Planifye':'Planifier','Mesaj':'Messages','Tan reyèl':'Temps réel','PROGRESSION':'PROGRESSION','Kontinye avanti a':'Continue ton aventure','Gade nivo, XP ak defi ou yo.':'Voir ton niveau, tes XP et tes défis.','🏆 Gade pwogrè':'🏆 Voir la progression',
    'Manm':'Membres','Badges':'Badges','Tâches':'Tâches','État du service':'État du service','Tcheke koneksyon...':'Vérification de la connexion...','Teste':'Tester','Internet:':'Internet :','Supabase:':'Supabase :','Session:':'Session :','Realtime:':'Temps réel :','Cloud:':'Cloud :','Local:':'Local :','Teste 2 telefòn nan Sync Health si sa nesesè.':'Teste la synchronisation sur 2 téléphones si nécessaire.',
    'RAPID':'RAPIDE','Aksè rapid':'Accès rapide','4 zouti ki pi itil yo.':'Les 4 outils les plus utiles.','Leson':'Leçons','Aprann + rechèch':'Apprendre + rechercher','Jwèt':'Jeux','Aprann pandan w jwe':'Apprendre en jouant','Misyon':'Mission','Mizik':'Musique','Scout Music':'Musique Scout','Scout IA':'IA Scout','Online + offline':'En ligne + hors ligne','Progression':'Progression',
    'Tout zouti':'Tous les outils','Jere manm gwoup la.':'Gérer les membres du groupe.','+ Ajoute':'+ Ajouter','Planifye aktivite Scout yo.':'Planifier les activités scouts.','Jwèt ak zouti Scout verifye.':'Jeux et outils scouts vérifiés.','Eksplore mesaj yo san kont. Konekte pou voye yon mesaj.':'Consulte les messages sans compte. Connecte-toi pour envoyer un message.',
    'Chwazi yon manm':'Choisir un membre','Pa gen konvèsasyon chwazi':'Aucune conversation sélectionnée','Fichye':'Fichier','Vwa':'Voix','FICHYE / VIDÉO — LIMIT DOSYE SUPABASE':'FICHIERS / VIDÉO — LIMITE DES FICHIERS SUPABASE',
    'Kòd Mòs':'Code Morse','Academy / Leson':'Académie / Leçons','Compétences':'Compétences','Kalandriye':'Calendrier','Anons':'Annonces','Notifikasyon':'Notifications','Pwofil':'Profil','Patwouy':'Patrouille','Defi':'Défis','Dashboard':'Tableau de bord','Jounal':'Journal','Koneksyon sèvè':'Connexion serveur','Sovgad':'Sauvegarde','Retabli':'Restaurer','Lang':'Langue','Kont':'Compte','Créateur':'Créateur','About':'À propos','⚠️ Zòn danje':'⚠️ Zone dangereuse','🗑️ Efase tout done':'🗑️ Supprimer toutes les données'
  };

  const en = {
    'SCOUT HUB ONLINE':'SCOUT HUB ONLINE','Òganize • Aprann • Sèvi':'Organize • Learn • Serve','Bon retou, Scout 👋':'Welcome back, Scout 👋','Tout sa ou bezwen, san w pa pèdi nan twòp meni.':'Everything you need without getting lost in too many menus.','Offline':'Offline','✨ Enskri':'✨ Sign up',
    '🎯 JODI A':'🎯 TODAY','Ki sa w vle fè?':'What do you want to do?','Aprann, jwe, kominike oswa òganize aktivite yo.':'Learn, play, communicate or organize activities.','Aprann':'Learn','Leson + recherche':'Lessons + research','Jwe':'Play','Mini-jeux Scout':'Scout mini-games','Aktivite':'Activities','Planifye':'Plan','Mesaj':'Messages','Tan reyèl':'Real time','PROGRESSION':'PROGRESS','Kontinye avanti a':'Continue your adventure','Gade nivo, XP ak defi ou yo.':'See your level, XP and challenges.','🏆 Gade pwogrè':'🏆 View progress',
    'Manm':'Members','Badges':'Badges','Tâches':'Tasks','État du service':'Service status','Tcheke koneksyon...':'Checking connection...','Teste':'Test','Internet:':'Internet:','Supabase:':'Supabase:','Session:':'Session:','Realtime:':'Realtime:','Cloud:':'Cloud:','Local:':'Local:','Teste 2 telefòn nan Sync Health si sa nesesè.':'Test Sync Health on 2 phones if needed.',
    'RAPID':'QUICK','Aksè rapid':'Quick access','4 zouti ki pi itil yo.':'The 4 most useful tools.','Leson':'Lessons','Aprann + rechèch':'Learn + research','Jwèt':'Games','Aprann pandan w jwe':'Learn while playing','Misyon':'Mission','Mizik':'Music','Scout Music':'Scout Music','Scout IA':'Scout AI','Online + offline':'Online + offline','Progression':'Progress',
    'Tout zouti':'All tools','Jere manm gwoup la.':'Manage the group members.','+ Ajoute':'+ Add','Planifye aktivite Scout yo.':'Plan Scout activities.','Jwèt ak zouti Scout verifye.':'Verified Scout games and tools.','Eksplore mesaj yo san kont. Konekte pou voye yon mesaj.':'Browse messages without an account. Sign in to send a message.',
    'Chwazi yon manm':'Choose a member','Pa gen konvèsasyon chwazi':'No conversation selected','Fichye':'File','Vwa':'Voice','FICHYE / VIDÉO — LIMIT DOSYE SUPABASE':'FILES / VIDEO — SUPABASE FILE LIMIT',
    'Kòd Mòs':'Morse Code','Academy / Leson':'Academy / Lessons','Compétences':'Skills','Kalandriye':'Calendar','Anons':'Announcements','Notifikasyon':'Notifications','Pwofil':'Profile','Patwouy':'Patrol','Defi':'Challenges','Dashboard':'Dashboard','Jounal':'Audit log','Koneksyon sèvè':'Server connection','Sovgad':'Backup','Retabli':'Restore','Lang':'Language','Kont':'Account','Créateur':'Creator','About':'About','⚠️ Zòn danje':'⚠️ Danger zone','🗑️ Efase tout done':'🗑️ Delete all data'
  };

  const es = {'Tout zouti':'Todas las herramientas','Aprann':'Aprender','Jwe':'Jugar','Aktivite':'Actividades','Mesaj':'Mensajes','Leson':'Lecciones','Jwèt':'Juegos','Mizik':'Música','Kòd Mòs':'Código Morse','Badges':'Insignias','Compétences':'Habilidades','Tâches':'Tareas','Kalandriye':'Calendario','Anons':'Anuncios','Notifikasyon':'Notificaciones','Pwofil':'Perfil','Pwogrè':'Progreso','Patwouy':'Patrulla','Defi':'Desafíos','Lang':'Idioma','Kont':'Cuenta','About':'Acerca de','Créateur':'Creador','Sovgad':'Copia de seguridad','Retabli':'Restaurar','Koneksyon sèvè':'Conexión del servidor','+ Ajoute':'+ Añadir','Planifye':'Planificar'};
  const zh = {'Tout zouti':'所有工具','Aprann':'学习','Jwe':'游戏','Aktivite':'活动','Mesaj':'消息','Leson':'课程','Jwèt':'游戏','Mizik':'音乐','Kòd Mòs':'摩斯电码','Badges':'徽章','Compétences':'技能','Tâches':'任务','Kalandriye':'日历','Anons':'公告','Notifikasyon':'通知','Pwofil':'个人资料','Pwogrè':'进度','Patwouy':'小队','Defi':'挑战','Lang':'语言','Kont':'账户','About':'关于','Créateur':'创建者','Sovgad':'备份','Retabli':'恢复','Koneksyon sèvè':'服务器连接','+ Ajoute':'+ 添加','Planifye':'计划'};

  const gameText = {
    'Quiz Scout':'Quiz Scout','KnotCraft':'KnotCraft','Game Maps IRL':'Game Maps IRL','Jwèt Scout':'Jeux scouts','Jwe nan app la oswa ouvri jwèt Scout ki sou Google Play.':'Joue dans l’app ou ouvre des jeux scouts sur Google Play.','📲 Jwèt sou Google Play':'📲 Jeux sur Google Play','🎮 Mini-jeux SCOUT HUB':'🎮 Mini-jeux SCOUT HUB','Ouvri Play Store':'Ouvrir le Play Store','Jwe kounye a':'Jouer maintenant','SCOUT PLAYGROUND':'AIRE DE JEUX SCOUT','Teste konesans ou dirèkteman nan SCOUT HUB.':'Teste tes connaissances directement dans SCOUT HUB.','Dekode mesaj Morse yo pi vit.':'Décode des messages Morse plus vite.','Chwazi bon direksyon an nan sitiyasyon Scout.':'Choisis la bonne direction dans une situation scout.','Aprann ki ne ki adapte ak chak travay.':'Apprends quel nœud convient à chaque tâche.','Jwenn pè tèm Scout yo.':'Trouve les paires de termes scouts.','Quiz fini!':'Quiz terminé !','Rekòmanse':'Recommencer','Ki ne ou vle aprann?':'Quel nœud veux-tu apprendre ?','Chèche yon demonstrasyon':'Chercher une démonstration','Jwenn pè yo':'Trouve les paires','60+ nœuds gratuits pour camping, escalade, voile et pêche.':'60+ nœuds gratuits pour camping, escalade, voile et pêche.'
  };
  Object.assign(fr,gameText);
  Object.assign(en,{
    'Jwèt Scout':'Scout Games','Jwe nan app la oswa ouvri jwèt Scout ki sou Google Play.':'Play in the app or open Scout games on Google Play.','📲 Jwèt sou Google Play':'📲 Games on Google Play','🎮 Mini-jeux SCOUT HUB':'🎮 SCOUT HUB mini-games','Ouvri Play Store':'Open Play Store','Jwe kounye a':'Play now','SCOUT PLAYGROUND':'SCOUT PLAYGROUND','Teste konesans ou dirèkteman nan SCOUT HUB.':'Test your knowledge directly in SCOUT HUB.','Dekode mesaj Morse yo pi vit.':'Decode Morse messages faster.','Chwazi bon direksyon an nan sitiyasyon Scout.':'Choose the correct direction in a Scout situation.','Aprann ki ne ki adapte ak chak travay.':'Learn which knot fits each task.','Jwenn pè tèm Scout yo.':'Find matching Scout term pairs.','Quiz fini!':'Quiz complete!','Rekòmanse':'Restart','Ki ne ou vle aprann?':'Which knot do you want to learn?','Chèche yon demonstrasyon':'Find a demonstration','Jwenn pè yo':'Find the pairs'
  });
  Object.assign(es,{'Jwèt Scout':'Juegos Scout','Jwe nan app la oswa ouvri jwèt Scout ki sou Google Play.':'Juega en la app o abre juegos Scout en Google Play.','📲 Jwèt sou Google Play':'📲 Juegos en Google Play','🎮 Mini-jeux SCOUT HUB':'🎮 Minijuegos SCOUT HUB','Ouvri Play Store':'Abrir Play Store','Jwe kounye a':'Jugar ahora'});
  Object.assign(zh,{'Jwèt Scout':'童军游戏','Jwe nan app la oswa ouvri jwèt Scout ki sou Google Play.':'在应用中游玩，或打开 Google Play 上的童军游戏。','📲 Jwèt sou Google Play':'📲 Google Play 游戏','🎮 Mini-jeux SCOUT HUB':'🎮 SCOUT HUB 小游戏','Ouvri Play Store':'打开 Play 商店','Jwe kounye a':'立即游玩'});
  const maps={ht,fr,en,es,zh};
  Object.keys(nav).forEach(l=>{ if(!maps[l]) maps[l]={...en}; });

  function sourceFor(node){
    if(!node.__scoutI18nSource) node.__scoutI18nSource=node.nodeValue;
    return node.__scoutI18nSource.trim();
  }
  function translateText(text,lang){
    const m=maps[lang]||maps.en;
    return m[text] || (maps.en[text]||text);
  }
  function walk(root,lang){
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n=>{
      if(n.parentElement?.closest('script,style,textarea,input,select,option')) return;
      const src=sourceFor(n); const trimmed=src.trim(); if(!trimmed)return;
      const translated=translateText(trimmed,lang); if(translated!==trimmed){
        const lead=src.match(/^\s*/)?.[0]||'', tail=src.match(/\s*$/)?.[0]||'';
        n.nodeValue=lead+translated+tail;
      }
    });
    root.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el=>{
      if(!el.dataset.i18nSource) el.dataset.i18nSource=el.placeholder;
      el.placeholder=translateText(el.dataset.i18nSource,lang);
    });
    root.querySelectorAll('[data-i18n]').forEach(el=>{
      const key=el.dataset.i18n; el.textContent=translateText(key,lang);
    });
  }
  let observer=null;
  function apply(){
    const lang=StorageService.settings().language||'ht';
    document.documentElement.lang=lang;
    const m=nav[lang]||nav.ht;
    document.querySelectorAll('.nav-btn').forEach(b=>{const sp=b.querySelector('span');const k=b.dataset.action;if(sp&&m[k])sp.textContent=m[k]});
    walk(document.body,lang);
    if(!observer){
      observer=new MutationObserver(records=>{
        if(window.__scoutI18nBusy)return;
        const active=StorageService.settings().language||'ht';
        window.__scoutI18nBusy=true;
        try{ for(const r of records) for(const n of r.addedNodes) if(n.nodeType===1) walk(n,active); } finally { window.__scoutI18nBusy=false; }
      });
      observer.observe(document.body,{childList:true,subtree:true});
    }
  }
  return {apply,translateText};
})();
