# Projet: App Reda
> PWA de fiche de prospection digitale pour L'Institut Énergétique du Patrimoine

## Metadata
- Catégorie: perso
- Stack: HTML/CSS/JS vanilla, jsPDF (CDN), PWA
- Repo: claude_owner/projects/perso/app_reda
- Démarré le: 2026-03-19
- Dernière session: 2026-03-19

## État actuel
- Formulaire complet avec les 5 sections (identification apporteur, prospect, travaux, accord, observations)
- Génération PDF fidèle au document papier original (ANNEXE N°1)
- PWA installable (manifest + service worker cache-first)
- Mobile-first responsive
- Validation basique (date + nom obligatoires)

## En cours
- Première implémentation terminée, en attente de test visuel

## Prochaines étapes
1. Générer les icônes PNG (ouvrir generate-icons.html dans un navigateur)
2. Tester sur mobile réel (Android Chrome)
3. Héberger (GitHub Pages ou Netlify) pour que Reda puisse l'installer
4. Recueillir feedback Reda → ajustements

## Décisions d'architecture
| Décision | Pourquoi | Alternatives considérées |
|---|---|---|
| PWA vanilla (zéro framework) | App simple, formulaire unique, pas besoin de React/Vue | React, Flutter, app native |
| jsPDF via CDN | Génération PDF côté client, zéro backend | html2pdf (trop lourd), backend PDF (over-engineering) |
| Pas de base de données | Reda remplit et imprime, pas besoin d'historique | localStorage, IndexedDB |
| Cache-first SW | App doit fonctionner offline sur le terrain | Network-first (pas adapté terrain sans réseau) |

## Concepts & Patterns appris
- PWA manifest + service worker → app installable sans store
- jsPDF API → génération PDF programmatique côté client
