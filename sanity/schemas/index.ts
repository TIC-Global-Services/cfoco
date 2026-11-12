import { type SchemaTypeDefinition } from 'sanity';
import { menuCategoryType } from './menuCategory';
import { menuItemType } from './menuItem';
import { locationType } from './location';
import { postType } from './post';
import { categoryType } from './category';
import { jobPostType } from './jobPost';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [menuCategoryType, menuItemType, locationType, postType, categoryType, jobPostType],
};
