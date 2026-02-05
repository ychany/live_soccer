import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'kickoff',
  brand: {
    displayName: '킥오프',
    primaryColor: '#10B981',
    icon: 'https://kickoff-live.vercel.app/kickoff_icon.png',
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'vite build',
    },
  },
  permissions: [],
});
