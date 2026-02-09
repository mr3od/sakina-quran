export function pageResolverSubquery(
  suraRef: string,
  ayahRef: string,
): string {
  return `(SELECT ps.page_number
     FROM page_segments ps
     WHERE (ps.sura_start < ${suraRef} OR (ps.sura_start = ${suraRef} AND ps.ayah_start <= ${ayahRef}))
       AND (ps.sura_end > ${suraRef} OR (ps.sura_end = ${suraRef} AND ps.ayah_end >= ${ayahRef}))
     ORDER BY ps.page_number ASC
     LIMIT 1)`;
}
