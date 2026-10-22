import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schema } from './sanity/schemas';
import { apiVersion, dataset, projectId } from './sanity/env';

export default defineConfig({
  basePath: '/studio',
  name: 'cfoco-studio',
  title: 'CFOCO Content Studio',
  projectId: projectId || 'placeholder-id',
  dataset: dataset || 'production',
  schema,
  plugins: [
    structureTool(),
  ],
});
