// Editorial calendar for daily SEO-first blog articles.
// Each topic targets a real Romanian search intent. Seasonal topics are boosted in their months.

export type SeoTopic = {
  keyword: string; // primary keyword (as users search it)
  materie: string; // subject bucket shown on the site
  angle: string; // what the article must deliver
  months?: number[]; // 1-12, when this intent peaks; omit for evergreen
  links?: string[]; // internal paths to link to
};

export const SEO_TOPICS: SeoTopic[] = [
  // ---- Medicină / UMF ----
  { keyword: "cum să înveți pentru admitere la medicină", materie: "Biologie", angle: "plan concret pe săptămâni, surse, ritm de grile pe zi, greșeli de evitat", links: ["/grile", "/simulare"] },
  { keyword: "când să începi pregătirea pentru medicină", materie: "Biologie", angle: "plan pentru clasa a XI-a vs a XII-a, câte ore pe săptămână, ce materie prima", months: [9, 10, 11], links: ["/grile", "/profesori"] },
  { keyword: "plan de învățare 6 luni admitere medicină", materie: "Biologie", angle: "calendar lunar ianuarie–iulie, obiective măsurabile, simulări", months: [12, 1, 2], links: ["/simulare", "/grile"] },
  { keyword: "câte grile să rezolvi pe zi pentru admitere", materie: "Biologie", angle: "ritm realist pe etape, cum analizezi greșelile, când crești volumul", links: ["/grila-zilei", "/grile"] },
  { keyword: "greșeli frecvente la grilele de medicină", materie: "Biologie", angle: "top 10 capcane din enunțuri, variante-momeală, gestionarea timpului", links: ["/grile", "/simulare"] },
  { keyword: "manuale biologie admitere medicină", materie: "Biologie", angle: "ce manuale cer universitățile de medicină în general, cum le folosești eficient, fără a inventa ediții", months: [9, 10, 11, 12, 1], links: ["/grile"] },
  { keyword: "grile biologie admitere medicină pe capitole", materie: "Biologie", angle: "ghid pe capitole: celulă, țesuturi, sisteme; cum abordezi fiecare capitol la grilă", links: ["/grile"] },
  { keyword: "grile chimie organică admitere medicină", materie: "Chimie", angle: "cum înveți chimia organică pentru grile: nomenclatură, izomerie, reacții; exemple rezolvate", links: ["/grile"] },
  { keyword: "cum se calculează media de admitere la medicină", materie: "Biologie", angle: "formule generale (test grilă + eventual BAC), exemple numerice, diferențe între universități, fără a prezenta date neverificate ca oficiale", months: [5, 6, 7], links: ["/grile"] },
  { keyword: "tematică și bibliografie admitere UMF 2027", materie: "Biologie", angle: "cum citești tematica oficială, unde o găsești, cum îți faci planul după ea; nu inventa conținutul tematicii", months: [9, 10, 11, 12, 1, 2, 3], links: ["/grile", "/admitere"] },
  { keyword: "simulare admitere medicină online gratuit", materie: "Biologie", angle: "cum folosești simulările cronometrate, ce scor e bun în fiecare lună, cum interpretezi rezultatul", links: ["/simulare"] },
  { keyword: "admitere medicină militară grile", materie: "Biologie", angle: "ce diferă la medicina militară, structură generală, cum te pregătești; fără cifre neverificate", links: ["/grile"] },

  // ---- Politehnică / UPB / UTCN ----
  { keyword: "grile admitere Politehnica matematică", materie: "Matematică", angle: "capitolele cele mai frecvente, exemple de grile rezolvate, strategie de examen", links: ["/grile/upb", "/simulare"] },
  { keyword: "admitere Politehnica pe bază de dosar sau examen", materie: "Matematică", angle: "explică diferențele între variante de admitere, cum te pregătești în fiecare caz; fără a prezenta regulamente ca verificate", months: [1, 2, 3, 4, 5, 6], links: ["/admitere", "/grile/upb"] },
  { keyword: "admitere anticipată Politehnica 2027", materie: "Matematică", angle: "ce înseamnă admiterea anticipată, cum te pregătești, calendar orientativ; trimite la sursa oficială", months: [1, 2, 3, 4], links: ["/grile/upb"] },
  { keyword: "grile admitere UTCN rezolvate", materie: "Matematică", angle: "tipologia grilelor UTCN la matematică, metode rapide, exemple pas cu pas", links: ["/grile/utcn", "/grile"] },
  { keyword: "grile fizică admitere Politehnica", materie: "Fizică", angle: "mecanică, electricitate, optică: formule esențiale și exemple rezolvate", links: ["/grile/upb"] },
  { keyword: "simulare admitere Politehnica online", materie: "Matematică", angle: "cum arată un test de antrenament, gestionarea timpului, analiza greșelilor", links: ["/simulare"] },
  { keyword: "subiecte admitere UBB mate-info rezolvate", materie: "Matematică", angle: "structura probei scrise UBB la matematică/informatică, cum abordezi problemele, exemple", links: ["/grile/ubb", "/subiecte-admitere"] },
  { keyword: "grile informatică admitere C++", materie: "Informatică", angle: "tipuri de grile cu cod C++, cum urmărești execuția, capcane cu pointeri și recursivitate; exemple", links: ["/grile", "/grila-zilei"] },
  { keyword: "algoritmi pentru admitere informatică", materie: "Informatică", angle: "algoritmi elementari care apar la grile: sortări, căutări, backtracking, divide et impera; exemple", links: ["/grile"] },

  // ---- ASE / economie ----
  { keyword: "admitere ASE 2027 ce se dă", materie: "Economie", angle: "tipuri de admitere la ASE (eseu, test grilă, dosar) explicate general, cum te pregătești pentru fiecare; trimite la sursa oficială", months: [1, 2, 3, 4, 5, 6, 7], links: ["/grile/ase", "/admitere"] },
  { keyword: "grile admitere ASE matematică", materie: "Matematică", angle: "capitole de liceu relevante pentru ASE, exemple de grile rezolvate", links: ["/grile/ase"] },
  { keyword: "grile economie admitere ASE", materie: "Economie", angle: "noțiuni cheie din economie de liceu care apar la grile, exemple cu explicații", links: ["/grile/ase"] },
  { keyword: "ASE cibernetică admitere test scris", materie: "Matematică", angle: "specificul probei scrise la CSIE, ce capitole de matematică contează, plan de pregătire", months: [2, 3, 4, 5, 6], links: ["/grile/ase"] },

  // ---- Drept / Poliție ----
  { keyword: "grile admitere Drept rezolvate explicate", materie: "Limba română", angle: "gramatică și logică pentru admiterea la Drept: tipuri de grile, exemple explicate", links: ["/grile", "/simulare"] },
  { keyword: "admitere Drept 2027 ce se dă", materie: "Logică", angle: "structura generală a examenelor la Drept (română, logică, economie după caz), plan de pregătire; trimite la sursa oficială", months: [1, 2, 3, 4, 5, 6, 7], links: ["/grile", "/admitere"] },
  { keyword: "grile logică admitere Drept", materie: "Logică", angle: "silogisme, raționamente, erori de logică — teorie scurtă + 5 exemple rezolvate", links: ["/grile"] },
  { keyword: "admitere Academia de Poliție 2027 condiții și probe", materie: "Istorie", angle: "etapele generale (dosar, probă sportivă, test grilă), cum te pregătești la istorie/română/limbi; fără cifre neverificate", months: [1, 2, 3, 4, 5, 6, 7], links: ["/grile", "/admitere"] },
  { keyword: "grile istorie admitere Academia de Poliție", materie: "Istorie", angle: "perioade și teme frecvente, metodă de memorare, exemple de grile cu explicații", links: ["/grile"] },
  { keyword: "grile limba română admitere Poliție", materie: "Limba română", angle: "ortografie, punctuație, morfologie, sintaxă: capcanele clasice + exemple", links: ["/grile"] },

  // ---- BAC ----
  { keyword: "subiecte BAC 2026 rezolvate", materie: "Matematică", angle: "cum folosești subiectele din 2026 pentru pregătirea 2027, ce tipuri de cerințe se repetă", months: [6, 7, 8, 9, 10], links: ["/subiecte-bac"] },
  { keyword: "modele subiecte BAC 2027", materie: "Limba română", angle: "cum lucrezi cu modelele oficiale, structura probei, plan de pregătire pe luni", months: [10, 11, 12, 1, 2], links: ["/subiecte-bac"] },
  { keyword: "simulare BAC 2027 subiecte", materie: "Matematică", angle: "la ce să te aștepți la simularea din martie, cum te pregătești în 8 săptămâni", months: [1, 2, 3], links: ["/subiecte-bac", "/simulare"] },
  { keyword: "calendar BAC 2027", materie: "Limba română", angle: "etapele generale ale examenului și cum îți planifici pregătirea în jurul lor; trimite la calendarul oficial pentru date exacte", months: [9, 10, 11, 12, 1, 2, 3, 4, 5], links: ["/subiecte-bac"] },
  { keyword: "BAC matematică M1 formule esențiale", materie: "Matematică", angle: "lista formulelor și cum le aplici la subiectele tipice; exemple rezolvate", links: ["/subiecte-bac"] },
  { keyword: "BAC română eseu argumentativ structură", materie: "Limba română", angle: "structura textului argumentativ, conectori, exemplu complet comentat", links: ["/subiecte-bac"] },
  { keyword: "BAC informatică C++ subiecte tip", materie: "Informatică", angle: "tipurile de cerințe de la BAC informatică, greșeli frecvente, exemple rezolvate", links: ["/subiecte-bac"] },
  { keyword: "BAC biologie anatomie subiecte rezolvate", materie: "Anatomie", angle: "cum abordezi subiectul III, scheme de învățare pe sisteme, exemple", links: ["/subiecte-bac"] },
  { keyword: "BAC fizică formule mecanică", materie: "Fizică", angle: "formulele de mecanică și metoda de rezolvare la probleme tip BAC", links: ["/subiecte-bac"] },
  { keyword: "BAC geografie Europa România hărți", materie: "Geografie", angle: "cum înveți harta, elemente care apar constant, metodă de memorare", links: ["/subiecte-bac"] },
  { keyword: "BAC istorie eseu structură", materie: "Istorie", angle: "cum construiești eseul la istorie, cerințe tipice, exemplu comentat", links: ["/subiecte-bac"] },
  { keyword: "BAC logică argumentare subiecte", materie: "Logică", angle: "ce apare la proba de logică, metode, exemple rezolvate", links: ["/subiecte-bac"] },

  // ---- Generale / evergreen ----
  { keyword: "calendar admitere 2027 facultăți", materie: "Matematică", angle: "cum arată de obicei calendarul (înscrieri, examen, rezultate) și cum îți planifici anul; trimite la paginile oficiale pentru date", months: [2, 3, 4, 5, 6], links: ["/admitere"] },
  { keyword: "teste admitere facultate online gratuit", materie: "Matematică", angle: "cum alegi testele potrivite, cum le folosești eficient, ce înseamnă un scor bun", links: ["/grile", "/simulare"] },
  { keyword: "cum gestionezi timpul la un test grilă", materie: "Matematică", angle: "strategii de timp, ordinea rezolvării, când sari peste întrebări, exemple", links: ["/simulare"] },
  { keyword: "cum înveți eficient pentru admitere în ultima lună", materie: "Biologie", angle: "plan pe 4 săptămâni, recapitulare activă, simulări, odihnă", months: [5, 6, 7], links: ["/simulare", "/grile"] },
  { keyword: "meditații pentru admitere merită", materie: "Matematică", angle: "când ajută meditațiile, cum alegi profesorul, cum combini cu grilele online", links: ["/profesori"] },
  { keyword: "grila zilei admitere exercițiu zilnic", materie: "Matematică", angle: "de ce funcționează antrenamentul zilnic, cum construiești rutina, exemple", links: ["/grila-zilei"] },
  { keyword: "admitere fără BAC în medie ce înseamnă", materie: "Biologie", angle: "explică general ce înseamnă când o universitate nu mai ia în calcul media BAC; nu afirma politica unei anumite universități ca verificată", months: [9, 10, 11, 12, 1, 2], links: ["/admitere"] },
  { keyword: "locuri la buget admitere 2027 cum se stabilesc", materie: "Matematică", angle: "cum se alocă locurile bugetate în general, unde verifici cifrele oficiale, cum îți calculezi șansele", months: [3, 4, 5, 6, 7], links: ["/admitere"] },
  { keyword: "ultima medie de admitere ce înseamnă și cum o folosești", materie: "Matematică", angle: "cum interpretezi ultima medie, de ce variază anual, cum îți setezi obiectivul", months: [6, 7, 8, 9], links: ["/admitere", "/grile"] },

  // ---- Matematică tehnic ----
  { keyword: "ecuații de gradul 2 grile admitere", materie: "Matematică", angle: "relațiile lui Viète, discriminant, capcane; 5 grile rezolvate", links: ["/grile"] },
  { keyword: "limite de funcții grile admitere", materie: "Matematică", angle: "cazuri de nedeterminare, metode rapide, exemple pas cu pas", links: ["/grile"] },
  { keyword: "integrale grile admitere Politehnica", materie: "Matematică", angle: "primitive uzuale, integrare prin părți, substituții; exemple", links: ["/grile/upb"] },
  { keyword: "matrice și determinanți grile admitere", materie: "Matematică", angle: "proprietăți, rang, inversă, sisteme; exemple rezolvate", links: ["/grile"] },
  { keyword: "progresii aritmetice și geometrice grile", materie: "Matematică", angle: "formule, sume, capcane de indexare; exemple", links: ["/grile"] },
  { keyword: "trigonometrie grile admitere formule", materie: "Matematică", angle: "formule esențiale, ecuații trigonometrice, exemple", links: ["/grile"] },
  { keyword: "combinatorică și probabilități grile", materie: "Matematică", angle: "permutări, aranjamente, combinări, probabilități clasice; exemple", links: ["/grile"] },
  { keyword: "numere complexe grile admitere", materie: "Matematică", angle: "forma algebrică și trigonometrică, modul, rădăcini; exemple", links: ["/grile"] },
  { keyword: "geometrie analitică grile admitere", materie: "Matematică", angle: "dreapta, cercul, distanțe, arii; exemple", links: ["/grile"] },
];

export function slugifyKeyword(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/** Pick today's topics: seasonal ones first, rotating through the list deterministically by day. */
export function pickTopics(date: Date, count: number, usedSlugs: Set<string>): SeoTopic[] {
  const month = date.getUTCMonth() + 1;
  const dayIndex = Math.floor(date.getTime() / 86_400_000);
  const fresh = SEO_TOPICS.filter((t) => !usedSlugs.has(slugifyKeyword(t.keyword)));
  const pool = fresh.length >= count ? fresh : SEO_TOPICS;
  const seasonal = pool.filter((t) => t.months?.includes(month));
  const evergreen = pool.filter((t) => !t.months?.includes(month));
  const rotate = <T,>(arr: T[]) => arr.length ? [...arr.slice(dayIndex % arr.length), ...arr.slice(0, dayIndex % arr.length)] : arr;
  const ordered = [...rotate(seasonal), ...rotate(evergreen)];
  const out: SeoTopic[] = [];
  const seenMaterie = new Set<string>();
  for (const t of ordered) {
    if (out.length >= count) break;
    if (seenMaterie.has(t.materie) && ordered.length - out.length > count) continue; // vary subjects within a day
    seenMaterie.add(t.materie);
    out.push(t);
  }
  for (const t of ordered) { if (out.length >= count) break; if (!out.includes(t)) out.push(t); }
  return out;
}
