import { Link } from "@tanstack/react-router";
import { QuestionContent } from "@/components/QuestionContent";
import { letter, type SubiectRezolvat } from "@/lib/subiect-rezolvat";

export function SubiectRezolvatView({ s }: { s: SubiectRezolvat }) {
  return (
    <article className="max-w-none">
      <p className="text-sm uppercase tracking-wide text-primary mb-2">Subiect rezolvat · {s.materie}</p>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{s.title}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{s.intro}</p>
      <nav aria-label="Cuprins" className="mt-6 rounded-md border p-4 text-sm">
        <p className="font-semibold mb-2">Întrebări</p>
        <ol className="grid sm:grid-cols-2 gap-1 list-decimal pl-5">
          {s.intrebari.map((_, i) => <li key={i}><a href={`#intrebarea-${i + 1}`} className="hover:underline">Întrebarea {i + 1}</a></li>)}
        </ol>
      </nav>
      {s.intrebari.map((q, i) => (
        <section key={i} id={`intrebarea-${i + 1}`} className="mt-10 scroll-mt-20 border-t pt-8">
          <h2 className="text-2xl font-semibold">Întrebarea {i + 1}</h2>
          <div className="mt-3"><QuestionContent text={q.enunt} /></div>
          <ol className="mt-4 space-y-2">
            {q.variante.map((v, j) => (
              <li key={j} className={`flex gap-2 rounded-md border p-3 ${j === q.corect ? "border-primary bg-primary/5" : ""}`}>
                <span className="font-semibold">{letter(j)})</span>
                <QuestionContent text={v} />
              </li>
            ))}
          </ol>
          <p className="mt-4 font-semibold">Răspuns corect: {letter(q.corect)}</p>
          <h3 className="mt-5 text-lg font-semibold">Rezolvare pas cu pas</h3>
          <div className="mt-2"><QuestionContent text={q.rezolvare} /></div>
          <h3 className="mt-5 text-lg font-semibold">De ce este corect {letter(q.corect)} și de ce celelalte variante sunt greșite</h3>
          <div className="mt-2"><QuestionContent text={q.de_ce} /></div>
        </section>
      ))}
      <section className="mt-12 rounded-md bg-muted/40 p-4 text-sm">
        <h2 className="text-lg font-semibold mb-2">Exersează {s.materie}</h2>
        <ul className="list-disc pl-5 space-y-1">
          {s.subject_slug && <li><Link to="/quiz/$slug" params={{ slug: s.subject_slug }} className="underline">Grile de {s.materie} pentru admitere</Link></li>}
          <li><Link to="/simulare" className="underline">Simulări de admitere cronometrate</Link></li>
          <li><Link to="/grile" className="underline">Toate grilele pe universități</Link></li>
        </ul>
      </section>
    </article>
  );
}
