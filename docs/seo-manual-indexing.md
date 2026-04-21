# SEO — Indexation manuelle Just-Tag.app (procédure Quick Wins)

Ce document accompagne le commit "feat(seo): Quick Wins indexation Google".
Objectif : résoudre les 5 039 pages "Détectée, non indexée" dans Google Search Console (GSC).

## Contexte

Google refuse d'indexer ~5 000 pages car :

1. Le sitemap contenait ~60 000 URLs (5 locales × 12 k) — Google pénalise les sites
   jeunes avec trop d'URLs similaires (hreflang est du contenu quasi identique pour
   un bot sans signal humain sur les langues secondaires).
2. Les fiches restaurants étaient en `force-dynamic` (pas cacheables) — rendering
   lent, pénalité "crawl budget".
3. Absence de "pull manuel" pour forcer Google à regarder les pages prioritaires.

## Ce qui a été fait côté code

- `sitemap.ts` : le sitemap principal ne contient plus que les URLs **FR** (~12 k
  au lieu de 60 k). Les pages DE/EN/PT/ES restent accessibles et sont référencées
  via `hreflang` dans chaque entrée (alternates) — Google les découvrira via les
  liens internes et l'hreflang.
- Fiches resto `/[locale]/restaurants/[slug]` : ISR 1 h (`revalidate = 3600`).
- Pages villes `/[locale]/restaurants/ville/[city]` : ISR 30 min (`revalidate = 1800`).
- Pages cantons `/[locale]/restaurants/canton/[canton]` : ISR 30 min.
- Homepage `/[locale]` : ISR 30 min.
- Page listing `/[locale]/restaurants` : laissée en rendu serveur dynamique
  (searchParams pour filtres).

## Procédure GSC — indexation manuelle des 30 URLs prioritaires

### Étape 1. Se connecter à Google Search Console

1. Aller sur https://search.google.com/search-console/
2. Sélectionner la propriété `https://just-tag.app/`.

### Étape 2. Re-soumettre le sitemap

1. Menu gauche → `Sitemaps`.
2. Supprimer l'ancienne soumission si présente.
3. Re-soumettre `https://just-tag.app/sitemap.xml` (taille attendue : ~12 k URLs).
4. Attendre le passage en "Succès" (quelques minutes à 24 h).

### Étape 3. Demander l'indexation des 30 URLs prioritaires

Pour chacune des URLs ci-dessous :

1. Coller l'URL dans la barre "Inspection d'URL" (en haut de GSC).
2. Attendre la réponse. Si "URL n'est pas sur Google" → cliquer
   **"Demander l'indexation"**.
3. Passer à la suivante. Quota indicatif : ~10/jour, ne pas spammer.

**Homepage**
1. https://just-tag.app/fr

**Top 10 villes (pages villes FR)**
2. https://just-tag.app/fr/restaurants/ville/lausanne
3. https://just-tag.app/fr/restaurants/ville/geneve
4. https://just-tag.app/fr/restaurants/ville/montreux
5. https://just-tag.app/fr/restaurants/ville/vevey
6. https://just-tag.app/fr/restaurants/ville/morges
7. https://just-tag.app/fr/restaurants/ville/nyon
8. https://just-tag.app/fr/restaurants/ville/fribourg
9. https://just-tag.app/fr/restaurants/ville/sion
10. https://just-tag.app/fr/restaurants/ville/neuchatel
11. https://just-tag.app/fr/restaurants/ville/la-chaux-de-fonds

**Top cantons (pour maillage)**
12. https://just-tag.app/fr/restaurants/canton/geneve
13. https://just-tag.app/fr/restaurants/canton/vaud
14. https://just-tag.app/fr/restaurants/canton/valais
15. https://just-tag.app/fr/restaurants/canton/fribourg

**Top 15 restaurants (forte autorité : >1 000 avis Google, rating >= 4)**

Sélection manuelle (doublons et POIs non-restaurants écartés). À mettre à jour
trimestriellement via la requête SQL plus bas.

16. https://just-tag.app/fr/restaurants/baren-10 (Bären, Bern, 17 411 avis)
17. https://just-tag.app/fr/restaurants/kiosque-des-bastions (Genève, 8 875)
18. https://just-tag.app/fr/restaurants/molino-pizzeria-ristorante (Genève, 6 127)
19. https://just-tag.app/fr/restaurants/rosengarten (Bern, 6 104)
20. https://just-tag.app/fr/restaurants/buffalo-grill-5 (Crissier, 4 841)
21. https://just-tag.app/fr/restaurants/brasserie-lipp-1 (Genève, 3 968)
22. https://just-tag.app/fr/restaurants/cafe-de-paris (Genève, 3 539)
23. https://just-tag.app/fr/restaurants/hotel-de-ville-16 (La Chaux-de-Fonds, 3 403)
24. https://just-tag.app/fr/restaurants/les-brasseurs-2 (Lausanne, 3 384)
25. https://just-tag.app/fr/restaurants/gurtenblick (Bern, 3 359)
26. https://just-tag.app/fr/restaurants/le-lacustre (Genève, 3 193)
27. https://just-tag.app/fr/restaurants/nooch-asian-kitchen (Bern, 3 175)
28. https://just-tag.app/fr/restaurants/le-coucou (Caux, 3 112)
29. https://just-tag.app/fr/restaurants/king-size-pub (Lausanne, 2 823)
30. https://just-tag.app/fr/restaurants/pizzeria-molino-montreux (Montreux, 2 434)

### Étape 4. Suivi

À 7 jours puis à 14 jours :

- GSC → `Pages` → filtrer "Indexée" et "Détectée, actuellement non indexée".
- Objectif : passage de 5 039 → moins de 1 000 pages "détectée non indexée" d'ici
  3 semaines.
- Si toujours bloqué : vérifier que les nouvelles pages ont bien le header
  `Cache-Control` attendu (via `curl -I`) et qu'elles ne retournent pas 404.

## Requête pour rafraîchir la liste top restos

```sql
select slug, name_fr, city, canton, review_count, avg_rating
from restaurants
where is_published = true
  and canton in ('geneve','vaud','valais','fribourg','neuchatel','jura','berne')
  and review_count > 1000
  and avg_rating >= 4
  and city is not null
  and city <> ''
order by review_count desc nulls last
limit 30;
```

(Puis écarter manuellement les doublons `-N` et les non-restaurants —
chutes d'eau, bars jungfraujoch, etc.)

## Checklist post-déploiement

- [ ] Commit pushé sur `main`, Vercel build OK.
- [ ] `curl -I https://just-tag.app/fr/restaurants/baren-10` renvoie `x-nextjs-cache: HIT`
      (sur le 2e appel).
- [ ] `https://just-tag.app/sitemap.xml` : taille ~12 k URLs (au lieu de ~60 k).
- [ ] Sitemap re-soumis dans GSC.
- [ ] 30 URLs prioritaires soumises pour indexation.
- [ ] Suivi à J+7 et J+14.
