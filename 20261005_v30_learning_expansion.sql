-- SCOUT HUB V30 — learning expansion
-- Safe: only adds steps to lessons that previously had exactly one step.
-- Existing lesson IDs and progress are preserved.
do $$
declare r record; begin
  for r in
    select l.id,l.title,coalesce(max(s.step_number),0) as last_step,count(s.id) as step_count
    from public.lessons l left join public.lesson_steps s on s.lesson_id=l.id
    group by l.id,l.title
  loop
    if r.step_count=1 then
      case r.title
        when 'Morse — Debaz' then
          insert into public.lesson_steps(lesson_id,step_number,title,content) values
          (r.id,r.last_step+1,'Pwen, tirè ak ritm','Nan Morse, yon pwen ak yon tirè fòme modèl ki reprezante yon lèt oswa yon chif. Pratike kèk karaktè alafwa epi konsantre sou ritm lan.'),
          (r.id,r.last_step+2,'Koute epi voye mesaj','Fè mesaj yo kout epi klè. Yon bon kominikasyon mande pou moun k ap voye a ak moun k ap resevwa a dakò sou fason y ap separe lèt ak mo yo.'),
          (r.id,r.last_step+3,'Pratik Scout','Decode yon ti mesaj Scout, verifye repons lan ak yon patnè epi repete karaktè ki te pi difisil yo.');
        when 'Orantasyon' then
          insert into public.lesson_steps(lesson_id,step_number,title,content) values
          (r.id,r.last_step+1,'Kat la ak lejand li','Gade tit kat la, lejand li, echèl li ak direksyon nò a anvan ou kòmanse.'),
          (r.id,r.last_step+2,'Pwen referans','Chwazi pwen ki fasil pou rekonèt tankou yon wout, yon bilding oswa yon gwo eleman natirèl.'),
          (r.id,r.last_step+3,'Planifye yon trajè','Trase yon trajè senp sou kat la epi pataje plan an ak chèf la oswa gwoup la.');
        when 'Direction' then
          insert into public.lesson_steps(lesson_id,step_number,title,content) values
          (r.id,r.last_step+1,'Kat pwen prensipal','Nò, Sid, Lès ak Lwès se kat pwen kadinal yo.'),
          (r.id,r.last_step+2,'Pwen entèmedyè','Nò-Lès, Sid-Lès, Sid-Lwès ak Nò-Lwès sitiye ant pwen kadinal yo.'),
          (r.id,r.last_step+3,'Verifye direksyon','Konpare kat la, pwen referans yo ak bousòl la lè ou genyen youn.');
        when 'Camping' then
          insert into public.lesson_steps(lesson_id,step_number,title,content) values
          (r.id,r.last_step+1,'Prepare anvan ou pati','Fè yon lis ekipman, verifye kondisyon meteyo, konnen règ kote a epi fè yon plan kominikasyon.'),
          (r.id,r.last_step+2,'Òganizasyon kan','Bay chak ekip yon zòn ak yon responsablite klè. Kenbe pasaj yo pwòp epi make ekipman yo.'),
          (r.id,r.last_step+3,'Respè anviwònman','Pa detwi plant, pa deranje bèt epi suiv règ lokal sou fatra ak dlo.');
        when 'Fire & Safety' then
          insert into public.lesson_steps(lesson_id,step_number,title,content) values
          (r.id,r.last_step+1,'Règ anvan aktivite','Nenpòt aktivite ki gen dife dwe fèt selon règ gwoup la ak sipèvizyon yon granmoun oswa chèf ki responsab.'),
          (r.id,r.last_step+2,'Konnen risk yo','Idantifye sous danje tankou chalè, lafimen, materyèl ki ka pran dife ak kondisyon van. Objektif la se prevansyon.'),
          (r.id,r.last_step+3,'Plan ijans','Tout moun dwe konnen kiyès pou rele, kote pou rasanble ak ki moun ki responsab.');
        when 'Knots' then
          insert into public.lesson_steps(lesson_id,step_number,title,content) values
          (r.id,r.last_step+1,'Chwazi bon ne a','Diferan nœuds gen diferan objektif. Aprann non yo, itilizasyon yo ak limit yo.'),
          (r.id,r.last_step+2,'Verifye kalite kòd la','Yon kòd ki domaje pa dwe itilize pou yon aktivite kote li ta ka mete yon moun an danje.'),
          (r.id,r.last_step+3,'Pratike ak sipèvizyon','Pratike sou materyèl ki apwopriye epi fè yon Scout ki gen eksperyans verifye travay la.');
        when 'Premye swen — Debaz' then
          insert into public.lesson_steps(lesson_id,step_number,title,content) values
          (r.id,r.last_step+1,'Premye bagay pou fè','Rete kalm epi verifye si kote a an sekirite. Chèche yon granmoun oswa yon moun ki fòme.'),
          (r.id,r.last_step+2,'Chèche èd','Bay enfòmasyon klè sou sa ki rive, kote nou ye ak ki moun ki bezwen èd.'),
          (r.id,r.last_step+3,'Aprann nan fòmasyon','Premye swen dwe aprann nan yon fòmasyon apwopriye; app la pa ranplase fòmasyon pwofesyonèl.');
        when 'Nature' then
          insert into public.lesson_steps(lesson_id,step_number,title,content) values
          (r.id,r.last_step+1,'Obsève san deranje','Gade plant ak bèt yo nan distans ki apwopriye epi evite deranje yo.'),
          (r.id,r.last_step+2,'Pwoteje dlo ak tè','Pa jete fatra nan rivyè oswa sou tè a; suiv règ lokal yo.'),
          (r.id,r.last_step+3,'Jounal lanati','Ekri sa ou obsève, kote ou wè li ak dat la pou devlope konesans sou anviwònman an.');
        when 'Trail Signs' then
          insert into public.lesson_steps(lesson_id,step_number,title,content) values
          (r.id,r.last_step+1,'Li siy yo nan kontèks','Siy santye yo ka varye selon gwoup oswa zòn. Aprann sistèm chèf ou yo itilize a.'),
          (r.id,r.last_step+2,'Kominike san konfizyon','Eksplike siy yo ak mo klè epi verifye si lòt Scout yo konprann menm bagay la.'),
          (r.id,r.last_step+3,'Pratike obsèvasyon','Note chanjman nan santye ak pwen referans san w pa deplase oswa detwi siy yo.');
        when 'Communication' then
          insert into public.lesson_steps(lesson_id,step_number,title,content) values
          (r.id,r.last_step+1,'Koute anvan ou reponn','Koute mesaj la, poze kestyon si li pa klè epi repete enfòmasyon enpòtan yo.'),
          (r.id,r.last_step+2,'Mesaj klè','Yon mesaj Scout ta dwe kout, presi epi bay enfòmasyon moun nan bezwen.'),
          (r.id,r.last_step+3,'Kominikasyon an ekip','Chwazi yon moun pou verifye enfòmasyon enpòtan yo epi asire ekip la resevwa menm mesaj la.');
        when 'Teamwork' then
          insert into public.lesson_steps(lesson_id,step_number,title,content) values
          (r.id,r.last_step+1,'Pataje responsablite','Yon ekip mache pi byen lè chak moun konnen wòl li epi ede patnè ki bloke.'),
          (r.id,r.last_step+2,'Respè opinyon','Koute lide lòt moun menm lè ou pa dakò epi chèche yon solisyon pou ekip la.'),
          (r.id,r.last_step+3,'Evalye apre aktivite','Apre yon aktivite, mande sa ki te mache, sa ki te difisil ak sa ekip la ka amelyore.');
        when 'Leadership' then
          insert into public.lesson_steps(lesson_id,step_number,title,content) values
          (r.id,r.last_step+1,'Lidè a montre egzanp','Yon bon lidè respekte règ yo, koute ekip la epi pran responsabilite.'),
          (r.id,r.last_step+2,'Pran bon desizyon','Gade sekirite, objektif aktivite a ak bezwen ekip la anvan ou aji.'),
          (r.id,r.last_step+3,'Fè lòt moun grandi','Bay lòt Scout opòtinite pou aprann, pran ti responsabilite epi jwenn bon fidbak.');
        when 'Scout Values' then
          insert into public.lesson_steps(lesson_id,step_number,title,content) values
          (r.id,r.last_step+1,'Respè','Trete moun, lanati ak ekipman yo ak konsiderasyon nan fason ou pale ak aji.'),
          (r.id,r.last_step+2,'Sèvis','Sèvis se ede kominote a san chèche sèlman rekonpans.'),
          (r.id,r.last_step+3,'Responsablite','Respekte angajman ou, rekonèt erè ou epi chèche fason pou korije yo.');
        when 'Kòd Scout' then
          insert into public.lesson_steps(lesson_id,step_number,title,content) values
          (r.id,r.last_step+1,'Viv prensip yo','Kòd Scout la pran sans lè ou aplike respè, sèvis, disiplin ak solidarite.'),
          (r.id,r.last_step+2,'Nan ekip la','Pale ak respè, kenbe pwomès, ede lòt moun epi pran swen sa gwoup la pataje.'),
          (r.id,r.last_step+3,'Defi pèsonèl','Chwazi yon ti aksyon pou mete yon valè Scout an pratik pandan semèn nan.');
        else null;
      end case;
    end if;
  end loop;
end $$;
