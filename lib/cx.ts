/**
 * CSS Modules bridge.
 *
 * The Angular components this app was ported from write plain kebab-case class
 * names in their templates (`class="student-portal offers-mode"`). Wrapping the
 * imported module map in `cx` keeps those templates readable after the port:
 * `cx('student-portal', isOffers && 'offers-mode')`.
 *
 * A name with no entry in the module map is passed through unchanged, so global
 * classes defined in `app/globals.css` still work alongside scoped ones.
 */
export type ClassValue = string | false | null | undefined;

export function classNames(styles: Record<string, string>) {
  return (...names: ClassValue[]): string =>
    names
      .filter((name): name is string => Boolean(name))
      .map(name => styles[name] ?? name)
      .join(' ');
}
