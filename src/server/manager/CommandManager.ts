import type { AppSession } from "@mentra/sdk";
import type { User } from "../session/User";
import type { Command, CommandHandler, DictationAction } from "../commands/types";
import { parseTranscription } from "../commands/parser";

/** Seconds of silence before dictation auto-closes */
const DICTATION_SILENCE_MS = 5000;

const OVERLAY_LABELS: Record<Command["action"], string> = {
  agenda:        "Agenda",
  patient:       "Patient",
  suivant:       "Suivant",
  precedent:     "Précédent",
  accueil:       "Accueil",
  fin:           "Fin",
  "compte-rendu": "Compte-rendu",
  note:          "Note",
  prescription:  "Prescription",
  inventaire:    "Inventaire",
  sterilisation: "Stérilisation",
  "rendez-vous": "Rendez-vous",
};

/**
 * CommandManager — voice command engine for Dentist Visual Helper.
 *
 * Responsibilities:
 * - Detect commands in final transcriptions (via parseTranscription)
 * - Manage dictation mode: accumulate text, detect silence, emit on close
 * - Display brief overlays on the glasses on command detection / dictation state
 * - Expose onCommand() for future phases to hook into parsed commands
 */
export class CommandManager {
  private handlers: Set<CommandHandler> = new Set();
  private session: AppSession | null = null;

  private dictationMode: DictationAction | null = null;
  private dictationBuffer: string[] = [];
  private silenceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private user: User) {}

  setSession(session: AppSession): void {
    this.session = session;
  }

  clearSession(): void {
    this.session = null;
    this.clearSilenceTimer();
  }

  /** Register a handler — returns an unsubscribe function */
  onCommand(handler: CommandHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  /** Called by TranscriptionManager on each isFinal transcription */
  processFinalTranscription(text: string): void {
    if (this.dictationMode) {
      this.handleDictationInput(text);
    } else {
      this.handleNormalInput(text);
    }
  }

  /** Called by TranscriptionManager on partial transcriptions (overlay only) */
  processPartialTranscription(text: string): void {
    if (!this.dictationMode) return;
    const truncated = text.length > 28 ? "…" + text.slice(-25) : text;
    this.session?.layouts.showDoubleTextWall("● REC", truncated);
  }

  // ---------------------------------------------------------------------------

  private handleNormalInput(text: string): void {
    const result = parseTranscription(text);
    if (!result) return;

    if ("kind" in result) {
      this.enterDictationMode(result.type);
    } else {
      this.emitCommand(result);
      this.showCommandLabel(result.action);
    }
  }

  private handleDictationInput(text: string): void {
    // Check for "Fin" standalone to close dictation
    const norm = text.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    if (norm === "fin") {
      this.closeDictation();
      return;
    }
    this.dictationBuffer.push(text);
    this.resetSilenceTimer();
  }

  private enterDictationMode(type: DictationAction): void {
    this.dictationMode = type;
    this.dictationBuffer = [];
    this.session?.layouts.showTextWall("● REC");
    this.resetSilenceTimer();
    console.log(`[CommandManager] Dictation started: ${type} (${this.user.userId})`);
  }

  private closeDictation(): void {
    if (!this.dictationMode) return;

    const type = this.dictationMode;
    const texte = this.dictationBuffer.join(" ");
    this.dictationMode = null;
    this.dictationBuffer = [];
    this.clearSilenceTimer();

    let command: Command;
    if (type === "compte-rendu") command = { action: "compte-rendu", texte };
    else if (type === "note")    command = { action: "note", texte };
    else                         command = { action: "prescription", texte };

    this.emitCommand(command);
    this.session?.layouts.showTextWall("Enregistré", { durationMs: 2000 });
    console.log(`[CommandManager] Dictation closed: ${type} (${texte.length} chars)`);
  }

  private showCommandLabel(action: Command["action"]): void {
    this.session?.layouts.showTextWall(OVERLAY_LABELS[action], { durationMs: 2000 });
  }

  private emitCommand(command: Command): void {
    console.log(`[CommandManager] ${this.user.userId}: ${JSON.stringify(command)}`);
    for (const handler of this.handlers) {
      handler(command);
    }
  }

  private resetSilenceTimer(): void {
    this.clearSilenceTimer();
    this.silenceTimer = setTimeout(() => {
      console.log(`[CommandManager] Silence timeout — closing dictation`);
      this.closeDictation();
    }, DICTATION_SILENCE_MS);
  }

  private clearSilenceTimer(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  destroy(): void {
    this.clearSilenceTimer();
    this.dictationMode = null;
    this.dictationBuffer = [];
    this.handlers.clear();
    this.session = null;
  }
}
