import type CsIcon from '../icon/icon.js';
import brandsLibrary from './library.brands.js';
import defaultLibrary from './library.default.js';
import systemLibrary from './library.system.js';

export type IconLibraryHostElement = CsIcon;
export type IconLibraryResolver = (
  name: string,
  family: string,
  variant: string,
  autoWidth: boolean,
  weight: number,
) => string | Promise<string>;
export type IconLibraryMutator = (svg: SVGElement, hostElement?: IconLibraryHostElement) => void;
export interface IconLibrary {
  name: string;
  resolver: IconLibraryResolver;
  mutator?: IconLibraryMutator;
  spriteSheet?: boolean;
}

let defaultIconFamily = 'sharp';
let registry: IconLibrary[] = [defaultLibrary, systemLibrary, brandsLibrary];
const watchedIcons: Set<CsIcon> = new Set();

/** Adds an icon to the list of watched icons. */
export function watchIcon(icon: CsIcon) {
  watchedIcons.add(icon);
}

/** Removes an icon from the list of watched icons. */
export function unwatchIcon(icon: CsIcon) {
  watchedIcons.delete(icon);
}

/** Returns a library from the registry. */
export function getIconLibrary(name?: string) {
  return registry.find((lib) => lib.name === name);
}

/** Adds an icon library to the registry, or overrides an existing one. */
export function registerIconLibrary(name: string, options: Omit<IconLibrary, 'name'>) {
  unregisterIconLibrary(name);
  registry.push({
    name,
    resolver: options.resolver,
    mutator: options.mutator,
    spriteSheet: options.spriteSheet,
  });

  // Redraw watched icons
  watchedIcons.forEach((icon) => {
    if (icon.library === name) {
      icon.setIcon();
    }
  });
}

/** Removes an icon library from the registry. */
export function unregisterIconLibrary(name: string) {
  registry = registry.filter((lib) => lib.name !== name);
}

/** Sets the default icon family. */
export function setDefaultIconFamily(family: string) {
  defaultIconFamily = family;

  // Update watched icons
  watchedIcons.forEach((icon) => icon.setIcon());
}

/** Gets the default icon family. */
export function getDefaultIconFamily() {
  return defaultIconFamily;
}
