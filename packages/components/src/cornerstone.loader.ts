import { startLoader } from './cornerstone.js';

export * from './cornerstone.js';

startLoader();

// Remove `cs-cloak` when the autoloader finishes OR after two seconds. This prevents the entire screen from flashing
// when unregistered components get added later on.
Promise.race([
  new Promise((resolve) => document.addEventListener('cs-discovery-complete', resolve)),
  new Promise((resolve) => setTimeout(resolve, 2000)),
]).then(() => {
  document.querySelectorAll('.cs-cloak').forEach((el) => el.classList.remove('cs-cloak'));
});
