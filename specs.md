# Dentist Visual Helper — Spécifications fonctionnelles

**Version :** 0.2  
**Date :** 2026-05-26  
**Statut :** En cours de définition

---

## 1. Contexte et objectif

Dentist Visual Helper est une application MentraOS destinée aux lunettes connectées Mentra Live. Elle assiste un parodontologue dans ses tâches quotidiennes en mode mains-libres : consultation de dossiers, gestion de l'agenda, rédaction de comptes-rendus post-soin et tâches administratives (inventaire, stérilisation).

Les fonctionnalités actives **pendant un soin** sont volontairement limitées à la consultation d'informations, afin de ne pas mettre le patient mal à l'aise. Toute saisie de données se fait hors présence du patient.

L'application est pilotée exclusivement par la voix du praticien. Elle s'interface avec Google Drive (dossiers patients, données opérationnelles) et Google Calendar (agenda).

---

## 2. Utilisateur

- **Profil :** Parodontologue, praticien unique
- **Charge :** ~10 patients par jour
- **Localisation :** France (soumis au RGPD et aux exigences HDS pour les données de santé)
- **Authentification :** Compte Mentra (fait foi pour l'accès à l'application)
- **Contexte d'usage :** Les lunettes sont utilisées principalement hors présence du patient (avant/après soin, entre deux patients, tâches admin). Pendant le soin, seule la consultation est autorisée pour ne pas inquiéter le patient.

---

## 3. Plateforme technique

| Élément | Choix |
|---|---|
| Matériel | Mentra Live (simulé via app mobile Mentra pendant le développement) |
| Framework | MentraOS (template Camera App) |
| Backend | Node.js / Bun |
| Tunnel dev | ngrok |
| Données patient | Google Drive — Google Docs |
| Agenda | Google Calendar (iCalendar) |
| Auth | Compte Mentra |
| Repo | GitHub : jkalonji/Dentist_visual_helper |

---

## 4. Interface utilisateur

### Principes

- **Overlay minimaliste** : le moins de texte possible à l'écran, sans sacrifier la précision clinique
- **Voix en entrée principale** : toutes les actions sont déclenchables vocalement
- **Feedback visuel court** : confirmation d'une action = une ligne, max 2-3 secondes d'affichage
- **Pas d'interaction tactile ou physique requise** à aucun moment
- **Pendant le soin : consultation uniquement** — aucune saisie, aucune dictée en présence du patient

### États de l'overlay

| État | Ce qui s'affiche |
|---|---|
| Veille | Rien (ou un indicateur discret de disponibilité) |
| Commande reçue | Nom de la commande détectée (1 ligne) |
| Affichage info | Données demandées (texte court, structuré) |
| Écoute dictée | Indicateur "● REC" + transcription en temps réel (tronquée) |
| Confirmation | "Enregistré" ou message d'erreur court |

---

## 5. Commandes vocales

### Notation dentaire : système universel américain (dents 1 à 32)

### Pendant un soin — consultation uniquement

> Aucune saisie ni dictée en présence du patient. Seules les commandes de lecture sont disponibles.

| Commande | Action |
|---|---|
| "Agenda" | Affiche les RDV du jour (heure + prénom/nom) |
| "Patient" | Affiche la fiche du patient en cours (infos clés) |
| "Suivant" | Passe au patient suivant dans la liste du jour |
| "Précédent" | Revient au patient précédent |
| "Accueil" | Retour à l'écran principal |

### Hors soin (entre patients, après soin, admin)

| Commande | Exemple | Action |
|---|---|---|
| "Compte-rendu" | — | Passe en mode dictée du compte-rendu de la session précédente (voir §6) |
| "Prescription [description]" | "Prescription amoxicilline deux grammes par jour sept jours" | Enregistre une prescription |
| "Note [texte libre]" | "Note patient anxieux, prévoir prémédication" | Observation générale libre |
| "Fin" | — | Clôture la session patient et sauvegarde sur Google Drive |
| "Inventaire [produit] [quantité]" | "Inventaire curettes Gracey douze unités" | Enregistre une entrée d'inventaire |
| "Stérilisation [description]" | "Stérilisation cycle 134 degrés terminé" | Log un cycle de stérilisation |
| "Rendez-vous [patient] [date] [heure]" | "Rendez-vous Dupont jeudi 9h" | Vérifie ou crée un RDV dans Google Calendar |

### Fin de dictée

La dictée se termine soit par le mot **"Fin"**, soit par un **silence détecté** (durée à calibrer, à définir lors de l'implémentation).

---

## 6. Compte-rendu de soin

### Mode de production
Le dentiste dicte l'intégralité du compte-rendu à voix haute **après le soin, hors présence du patient** (commande "Compte-rendu"). Il n'est pas généré automatiquement.

### Contenu attendu (dicté librement par le praticien)
- Actes réalisés
- Résultats cliniques (réussites et difficultés)
- Prescriptions émises

### Destination
- Sauvegardé dans le dossier patient sur **Google Drive** (Google Doc)
- Accessible uniquement au praticien via son compte Google

---

## 7. Intégrations

### Google Drive — Dossiers patients
- Format : Google Docs (un doc par patient, organisation à définir — voir `questions_à_poser.md`)
- Accès : lecture (consultation fiche) + écriture (ajout de notes, compte-rendu)
- Auth : OAuth2 Google, lié au compte du praticien

### Google Calendar
- Lecture de l'agenda du jour : liste des RDV avec heure et nom du patient
- Création / vérification de RDV par commande vocale
- Auth : OAuth2 Google (même compte)

### Données hors soin
- Inventaire et stérilisation : destination à définir (voir `questions_à_poser.md`)

---

## 8. Conformité (France)

- **RGPD** : les données traitées sont des données de santé (catégorie spéciale, art. 9 RGPD) — consentement et base légale à documenter
- **HDS (Hébergement Données de Santé)** : Google Workspace for Healthcare peut être qualifié HDS ; à vérifier pour le stockage sur Google Drive
- **Traçabilité stérilisation** : obligation réglementaire en cabinet dentaire — le format de log devra respecter les exigences en vigueur (à préciser avec le praticien)
- Aucune donnée patient ne transite en clair hors des services Google authentifiés

---

## 9. Hors périmètre (v1)

- Analyse automatique d'image (carie, poche parodontale via IA)
- Multi-praticiens / cabinet partagé
- Intégration logiciel de facturation ou de dossier médical tiers
- Gestion des images et radiographies

---

## 10. Questions en suspens

Voir [`questions_à_poser.md`](./questions_à_poser.md)
