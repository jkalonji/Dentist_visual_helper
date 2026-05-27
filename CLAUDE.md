# CLAUDE.md — Dentist Visual Helper

## Projet

Application MentraOS pour lunettes connectées Mentra Live. Assiste un parodontologue en mode mains-libres : consultation de dossiers patients, agenda, dictée de compte-rendus, tâches administratives. Pilotée exclusivement à la voix. Voir `specs.md` pour les spécifications complètes.

**Stack :**
- Runtime : Bun
- Backend : TypeScript + Hono
- Frontend : React 19 + Tailwind CSS
- SDK : `@mentra/sdk`, `@mentra/react`
- Intégrations : Google Drive (OAuth2), Google Calendar (OAuth2)
- Dev tunnel : ngrok

**Commandes :**
```bash
bun run dev    # développement avec hot-reload
bun run start  # production
```

---

## Règles de collaboration

### Langue
Toujours répondre en **français**.

### Niveau
Niveau avancé. Pas d'explications basiques. Aller droit au but.

### Style de réponse
Réponses **courtes et directes**. Poser des questions si le besoin n'est pas clair plutôt que de supposer.

### Prise de décision
Pour toute décision non triviale (architecture, nouveau package, suppression de fichier, changement structurel) : **proposer d'abord, agir après validation explicite**.

---

## Standards de code

### Commentaires
Code **bien commenté** : documenter les fonctions, les comportements non-évidents et les sections importantes. Privilégier les commentaires qui expliquent le *pourquoi*, pas le *quoi*.

### Tests
Approche **TDD** : écrire les tests avant le code d'implémentation.

### Interdits
- Ne **jamais** refactoriser du code hors scope de la tâche en cours
- Ne **jamais** ajouter un package sans discussion préalable
- Ne **jamais** commiter sans validation explicite

---

## Conformité

Les données traitées sont des **données de santé** (RGPD art. 9). Tout code manipulant des données patient doit :
- Éviter tout transit de données en clair hors des services Google authentifiés
- Respecter les exigences HDS (Hébergement Données de Santé)
- Ne jamais logger des données patient en clair
