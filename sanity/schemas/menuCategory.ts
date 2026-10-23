import { defineField, defineType } from 'sanity';

export const menuCategoryType = defineType({
  name: 'menuCategory',
  title: 'Menu Category',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Category Name',
      type: 'string',
      description: 'e.g. Poulet, Burgers, Riz Box, Tacos, Wraps, Desserts, Sides, Rice Variety',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (Identifier)',
      type: 'slug',
      description: 'Click "Generate" to create a URL-friendly identifier.',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Category Icon / Illustration',
      type: 'image',
      description: 'Upload the icon image shown in the top category navigation strip.',
      options: { hotspot: true },
    }),
    defineField({
      name: 'iconUrl',
      title: 'Default Icon URL Fallback (optional)',
      type: 'string',
      description: 'e.g. /category/burger.png or /cfc_bucket.png',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Position in the navigation bar (1 = first, 2 = second, etc.)',
      initialValue: 1,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Short Description (Optional)',
      type: 'text',
      rows: 2,
    }),
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'slug.current',
      media: 'icon',
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title || 'Untitled Category',
        subtitle: subtitle ? `slug: ${subtitle}` : '',
        media,
      };
    },
  },
});
