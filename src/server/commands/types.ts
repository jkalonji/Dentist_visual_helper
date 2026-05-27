export type Command =
  | { action: 'agenda' }
  | { action: 'patient' }
  | { action: 'suivant' }
  | { action: 'precedent' }
  | { action: 'accueil' }
  | { action: 'fin' }
  | { action: 'compte-rendu'; texte: string }
  | { action: 'note'; texte: string }
  | { action: 'prescription'; texte: string }
  | { action: 'inventaire'; produit: string; quantite: string }
  | { action: 'sterilisation'; description: string }
  | { action: 'rendez-vous'; patient: string; date: string; heure: string };

export type CommandAction = Command['action'];

export type DictationAction = 'compte-rendu' | 'note' | 'prescription';

export type CommandHandler = (command: Command) => void;
