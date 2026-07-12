import React, { useState, useRef, useEffect, useCallback } from "react";
import { Camera, Upload, Sparkles, ShoppingBag, RotateCcw, Wind, Sun, Leaf } from "lucide-react";

// ---------------------------------------------------------------------------
// DomAura — MVP interactivo (mock)
// Flujo: subir foto → "análisis" IA (simulado) → propuesta con estilo + productos
// Sin conexión real a IA todavía: esto valida la experiencia antes de conectar
// un modelo de imagen (Stable Diffusion / Replicate / etc.)
// ---------------------------------------------------------------------------

const LANGS = ["es", "fr", "en", "pt", "de"];

const UI = {
  es: {
    brand: "DomAura",
    tagline: "El aura de tu espacio, optimizada",
    uploadTitle: "Fotografía el espacio que quieres optimizar",
    uploadHint: "Encuadre amplio, luz natural, sin recortar demasiado",
    takePhoto: "Tomar o subir foto",
    analyzing: "Analizando tu espacio…",
    tips: ["Evaluando flujo de circulación", "Detectando puntos de luz natural", "Buscando equilibrio y simetría", "Identificando objetos a liberar"],
    resultBadge: "Propuesta para tu espacio",
    styleLabel: "Estilo sugerido",
    itemsTitle: "Elementos para lograrlo",
    searchCta: "Buscar tienda",
    resetCta: "Probar otra foto",
    disclaimer: "Enlaces de ejemplo — la tienda final dependerá de los acuerdos comerciales de DomAura.",
  },
  fr: {
    brand: "DomAura",
    tagline: "L'aura de votre espace, optimisée",
    uploadTitle: "Photographiez l'espace à optimiser",
    uploadHint: "Cadrage large, lumière naturelle, sans trop recadrer",
    takePhoto: "Prendre ou importer une photo",
    analyzing: "Analyse de votre espace…",
    tips: ["Évaluation de la circulation", "Détection des points de lumière naturelle", "Recherche d'équilibre et de symétrie", "Repérage des objets à désencombrer"],
    resultBadge: "Proposition pour votre espace",
    styleLabel: "Style suggéré",
    itemsTitle: "Éléments pour y parvenir",
    searchCta: "Chercher en boutique",
    resetCta: "Essayer une autre photo",
    disclaimer: "Liens d'exemple — la boutique finale dépendra des partenariats commerciaux de DomAura.",
  },
  en: {
    brand: "DomAura",
    tagline: "Your space's aura, optimized",
    uploadTitle: "Photograph the space you want to optimize",
    uploadHint: "Wide frame, natural light, avoid cropping too tight",
    takePhoto: "Take or upload photo",
    analyzing: "Analyzing your space…",
    tips: ["Evaluating flow and circulation", "Detecting natural light points", "Looking for balance and symmetry", "Spotting clutter to release"],
    resultBadge: "Proposal for your space",
    styleLabel: "Suggested style",
    itemsTitle: "Elements to get there",
    searchCta: "Find in store",
    resetCta: "Try another photo",
    disclaimer: "Example links — the final store will depend on DomAura's commercial partnerships.",
  },
  pt: {
    brand: "DomAura",
    tagline: "A aura do seu espaço, otimizada",
    uploadTitle: "Fotografe o espaço que quer otimizar",
    uploadHint: "Enquadramento amplo, luz natural, sem cortar demais",
    takePhoto: "Tirar ou enviar foto",
    analyzing: "Analisando o seu espaço…",
    tips: ["Avaliando a circulação", "Detetando pontos de luz natural", "Procurando equilíbrio e simetria", "Identificando objetos para libertar"],
    resultBadge: "Proposta para o seu espaço",
    styleLabel: "Estilo sugerido",
    itemsTitle: "Elementos para conseguir isso",
    searchCta: "Procurar na loja",
    resetCta: "Experimentar outra foto",
    disclaimer: "Links de exemplo — a loja final dependerá das parcerias comerciais da DomAura.",
  },
  de: {
    brand: "DomAura",
    tagline: "Die Aura deines Raums, optimiert",
    uploadTitle: "Fotografiere den Raum, den du optimieren möchtest",
    uploadHint: "Weiter Rahmen, natürliches Licht, nicht zu eng zuschneiden",
    takePhoto: "Foto aufnehmen oder hochladen",
    analyzing: "Dein Raum wird analysiert…",
    tips: ["Bewertung des Raumflusses", "Erkennung von Lichtquellen", "Suche nach Balance und Symmetrie", "Erkennen von Unordnung"],
    resultBadge: "Vorschlag für deinen Raum",
    styleLabel: "Vorgeschlagener Stil",
    itemsTitle: "Elemente, um es zu erreichen",
    searchCta: "Im Shop suchen",
    resetCta: "Anderes Foto versuchen",
    disclaimer: "Beispiel-Links — der finale Shop hängt von DomAuras Handelspartnerschaften ab.",
  },
};

const STYLES = [
  {
    id: "minimal",
    name: { es: "Minimalista", fr: "Minimaliste", en: "Minimalist", pt: "Minimalista", de: "Minimalistisch" },
    desc: {
      es: "Menos objetos, más aire. Liberamos superficies y dejamos que cada pieza tenga una función clara.",
      fr: "Moins d'objets, plus d'air. On libère les surfaces et chaque pièce garde une fonction claire.",
      en: "Fewer objects, more air. We free up surfaces and let every piece keep a clear function.",
      pt: "Menos objetos, mais ar. Libertamos superfícies e cada peça mantém uma função clara.",
      de: "Weniger Objekte, mehr Luft. Flächen werden frei, jedes Stück behält eine klare Funktion.",
    },
  },
  {
    id: "fengshui",
    name: { es: "Feng Shui", fr: "Feng Shui", en: "Feng Shui", pt: "Feng Shui", de: "Feng Shui" },
    desc: {
      es: "Reordenamos para que la energía (chi) circule sin obstáculos, con el mobiliario alineado y vistas despejadas hacia la entrada.",
      fr: "On réorganise pour que l'énergie (chi) circule librement, mobilier aligné et vue dégagée vers l'entrée.",
      en: "We rearrange so energy (chi) flows freely, furniture aligned and a clear sightline to the entrance.",
      pt: "Reorganizamos para que a energia (chi) circule livremente, mobiliário alinhado e vista desobstruída para a entrada.",
      de: "Wir ordnen neu, damit Energie (Chi) frei fließt, Möbel ausgerichtet, freier Blick zum Eingang.",
    },
  },
  {
    id: "japandi",
    name: { es: "Japandi", fr: "Japandi", en: "Japandi", pt: "Japandi", de: "Japandi" },
    desc: {
      es: "Calidez nórdica y calma japonesa: madera clara, líneas simples y muy pocos acentos de color.",
      fr: "Chaleur nordique et calme japonais : bois clair, lignes simples et très peu d'accents de couleur.",
      en: "Nordic warmth meets Japanese calm: light wood, simple lines, very few color accents.",
      pt: "Calor nórdico e calma japonesa: madeira clara, linhas simples e poucos acentos de cor.",
      de: "Nordische Wärme trifft japanische Ruhe: helles Holz, klare Linien, kaum Farbakzente.",
    },
  },
];

const ITEMS = [
  {
    icon: Wind,
    name: { es: "Estantería flotante", fr: "Étagère flottante", en: "Floating shelf", pt: "Prateleira flutuante", de: "Schwebendes Regal" },
    reason: {
      es: "Libera el suelo y abre el paso — clave para el flujo del espacio.",
      fr: "Libère le sol et dégage le passage — clé pour la circulation.",
      en: "Frees the floor and opens the walkway — key for good flow.",
      pt: "Liberta o chão e abre a passagem — chave para a circulação.",
      de: "Befreit den Boden und öffnet den Weg — wichtig für den Fluss.",
    },
    price: "€35–60",
  },
  {
    icon: Sun,
    name: { es: "Espejo de pared", fr: "Miroir mural", en: "Wall mirror", pt: "Espelho de parede", de: "Wandspiegel" },
    reason: {
      es: "Duplica la luz natural y hace el cuarto visualmente más grande.",
      fr: "Double la lumière naturelle et agrandit visuellement la pièce.",
      en: "Doubles natural light and makes the room feel larger.",
      pt: "Duplica a luz natural e torna o quarto visualmente maior.",
      de: "Verdoppelt das Tageslicht und lässt den Raum größer wirken.",
    },
    price: "€45–90",
  },
  {
    icon: Leaf,
    name: { es: "Planta de hoja redondeada", fr: "Plante à feuilles rondes", en: "Round-leaf plant", pt: "Planta de folha arredondada", de: "Pflanze mit runden Blättern" },
    reason: {
      es: "Formas suaves y redondeadas favorecen una energía tranquila (feng shui).",
      fr: "Les formes rondes et douces favorisent une énergie apaisée (feng shui).",
      en: "Soft, rounded shapes support calmer energy (feng shui).",
      pt: "Formas suaves e arredondadas favorecem uma energia tranquila (feng shui).",
      de: "Weiche, runde Formen fördern ruhige Energie (Feng Shui).",
    },
    price: "€20–40",
  },
  {
    icon: ShoppingBag,
    name: { es: "Cesta de almacenaje textil", fr: "Panier de rangement textile", en: "Woven storage basket", pt: "Cesto de armazenamento têxtil", de: "Textil-Aufbewahrungskorb" },
    reason: {
      es: "Esconde lo cotidiano sin perder acceso rápido — orden visible, no forzado.",
      fr: "Cache le quotidien sans perdre l'accès rapide — ordre visible, non forcé.",
      en: "Hides everyday clutter without losing quick access — visible order, not forced.",
      pt: "Esconde o dia a dia sem perder acesso rápido — ordem visível, não forçada.",
      de: "Versteckt Alltägliches, bleibt griffbereit — sichtbare, nicht erzwungene Ordnung.",
    },
    price: "€15–30",
  },
];

function pickStyle(seed) {
  return STYLES[seed % STYLES.length];
}

export default function DomAura() {
  const [lang, setLang] = useState("es");
  const [step, setStep] = useState("upload"); // upload | analyzing | result
  const [image, setImage] = useState(null);
  const [tipIndex, setTipIndex] = useState(0);
  const [style, setStyle] = useState(STYLES[0]);
  const fileInputRef = useRef(null);
  const t = UI[lang];

  const handleFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
      setStyle(pickStyle(Math.floor(Math.random() * STYLES.length)));
      setStep("analyzing");
    };
    reader.readAsDataURL(file);
  }, []);

  useEffect(() => {
    if (step !== "analyzing") return;
    const tipTimer = setInterval(() => setTipIndex((i) => (i + 1) % t.tips.length), 700);
    const doneTimer = setTimeout(() => setStep("result"), 2600);
    return () => {
      clearInterval(tipTimer);
      clearTimeout(doneTimer);
    };
  }, [step, t.tips.length]);

  const reset = () => {
    setImage(null);
    setStep("upload");
    setTipIndex(0);
  };

  return (
    <div
      style={{ fontFamily: "'Inter', sans-serif", background: "#FAF8F3" }}
      className="min-h-screen w-full flex flex-col items-center text-[#3C392F]"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .aura-ring { position: relative; }
        .aura-ring::before {
          content: '';
          position: absolute; inset: -6px;
          border-radius: 1.25rem;
          background: radial-gradient(circle at 30% 20%, #4F769155, transparent 60%),
                      radial-gradient(circle at 70% 80%, #4F769155, transparent 60%);
          filter: blur(14px);
          animation: breathe 2.4s ease-in-out infinite;
          z-index: -1;
        }
        @keyframes breathe { 0%,100% { opacity: .5; transform: scale(0.98);} 50% { opacity: 1; transform: scale(1.03);} }
      `}</style>

      {/* header */}
      <div className="w-full max-w-md px-6 pt-8 pb-4 flex items-center justify-between">
        <div>
          <div style={{ fontFamily: "'Fraunces', serif" }} className="text-2xl tracking-tight text-[#3C392F]">
            {t.brand}
          </div>
          <div className="text-xs text-[#928C7A] mt-0.5">{t.tagline}</div>
        </div>
        <div className="flex gap-1">
          {LANGS.map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="w-7 h-7 rounded-full text-[10px] uppercase tracking-wide transition-colors"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                background: lang === l ? "#6B93AC" : "#F1EEE4",
                color: lang === l ? "#FAF8F3" : "#928C7A",
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-md px-6 flex-1 flex flex-col">
        {step === "upload" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 py-16">
            <div
              className="w-full aspect-[4/5] rounded-2xl border border-dashed flex flex-col items-center justify-center gap-3 px-6 text-center"
              style={{ borderColor: "#E3DFD2", background: "#F1EEE4" }}
            >
              <Sparkles size={28} color="#6B93AC" />
              <p style={{ fontFamily: "'Fraunces', serif" }} className="text-lg leading-snug">
                {t.uploadTitle}
              </p>
              <p className="text-xs text-[#A39D8A]">{t.uploadHint}</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFile}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-medium"
              style={{ background: "#6B93AC", color: "#FAF8F3" }}
            >
              <Camera size={18} /> {t.takePhoto}
            </button>
          </div>
        )}

        {step === "analyzing" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 py-16">
            <div className="aura-ring rounded-2xl overflow-hidden w-full aspect-[4/5]">
              <img src={image} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center gap-2 text-sm text-[#3C392F]">
              <Sparkles size={16} color="#6B93AC" className="animate-pulse" />
              {t.analyzing}
            </div>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="text-xs text-[#A39D8A]">
              {t.tips[tipIndex]}
            </p>
          </div>
        )}

        {step === "result" && (
          <div className="flex-1 flex flex-col gap-5 py-8">
            <div className="rounded-2xl overflow-hidden relative">
              <img src={image} alt="" className="w-full aspect-[4/5] object-cover" />
              <div
                className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs"
                style={{ background: "#FAF8F3CC", color: "#4F7691", fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {t.resultBadge}
              </div>
            </div>

            <div className="rounded-2xl p-5" style={{ background: "#F1EEE4" }}>
              <div className="text-xs uppercase tracking-wide mb-1" style={{ color: "#4F7691", fontFamily: "'IBM Plex Mono', monospace" }}>
                {t.styleLabel}
              </div>
              <div style={{ fontFamily: "'Fraunces', serif" }} className="text-xl mb-2">
                {style.name[lang]}
              </div>
              <p className="text-sm text-[#928C7A] leading-relaxed">{style.desc[lang]}</p>
            </div>

            <div>
              <div className="text-sm mb-3 text-[#3C392F]" style={{ fontFamily: "'Fraunces', serif" }}>
                {t.itemsTitle}
              </div>
              <div className="flex flex-col gap-3">
                {ITEMS.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="rounded-xl p-4 flex gap-3" style={{ background: "#F1EEE4" }}>
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "#FAF8F3" }}
                      >
                        <Icon size={18} color="#6B93AC" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="text-sm font-medium truncate">{item.name[lang]}</div>
                          <div className="text-xs shrink-0" style={{ color: "#A39D8A", fontFamily: "'IBM Plex Mono', monospace" }}>
                            {item.price}
                          </div>
                        </div>
                        <p className="text-xs text-[#A39D8A] mt-1 leading-relaxed">{item.reason[lang]}</p>
                        <a
                          href={`https://www.google.com/search?tbm=shop&q=${encodeURIComponent(item.name[lang])}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-2 text-xs"
                          style={{ color: "#4F7691" }}
                        >
                          <ShoppingBag size={12} /> {t.searchCta} →
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-[#B2AC98] mt-3 italic">{t.disclaimer}</p>
            </div>

            <button
              onClick={reset}
              className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm border"
              style={{ borderColor: "#E3DFD2", color: "#928C7A" }}
            >
              <RotateCcw size={14} /> {t.resetCta}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
