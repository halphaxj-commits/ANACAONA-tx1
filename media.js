const Media=(()=> {
  const BUCKET = 'scout-media';
  const PROJECT_ID = 'rapwjcyjudvbpputwwcu';

  function kind(file){
    if(file.type.startsWith('image/')) return 'image';
    if(file.type.startsWith('video/')) return 'video';
    if(file.type.startsWith('audio/')) return 'audio';
    return 'file';
  }

  function human(n){
    if(n < 1024) return `${n} B`;
    if(n < 1024**2) return `${(n/1024).toFixed(1)} KB`;
    if(n < 1024**3) return `${(n/1024**2).toFixed(1)} MB`;
    return `${(n/1024**3).toFixed(2)} GB`;
  }

  function safeName(name){
    return String(name || 'file').replace(/[^A-Za-z0-9._,'!$&()+;=@? -]/g,'_').slice(0,180);
  }

  async function uploadResumable(file, onProgress){
    const client = await SupabaseClient.get();
    const {data:{session}} = await client.auth.getSession();
    if(!session?.access_token) throw new Error('Konekte pou voye fichye.');
    if(typeof tus === 'undefined') throw new Error('Upload engine pa chaje. Verifye Internet la.');

    const uid = session.user.id;
    const path = `${uid}/chat/${Date.now()}-${Utils.uid()}-${safeName(file.name)}`;
    const endpoint = `https://${PROJECT_ID}.storage.supabase.co/storage/v1/upload/resumable`;

    return await new Promise((resolve,reject)=>{
      const upload = new tus.Upload(file,{
        endpoint,
        chunkSize: 6*1024*1024,
        retryDelays:[0,3000,5000,10000,20000],
        uploadDataDuringCreation:true,
        removeFingerprintOnSuccess:true,
        headers:{
          authorization:`Bearer ${session.access_token}`,
          apikey:SCOUT_HUB_CONFIG.SUPABASE_PUBLISHABLE_KEY,
          'x-upsert':'false'
        },
        metadata:{
          bucketName:BUCKET,
          objectName:path,
          contentType:file.type || 'application/octet-stream',
          cacheControl:'3600'
        },
        onError:reject,
        onProgress:(bytesUploaded,bytesTotal)=>{
          onProgress(bytesTotal ? bytesUploaded/bytesTotal : 0, bytesUploaded, bytesTotal);
        },
        onSuccess:()=>resolve({path})
      });

      upload.findPreviousUploads().then(previous=>{
        if(previous.length) upload.resumeFromPreviousUpload(previous[0]);
        upload.start();
      }).catch(reject);
    });
  }

  function preview(file){
    const box=document.getElementById('mediaPreview');
    if(!box)return;
    const url=URL.createObjectURL(file);
    const k=kind(file);
    box.innerHTML=`
      <div class="media-upload-card">
        <div class="media-upload-icon">${k==='video'?'🎬':k==='image'?'🖼️':k==='audio'?'🎵':'📎'}</div>
        <div class="media-upload-info">
          <strong>${Utils.esc(file.name)}</strong>
          <small>${human(file.size)} • ${k.toUpperCase()}</small>
        </div>
        <button type="button" id="sendMediaBtn" class="primary-btn">Voye</button>
      </div>
      ${k==='image'?`<img class="media-local-preview" src="${url}" alt="Preview">`:''}
      ${k==='video'?`<video class="media-local-preview" src="${url}" controls muted></video>`:''}
      <div class="media-progress"><i id="mediaProgressBar"></i></div>
      <small id="mediaProgressText">Pare pou voye</small>`;
    document.getElementById('sendMediaBtn').onclick=()=>sendFile(file);
  }

  async function sendFile(file){
    const btn=document.getElementById('sendMediaBtn');
    const bar=document.getElementById('mediaProgressBar');
    const text=document.getElementById('mediaProgressText');
    if(!file)return;
    btn.disabled=true;
    text.textContent='Upload ap kòmanse…';
    try{
      const uploaded=await uploadResumable(file,(p,u,t)=>{
        if(bar)bar.style.width=`${Math.round(p*100)}%`;
        if(text)text.textContent=`Upload ${Math.round(p*100)}% • ${human(u)} / ${human(t)}`;
      });
      const meta={
        path:uploaded.path,name:file.name,size:file.size,mime:file.type||'application/octet-stream'
      };
      await Chat.send(JSON.stringify(meta),kind(file));
      text.textContent='✅ Voye avèk siksè';
      if(bar)bar.style.width='100%';
      setTimeout(()=>document.getElementById('mediaPreview')?.replaceChildren(),800);
    }catch(err){
      console.error('[Media upload]',err);
      text.textContent=`❌ ${err?.message||'Upload echwe'}`;
      btn.disabled=false;
    }
  }

  function init(){
    document.getElementById('imageInput')?.addEventListener('change',e=>{
      const f=e.target.files?.[0];
      if(!f)return;
      preview(f);
      e.target.value='';
    });
  }
  return {init};
})();