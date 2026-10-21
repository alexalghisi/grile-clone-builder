CREATE OR REPLACE FUNCTION public.save_daily_question_batch(p_subject uuid, p_day date, p_batch integer, p_rows jsonb)
RETURNS integer LANGUAGE plpgsql SET search_path = public AS $$
DECLARE q jsonb; n integer := 0; added integer; i integer := 0; sim_id uuid; subj public.subjects; sim_slug text; sess text := 'Exersare zilnică '||p_day;
BEGIN
SELECT * INTO STRICT subj FROM public.subjects WHERE id=p_subject;
FOR q IN SELECT value FROM jsonb_array_elements(p_rows) LOOP
INSERT INTO public.questions(subject_id,question_text,options,correct_index,explanation,solution_md,difficulty,session,generation_key)
VALUES(p_subject,q->>'intrebare',q->'variante',ascii(q->>'raspuns_corect')-65,q->>'explicatie',q->>'explicatie','hard',sess,p_subject||':'||p_day||':'||p_batch||':'||i)
ON CONFLICT DO NOTHING;
GET DIAGNOSTICS added = ROW_COUNT; n:=n+added; i:=i+1;
END LOOP;
IF p_batch=4 THEN
SELECT count(*) INTO added FROM public.questions WHERE subject_id=p_subject AND session=sess;
IF added=50 THEN
SELECT id INTO sim_id FROM public.simulations WHERE subject_id=p_subject AND session=sess LIMIT 1;
IF sim_id IS NULL THEN
sim_slug:=subj.slug||'-zilnic-'||p_day;
IF EXISTS(SELECT 1 FROM public.simulations WHERE slug=sim_slug) THEN
sim_slug:=subj.slug||'-'||left(replace(p_subject::text,'-',''),8)||'-zilnic-'||p_day;
END IF;
INSERT INTO public.simulations(university_id,subject_id,slug,title,session,description,duration_minutes,total_questions,is_premium)
VALUES(subj.university_id,p_subject,sim_slug,'Simulare '||subj.name||' · '||p_day,sess,'Test de antrenament cu 50 de întrebări avansate și explicații. Nu reprezintă un examen oficial.',100,50,false)
RETURNING id INTO sim_id;
END IF;
INSERT INTO public.simulation_questions(simulation_id,question_id,order_index)
SELECT sim_id,id,row_number() OVER(ORDER BY generation_key)-1 FROM public.questions WHERE subject_id=p_subject AND session=sess
ON CONFLICT(simulation_id,question_id) DO NOTHING;
END IF;
END IF;
RETURN n;
END $$;
REVOKE ALL ON FUNCTION public.save_daily_question_batch(uuid,date,integer,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.save_daily_question_batch(uuid,date,integer,jsonb) TO service_role;