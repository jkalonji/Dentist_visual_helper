# Trajectoire de développement — Dentist Visual Helper

**Date :** 2026-05-26  
**Base de départ :** MentraOS Camera App template — connexion lunettes fonctionnelle, transcription audio temps réel opérationnelle.

---

## Phase 1 — Moteur de commandes vocales

Parser la transcription audio brute en commandes structurées.

- Détecter les mots-clés déclencheurs dans le flux de transcription
- Extraire les paramètres associés (ex. "Rendez-vous Dupont jeudi 9h" → `{ action: "rdv", patient: "Dupont", date: "jeudi", heure: "9h" }`)
- Retourner une commande normalisée au reste de l'application

> Socle de toutes les phases suivantes.

---

## Phase 2 — Authentification Google

Mettre en place OAuth2 pour accéder à Google Drive et Google Calendar.

- Flux d'autorisation OAuth2 (consentement du praticien une seule fois)
- Stockage sécurisé du token de rafraîchissement
- Client Google Drive (lecture + écriture)
- Client Google Calendar (lecture + écriture)

> Prérequis pour les phases 3, 4 et 5.

---

## Phase 3 — Consultation (lecture seule)

Permettre au praticien de consulter ses données depuis les lunettes, y compris pendant un soin.

- Lire l'agenda du jour depuis Google Calendar → afficher sur l'overlay (heure + nom patient)
- Lire la fiche patient depuis Google Drive → afficher les infos clés sur l'overlay
- Navigation vocale : "Suivant", "Précédent", "Patient", "Agenda", "Accueil"

---

## Phase 4 — Saisie post-soin

Permettre la dictée et l'enregistrement des données après chaque patient.

- Mode dictée : compte-rendu, notes, prescriptions
- Déclenchement par "Compte-rendu", "Note", "Prescription"
- Fin de dictée par silence détecté ou "Fin"
- Sauvegarde dans le dossier patient sur Google Drive

---

## Phase 5 — Tâches administratives

Couvrir les usages hors cabinet (inventaire, stérilisation, prise de RDV).

- Enregistrement d'inventaire → log dans Google Drive
- Enregistrement de cycles de stérilisation → log dans Google Drive
- Création / vérification de RDV dans Google Calendar

---

## Phase 6 — Intégration et simulation complète

Valider l'ensemble du flux sur une journée type simulée via l'app Mentra mobile.

- Simulation d'une journée de ~10 patients
- Gestion des cas limites : patient introuvable, calendrier vide, échec réseau
- Ajustements UX sur l'overlay (timing, lisibilité, verbosité)
- Préparation au test sur lunettes physiques

---

## Questions ouvertes

Voir [`questions_à_poser.md`](./questions_à_poser.md)

## Spécifications fonctionnelles

Voir [`specs.md`](./specs.md)
