// Throwaway: Chromium only, with experimental web platform features on, to see Reference Target behaviour.
import { playwrightLauncher } from '@web/test-runner-playwright';
import research from './web-test-runner.research.config.js';

export default {
  ...research,
  browsers: [
    playwrightLauncher({
      product: 'chromium',
      concurrency: 1,
      launchOptions: {
        args: ['--enable-experimental-web-platform-features', '--enable-blink-features=ShadowRootReferenceTarget'],
      },
    }),
  ],
};
