/**
 * Helper de pagination Supabase/PostgREST réutilisable.
 *
 * PostgREST plafonne toute réponse à `max_rows` (1000 par défaut) même si le
 * code appelle `.limit(N)` avec N > 1000 ou n'appelle `.limit()` du tout.
 * Pour récupérer l'intégralité d'un jeu de résultats (comptages exhaustifs,
 * regroupements, exports), il faut paginer manuellement via `.range()`,
 * comme le fait déjà `sitemap.ts` pour la liste des restaurants.
 *
 * Cette fonction généralise ce pattern : elle appelle `queryBuilder` avec des
 * bornes `{ from, to }` successives jusqu'à ce qu'un lot renvoie moins de
 * `batchSize` lignes (fin des données) ou qu'une erreur survienne.
 *
 * IMPORTANT : la requête retournée par `queryBuilder` doit reposer sur un
 * ordre stable (idéalement un `.order()` explicite sur une colonne unique
 * comme `id`) pour que la pagination par offset ne saute ni ne duplique de
 * lignes si des écritures concurrentes surviennent pendant la pagination.
 * Pour de simples comptages/regroupements agrégés côté serveur, l'absence
 * d'ordre reste acceptable (un doublon/oubli occasionnel n'affecte pas
 * significativement un total sur des milliers de lignes).
 */
export async function fetchAllRows<T>(
  queryBuilder: (range: {
    from: number;
    to: number;
  }) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
  options: { batchSize?: number; maxRows?: number; onError?: (message: string) => void } = {}
): Promise<T[]> {
  const batchSize = options.batchSize ?? 1000;
  const maxRows = options.maxRows ?? Infinity;
  const rows: T[] = [];
  let from = 0;

  while (rows.length < maxRows) {
    const to = from + batchSize - 1;
    const { data, error } = await queryBuilder({ from, to });

    if (error) {
      options.onError?.(error.message);
      break;
    }
    if (!data || data.length === 0) break;

    rows.push(...data);

    if (data.length < batchSize) break;
    from += batchSize;
  }

  return Number.isFinite(maxRows) ? rows.slice(0, maxRows) : rows;
}
