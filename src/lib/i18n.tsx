import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "mr";

const dict = {
  home: { en: "Home", mr: "मुख्यपृष्ठ" },
  courses: { en: "Courses", mr: "अभ्यासक्रम" },
  calendar: { en: "Calendar", mr: "वेळापत्रक" },
  knowledge: { en: "Knowledge Base", mr: "ज्ञानकोश" },
  blog: { en: "Blog", mr: "ब्लॉग" },
  faq: { en: "FAQs", mr: "प्रश्नोत्तरे" },
  announcements: { en: "Announcements", mr: "घोषणा" },
  contact: { en: "Contact", mr: "संपर्क" },
  login: { en: "Student Login", mr: "विद्यार्थी लॉगिन" },
  dashboard: { en: "My Dashboard", mr: "माझे डॅशबोर्ड" },
  admin: { en: "Admin", mr: "प्रशासन" },
  signOut: { en: "Sign out", mr: "बाहेर पडा" },
  heroEyebrow: { en: "Since generations · Pune", mr: "पिढ्यानपिढ्या · पुणे" },
  heroTitle: { en: "Learn Biochemic medicine, the Barakshar way.", mr: "बाराक्षार पद्धतीने बायोकेमिक औषधशास्त्र शिका." },
  heroSub: {
    en: "Structured courses on Dr. Schuessler's 12 tissue salts — live classes, secure recordings, and bilingual notes from Pethe's Barakshar Bio-Chemic.",
    mr: "डॉ. शुस्लर यांच्या १२ टिश्यू सॉल्ट्सवरील सुसंगत अभ्यासक्रम — लाइव्ह वर्ग, सुरक्षित रेकॉर्डिंग आणि द्विभाषिक नोट्स.",
  },
  browseCourses: { en: "Browse courses", mr: "अभ्यासक्रम पहा" },
  viewCalendar: { en: "View calendar", mr: "वेळापत्रक पहा" },
  upcoming: { en: "Upcoming sessions", mr: "आगामी सत्रे" },
  seatsLeft: { en: "seats left", mr: "जागा शिल्लक" },
  full: { en: "Full", mr: "पूर्ण" },
  enrol: { en: "Request enrollment", mr: "प्रवेशासाठी विनंती" },
  continue: { en: "Continue learning", mr: "शिकणे सुरू ठेवा" },
  search: { en: "Search…", mr: "शोधा…" },
  readMore: { en: "Read more", mr: "अधिक वाचा" },
} as const;

export type TKey = keyof typeof dict;

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: TKey) => string }>({
  lang: "en",
  setLang: () => {},
  t: (k) => dict[k].en,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved === "mr" || saved === "en") setLangState(saved);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };
  return <Ctx.Provider value={{ lang, setLang, t: (k) => dict[k][lang] }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);

/** Pick Marathi field when available and selected. */
export function pick(lang: Lang, en: string, mr?: string | null) {
  return lang === "mr" && mr ? mr : en;
}
