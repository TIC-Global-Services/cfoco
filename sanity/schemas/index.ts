import { type SchemaTypeDefinition } from 'sanity';
import { menuCategoryType } from './menuCategory';
import { menuItemType } from './menuItem';
import { locationType } from './location';
import { postType } from './post';
import { authorType } from './author';
import { categoryType } from './category';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [menuCategoryType, menuItemType, locationType, postType, authorType, categoryType],
};
