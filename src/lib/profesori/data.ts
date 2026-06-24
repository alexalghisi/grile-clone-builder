export interface ProfesorMaterie {
  slug: string;
  nume: string; // "Matematică"
  profesori: string; // "profesori de matematică"
  emoji: string;
  intro: string;
  topics: string[];
  faq: { q: string; a: string }[];
}

export const PROFESORI_MATERII: ProfesorMaterie[] = [
  {
    slug: "matematica",
    nume: "Matematică",
    profesori: "profesori de matematică",
    emoji: "📐",
    intro:
      "Profesori de matematică verificați, cu experiență la admitere și BAC. Lucrează grile de matematică explicate pas cu pas, de la algebră și analiză la geometrie și trigonometrie.",
    topics: [
      "Grile matematică admitere Politehnică (UPB, UTCN)",
      "Grile matematică ASE și cibernetică",
      "Grile matematică UBB, UAIC, Universitatea București",
      "Grile BAC matematică M1, M2 și pedagogic",
      "Analiză matematică: limite, derivate, integrale",
      "Algebră liniară, matrice, determinanți",
    ],
    faq: [
      {
        q: "Cum găsesc profesori de matematică buni pentru admitere?",
        a: "Pe GrileAdmitere.ro găsești profesori de matematică recomandați, plus mii de grile de matematică rezolvate pas cu pas pentru admitere la Politehnică, ASE, UBB și BAC.",
      },
      {
        q: "Cât costă meditațiile cu profesori de matematică?",
        a: "Tarifele variază între 80 și 200 lei/oră, în funcție de experiența profesorului. Grilele de matematică de pe platforma noastră sunt 100% gratuite.",
      },
    ],
  },
  {
    slug: "romana",
    nume: "Limba Română",
    profesori: "profesori de română",
    emoji: "📚",
    intro:
      "Profesori de limba și literatura română pentru BAC și admitere la Litere, Jurnalism, Drept. Grile de română cu comentarii, gramatică și sinteze pe autori canonici.",
    topics: [
      "Grile BAC română — proză, poezie, dramaturgie",
      "Autori canonici: Eminescu, Caragiale, Rebreanu, Blaga",
      "Gramatică: sintaxa, morfologia, ortografia",
      "Eseuri pentru admitere la Jurnalism și Litere",
    ],
    faq: [
      {
        q: "Profesorii de română mă ajută și cu eseul de BAC?",
        a: "Da, profesorii de română de pe GrileAdmitere.ro oferă modele de eseuri și grile rezolvate pentru toți autorii canonici din programa de BAC.",
      },
    ],
  },
  {
    slug: "biologie",
    nume: "Biologie",
    profesori: "profesori de biologie",
    emoji: "🧬",
    intro:
      "Profesori de biologie specializați pe admitere la Medicină (UMF). Grile de biologie clasele IX–XII după manualele Corint, exact ca la concursul de admitere UMF.",
    topics: [
      "Grile biologie UMF Carol Davila, Cluj, Iași, Timișoara",
      "Anatomie și fiziologie umană (clasa XI)",
      "Genetică, ecologie, biologie celulară (clasa XII)",
      "Grile BAC biologie vegetală și animală",
    ],
    faq: [
      {
        q: "Câte grile de biologie sunt la admiterea UMF?",
        a: "La majoritatea UMF-urilor sunt între 60 și 100 de grile de biologie. Pe GrileAdmitere.ro găsești mii de grile de biologie cu explicațiile profesorilor.",
      },
    ],
  },
  {
    slug: "chimie",
    nume: "Chimie",
    profesori: "profesori de chimie",
    emoji: "⚗️",
    intro:
      "Profesori de chimie organică și anorganică pentru admitere UMF și Farmacie. Grile de chimie cu structuri, reacții și mecanisme explicate.",
    topics: [
      "Grile chimie organică UMF",
      "Grile chimie anorganică pentru Farmacie",
      "Stoichiometrie și echilibre chimice",
      "Grile BAC chimie C1 / C2",
    ],
    faq: [
      {
        q: "Profesorii de chimie acoperă și partea de organică pentru UMF?",
        a: "Da, toți profesorii de chimie recomandați acoperă chimia organică nivel UMF: hidrocarburi, compuși cu oxigen, aminoacizi, proteine.",
      },
    ],
  },
  {
    slug: "fizica",
    nume: "Fizică",
    profesori: "profesori de fizică",
    emoji: "⚛️",
    intro:
      "Profesori de fizică pentru admitere la Politehnică (UPB, UTCN) și BAC. Grile de fizică pe mecanică, electricitate, optică, fizică modernă.",
    topics: [
      "Grile fizică UPB — mecanică și electricitate",
      "Grile fizică UTCN și Politehnica Iași",
      "Termodinamică, oscilații, unde",
      "Grile BAC fizică F1 / F2",
    ],
    faq: [
      {
        q: "Ce nivel au grilele de fizică pentru UPB?",
        a: "Grilele de fizică pentru UPB sunt de nivel avansat liceu, cu accent pe mecanică și electricitate. Profesorii noștri le explică pas cu pas.",
      },
    ],
  },
  {
    slug: "informatica",
    nume: "Informatică",
    profesori: "profesori de informatică",
    emoji: "💻",
    intro:
      "Profesori de informatică pentru admitere la UPB Automatică, UBB Info, UAIC FII și BAC. Grile de informatică C/C++, algoritmi, structuri de date, complexitate.",
    topics: [
      "Grile informatică UPB Automatică & Calculatoare",
      "Grile informatică UBB Cluj — Facultatea de Informatică",
      "Algoritmi, recursivitate, backtracking, programare dinamică",
      "Grile BAC informatică C/C++ și Pascal",
    ],
    faq: [
      {
        q: "Ce limbaj se cere la admiterea la informatică?",
        a: "Majoritatea facultăților (UPB, UBB, UAIC) cer C/C++. Profesorii de informatică de pe GrileAdmitere.ro lucrează grile pe ambele variante.",
      },
    ],
  },
  {
    slug: "engleza",
    nume: "Engleză",
    profesori: "profesori de engleză",
    emoji: "🇬🇧",
    intro:
      "Profesori de engleză pentru BAC, Cambridge, IELTS și admitere la Limbi Străine. Grile de engleză cu gramatică, vocabular și reading comprehension.",
    topics: [
      "Grile engleză BAC competențe lingvistice",
      "Pregătire Cambridge FCE, CAE, CPE",
      "Grile IELTS și TOEFL",
      "Admitere la Limbi Străine — Universitatea București",
    ],
    faq: [
      {
        q: "Profesorii de engleză pregătesc și pentru Cambridge?",
        a: "Da, mulți profesori de engleză recomandați pregătesc elevii pentru certificările Cambridge — FCE, CAE și CPE.",
      },
    ],
  },
  {
    slug: "istorie",
    nume: "Istorie",
    profesori: "profesori de istorie",
    emoji: "🏛️",
    intro:
      "Profesori de istorie pentru BAC profil uman și admitere la Drept, Istorie, Relații Internaționale. Grile de istorie pe perioade și sinteze tematice.",
    topics: [
      "Grile istorie BAC — secolele XIX–XX",
      "Statul român modern și totalitarismul",
      "Admitere Drept, Istorie, Relații Internaționale",
    ],
    faq: [
      {
        q: "Cum mă pregătesc pentru BAC la istorie cu un profesor?",
        a: "Profesorii de istorie lucrează cu tine pe sinteze tematice și grile de istorie cu autori-cheie pentru fiecare epocă, exact pe modelul subiectelor de BAC.",
      },
    ],
  },
  {
    slug: "economie",
    nume: "Economie",
    profesori: "profesori de economie",
    emoji: "💰",
    intro:
      "Profesori de economie pentru admitere la ASE și BAC economic. Grile de economie cu microeconomie, macroeconomie, marketing și management.",
    topics: [
      "Grile economie admitere ASE București",
      "Microeconomie, macroeconomie",
      "Grile BAC economie și antreprenoriat",
    ],
    faq: [
      {
        q: "Profesorii de economie acoperă programa ASE?",
        a: "Da, profesorii de economie recomandați urmează programa de admitere ASE și folosesc grile reale din anii precedenți.",
      },
    ],
  },
  {
    slug: "anatomie",
    nume: "Anatomie",
    profesori: "profesori de anatomie",
    emoji: "🫀",
    intro:
      "Profesori de anatomie pentru admitere UMF — sistem nervos, cardiovascular, digestiv, locomotor. Grile de anatomie nivel UMF cu scheme și explicații.",
    topics: [
      "Grile anatomie admitere UMF",
      "Sistem nervos central și periferic",
      "Aparat cardiovascular și respirator",
      "Aparat digestiv, renal, endocrin",
    ],
    faq: [
      {
        q: "Anatomia este obligatorie la admiterea UMF?",
        a: "Da, anatomia este materie principală la majoritatea UMF-urilor. Profesorii de anatomie de pe GrileAdmitere.ro oferă grile rezolvate pe toate sistemele.",
      },
    ],
  },
];