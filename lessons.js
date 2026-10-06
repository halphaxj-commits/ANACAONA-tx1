/* SCOUT HUB V30.1 — cloud + real offline lesson catalog */
const Lessons = (function () {
  let catalog = [];
  let progressMap = {};
  let loaded = false;
  const defs = [
    ['Morse — Debaz','Aprann pwen, tirè ak ritm son Morse.','Communication'],['Nœuds debaz','Aprann 3 nœuds tout Scout dwe konnen.','Compétences'],['Orantasyon','Aprann li kat, pwen kadinal ak pwen referans.','Orientation'],['Sekirite nan kan','Règ debaz pou yon kan san danje.','Sécurité'],['Oryantasyon ak Kat','Konprann kat ak boussòl.','Compétences'],['Direction','Metrize nò, sid, lès ak lwès.','Orientation'],['Camping','Baz preparasyon ak òganizasyon yon kan Scout.','Camping'],['Fire & Safety','Prensip sekirite pou aktivite Scout yo.','Safety'],['Knots','Dekouvri epi pratike ne Scout debaz yo.','Scout Skills'],['Premye swen — Debaz','Rekonèt prensip debaz pou chèche èd ak rete an sekirite.','Safety'],['Nature','Obsève epi respekte lanati ak anviwònman an.','Nature'],['Trail Signs','Aprann rekonèt siy santye ak mak Scout yo.','Navigation'],['Communication','Amelyore kominikasyon ak transmisyon enfòmasyon.','Communication'],['Teamwork','Devlope kolaborasyon ak lespri ekip.','Leadership'],['Leadership','Devlope responsablite ak lidèchip Scout.','Leadership'],['Scout Values','Respè, sèvis, disiplin ak responsablite.','Values'],['Kòd Scout','Prensip ak valè ki gide lavi Scout.','Values']
  ];
  const LOCAL = defs.map((x,i)=>({id:'local-lesson-'+(i+1),title:x[0],description:x[1],category:x[2],sort_order:i+1,source:'local',steps:[
    {id:'local-'+(i+1)+'-1',step_number:1,title:'Konprann baz la',content:x[1]+' Kòmanse ak konsèp prensipal yo epi konprann poukisa yo itil nan lavi Scout.'},
    {id:'local-'+(i+1)+'-2',step_number:2,title:'Aprann epi pratike',content:'Li prensip yo, fè yon ti egzanp epi pratike sa ou aprann nan yon fason ki apwopriye. Lè sa nesesè, mande yon chèf oswa yon granmoun sipèvizyon.'},
    {id:'local-'+(i+1)+'-3',step_number:3,title:'Defi Scout',content:'Eksplike sa ou aprann ak pwòp mo pa w, verifye sa ki pa klè epi chwazi yon ti egzèsis pou ranfòse konesans ou.'}
  ],quiz:[]}));
  async function sb(){return SupabaseClient.get()}
  function localProgress(){try{return JSON.parse(localStorage.getItem('scoutHub.lessonProgress')||'{}')}catch{return {}}}
  function saveLocalProgress(){try{localStorage.setItem('scoutHub.lessonProgress',JSON.stringify(progressMap))}catch{}}
  function mergeCloud(cloud){const byTitle=new Map(cloud.map(x=>[String(x.title).toLowerCase(),x]));catalog=LOCAL.map(l=>byTitle.get(l.title.toLowerCase())||l);for(const c of cloud)if(!catalog.some(x=>x.id===c.id))catalog.push(c)}
  async function loadAll(){
    progressMap={...localProgress()};
    try{
      const client=await sb();
      const [{data:lessonsData},{data:stepsData},{data:quizData}]=await Promise.all([client.from('lessons').select('*').order('sort_order'),client.from('lesson_steps').select('*').order('step_number'),client.from('lesson_quiz_questions').select('*').order('sort_order')]);
      const cloud=(lessonsData||[]).map(l=>({...l,source:'cloud',steps:(stepsData||[]).filter(s=>s.lesson_id===l.id),quiz:(quizData||[]).filter(q=>q.lesson_id===l.id)}));
      mergeCloud(cloud);
      const my=SyncEngine.getMyMemberId();
      if(my){const {data}=await client.from('member_lesson_progress').select('*').eq('member_id',my);(data||[]).forEach(p=>progressMap[p.lesson_id]=p)}
    }catch{catalog=LOCAL}
    if(!catalog.length)catalog=LOCAL;saveLocalProgress();loaded=true;
  }
  function getCatalog(){return catalog} function getLesson(id){return catalog.find(l=>String(l.id)===String(id))} function getProgress(id){return progressMap[id]||null} function isLoaded(){return loaded}
  async function saveStep(lessonId,stepNumber){const my=SyncEngine.getMyMemberId();progressMap[lessonId]={...(progressMap[lessonId]||{}),current_step:stepNumber,completed:false};saveLocalProgress();if(!my||String(lessonId).startsWith('local-'))return;try{const client=await sb();await client.from('member_lesson_progress').upsert({member_id:my,lesson_id:lessonId,current_step:stepNumber,completed:false})}catch{}}
  async function saveQuizResult(lessonId,totalSteps,score,total){const my=SyncEngine.getMyMemberId();const payload={...(progressMap[lessonId]||{}),current_step:totalSteps,completed:true,completed_at:new Date().toISOString(),quiz_score:score,quiz_total:total};progressMap[lessonId]=payload;saveLocalProgress();if(!my||String(lessonId).startsWith('local-'))return;try{const client=await sb();await client.from('member_lesson_progress').upsert({...payload,member_id:my,lesson_id:lessonId})}catch{}}
  return {loadAll,getCatalog,getLesson,getProgress,isLoaded,saveStep,saveQuizResult};
})();
