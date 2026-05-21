
CREATE OR REPLACE FUNCTION public.recount_subject_questions()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.subjects SET question_count = (SELECT COUNT(*) FROM public.questions WHERE subject_id = OLD.subject_id) WHERE id = OLD.subject_id;
    RETURN OLD;
  ELSE
    UPDATE public.subjects SET question_count = (SELECT COUNT(*) FROM public.questions WHERE subject_id = NEW.subject_id) WHERE id = NEW.subject_id;
    IF TG_OP = 'UPDATE' AND OLD.subject_id <> NEW.subject_id THEN
      UPDATE public.subjects SET question_count = (SELECT COUNT(*) FROM public.questions WHERE subject_id = OLD.subject_id) WHERE id = OLD.subject_id;
    END IF;
    RETURN NEW;
  END IF;
END;$$;

DROP TRIGGER IF EXISTS trg_recount_questions ON public.questions;
CREATE TRIGGER trg_recount_questions
AFTER INSERT OR UPDATE OR DELETE ON public.questions
FOR EACH ROW EXECUTE FUNCTION public.recount_subject_questions();

-- Resync existing
UPDATE public.subjects s SET question_count = sub.c
FROM (SELECT subject_id, COUNT(*) AS c FROM public.questions GROUP BY subject_id) sub
WHERE s.id = sub.subject_id;
