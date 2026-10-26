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
    structureTool({
      structure: (S) =>
        S.list()
          .title('CFOCO Admin')
          .items([
            S.listItem()
              .title('Menu Items / Dishes')
              .child(S.documentTypeList('menuItem').title('Menu Items')),
            S.divider(),
            S.listItem()
              .title('Restaurant Locations')
              .child(S.documentTypeList('location').title('Restaurant Locations')),
            S.divider(),
            S.listItem()
              .title('Blogs')
              .child(S.documentTypeList('post').title('Blogs')),
          ]),
    }),
  ],
});
