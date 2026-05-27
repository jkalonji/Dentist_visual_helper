import type { Command, DictationAction } from "./types";

/** Result of parsing a single final transcription */
export type ParseResult =
  | Command
  | { kind: "start-dictation"; type: DictationAction }
  | null;

/** Lowercase + strip accents for keyword matching */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['']/g, "'");
}

const DAY_WORDS = new Set([
  "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche",
  "aujourd'hui", "demain", "apres-demain",
]);

/** Matches time expressions: 9h, 9h30, 14h, 8h00 */
const TIME_RE = /^\d{1,2}h\d{0,2}$/;

const NUMBER_WORDS = new Set([
  "un", "une", "deux", "trois", "quatre", "cinq", "six", "sept", "huit",
  "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize",
  "vingt", "trente", "quarante", "cinquante", "soixante", "cent",
]);

const UNIT_WORDS = new Set([
  "unite", "unites", "boite", "boites", "flacon", "flacons", "tube", "tubes",
  "sachet", "sachets", "piece", "pieces", "paire", "paires", "paquet",
  "paquets", "ampoule", "ampoules", "dose", "doses",
]);

/**
 * Extract patient / date / heure from tokens following "Rendez-vous".
 * Scans right-to-left for the time token, then the day token.
 * Everything before the day token is the patient name (1–2 tokens).
 */
function parseRendezVous(tokens: string[], normTokens: string[]): Command | null {
  if (tokens.length < 3) return null;

  let heureIdx = -1;
  for (let i = normTokens.length - 1; i >= 0; i--) {
    if (TIME_RE.test(normTokens[i])) { heureIdx = i; break; }
  }

  let dateIdx = -1;
  const limit = heureIdx >= 0 ? heureIdx : normTokens.length;
  for (let i = limit - 1; i >= 0; i--) {
    if (DAY_WORDS.has(normTokens[i])) { dateIdx = i; break; }
  }

  if (dateIdx < 0 || heureIdx < 0 || dateIdx === 0) return null;

  return {
    action: "rendez-vous",
    patient: tokens.slice(0, dateIdx).join(" "),
    date: tokens[dateIdx],
    heure: tokens[heureIdx],
  };
}

/**
 * Extract produit and quantite from tokens following "Inventaire".
 * Attempts to identify the quantity (number + optional unit) at the tail.
 */
function parseInventaire(tokens: string[], normTokens: string[]): Command {
  if (tokens.length === 0) return { action: "inventaire", produit: "", quantite: "" };

  let quantiteStart = tokens.length;
  const last = normTokens[tokens.length - 1];
  const secondLast = tokens.length >= 2 ? normTokens[tokens.length - 2] : "";

  if (UNIT_WORDS.has(last)) {
    // "douze unités" or "12 unités"
    if (NUMBER_WORDS.has(secondLast) || /^\d+$/.test(secondLast)) {
      quantiteStart = tokens.length - 2;
    } else {
      quantiteStart = tokens.length - 1;
    }
  } else if (NUMBER_WORDS.has(last) || /^\d+$/.test(last)) {
    quantiteStart = tokens.length - 1;
  }

  return {
    action: "inventaire",
    produit: tokens.slice(0, quantiteStart).join(" "),
    quantite: tokens.slice(quantiteStart).join(" "),
  };
}

/**
 * Parse a final transcription into a structured command.
 * Returns null if no command is detected.
 */
export function parseTranscription(rawText: string): ParseResult {
  const text = rawText.trim();
  const norm = normalize(text);
  const tokens = text.split(/\s+/);
  const normTokens = norm.split(/\s+/);
  const first = normTokens[0];

  // Simple no-parameter commands
  if (norm === "agenda")    return { action: "agenda" };
  if (norm === "patient")   return { action: "patient" };
  if (norm === "suivant")   return { action: "suivant" };
  if (norm === "precedent") return { action: "precedent" };
  if (norm === "accueil")   return { action: "accueil" };
  if (norm === "fin")       return { action: "fin" };

  // Compte-rendu — always triggers dictation
  if (norm === "compte-rendu" || norm === "compte rendu") {
    return { kind: "start-dictation", type: "compte-rendu" };
  }

  // Note [texte?]
  if (first === "note") {
    const rest = tokens.slice(1).join(" ");
    return rest
      ? { action: "note", texte: rest }
      : { kind: "start-dictation", type: "note" };
  }

  // Prescription [texte?]
  if (first === "prescription") {
    const rest = tokens.slice(1).join(" ");
    return rest
      ? { action: "prescription", texte: rest }
      : { kind: "start-dictation", type: "prescription" };
  }

  // Stérilisation [description]
  if (first === "sterilisation") {
    return { action: "sterilisation", description: tokens.slice(1).join(" ") };
  }

  // Inventaire [produit] [quantite]
  if (first === "inventaire") {
    return parseInventaire(tokens.slice(1), normTokens.slice(1));
  }

  // Rendez-vous [patient] [date] [heure]
  // Handle both "rendez-vous" (one token) and "rendez vous" (two tokens)
  if (first === "rendez-vous") {
    return parseRendezVous(tokens.slice(1), normTokens.slice(1));
  }
  if (first === "rendez" && normTokens[1] === "vous") {
    return parseRendezVous(tokens.slice(2), normTokens.slice(2));
  }

  return null;
}
