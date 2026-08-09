/**
 * Serialise un objet destine a etre injecte dans un <script type="application/ld+json">
 * via dangerouslySetInnerHTML, en echappant les sequences qui pourraient permettre
 * une evasion du contexte <script> (XSS stocke).
 *
 * `JSON.stringify` seul n'echappe ni `<`, ni `>`, ni `&`, ni les separateurs de ligne
 * U+2028/U+2029. Si une valeur contient par exemple `</script>`, le parseur HTML ferme
 * prematurement la balise <script> et le reste du contenu devient du HTML/JS executable
 * dans la page. Comme certaines valeurs (ex: nom de restaurant) sont saisies par des
 * utilisateurs authentifies, il faut neutraliser ce vecteur avant l'injection.
 *
 * A utiliser systematiquement a la place de `JSON.stringify(obj)` pour tout JSON-LD
 * injecte via dangerouslySetInnerHTML.
 */
const LINE_SEPARATOR = String.fromCharCode(8232); // U+2028
const PARAGRAPH_SEPARATOR = String.fromCharCode(8233); // U+2029

export function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj)
    .split("<")
    .join("\\u003c")
    .split(">")
    .join("\\u003e")
    .split("&")
    .join("\\u0026")
    .split(LINE_SEPARATOR)
    .join("\\u2028")
    .split(PARAGRAPH_SEPARATOR)
    .join("\\u2029");
}
