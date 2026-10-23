import { defineField, defineType } from 'sanity';

export const menuItemType = defineType({
  name: 'menuItem',
  title: 'Menu Item',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Dish / Item Title',
      type: 'string',
      description: 'e.g., Dynamic Wings, Double Cheese Burger, Hot Bucket',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'categoryRef',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'menuCategory' }],
      description: 'Select which category this dish belongs to.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category Slug (Legacy / Fallback)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'categoryName',
      title: 'Category Name (Legacy / Fallback)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'categoryKey',
      title: 'Category Slug Fallback',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'image',
      title: 'Food Image',
      type: 'image',
      description: 'Upload a clear, cut-out photo of the food item (PNG with transparent background recommended).',
      options: { hotspot: true },
    }),
    defineField({
      name: 'imageUrl',
      title: 'Food Image URL Fallback (optional)',
      type: 'string',
      description: 'e.g. /POULET/3_DYNAMIC_IWNGS_.png',
    }),
    defineField({
      name: 'description',
      title: 'Short Description',
      type: 'text',
      rows: 2,
      description: 'Short enticing description shown on the menu card.',
    }),
    defineField({
      name: 'price',
      title: 'Price (Optional)',
      type: 'string',
      description: 'e.g. €9.90, 12€',
    }),
    defineField({
      name: 'badge',
      title: 'Badge (Optional)',
      type: 'string',
      description: 'e.g. 🔥 Best Selling, Signature, New, Spicy',
    }),
    defineField({
      name: 'isBestSeller',
      title: 'Mark as Best Seller',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Controls display order inside this category.',
      initialValue: 1,
    }),
    defineField({
      name: 'cardData',
      title: 'Card & Modal Details (Pop-up Data)',
      type: 'object',
      description: 'Optional popup modal details for this dish. If left empty, clicking the dish card will not open a modal.',
      options: {
        collapsible: true,
        collapsed: false,
      },
      fields: [
        defineField({
          name: 'detailedDescription',
          title: 'Detailed Description',
          type: 'text',
          rows: 3,
          description: 'Extended description shown inside the popup modal.',
        }),
        defineField({
          name: 'includesTitle',
          title: 'Combo / Includes Title',
          type: 'string',
          description: 'e.g. "Combo Includes" or "Whats In Your Bucket?"',
        }),
        defineField({
          name: 'includes',
          title: 'Included Items',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'includeItem',
              title: 'Included Item',
              fields: [
                { name: 'name', title: 'Item Name', type: 'string' },
                { name: 'quantity', title: 'Quantity / Size (Optional)', type: 'string', description: 'e.g. (3pcs), 350ml' },
                {
                  name: 'image',
                  title: 'Upload Image',
                  type: 'image',
                  options: { hotspot: true },
                  description: 'Upload food image (PNG recommended).',
                },
                {
                  name: 'imageUrl',
                  title: 'Fallback Image Path / URL',
                  type: 'string',
                  description: 'Local fallback path if not uploading, e.g. /sides/frites.png',
                },
              ],
              preview: {
                select: {
                  title: 'name',
                  subtitle: 'quantity',
                  media: 'image',
                },
              },
            },
          ],
        }),
        defineField({
          name: 'highlights',
          title: 'Highlights',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'highlightItem',
              title: 'Highlight',
              fields: [
                { name: 'icon', title: 'Icon (e.g. leaf, recipe)', type: 'string' },
                { name: 'title', title: 'Title', type: 'string' },
                { name: 'subtitle', title: 'Subtitle', type: 'string' },
              ],
              preview: {
                select: {
                  title: 'title',
                  subtitle: 'subtitle',
                },
              },
            },
          ],
        }),
        defineField({
          name: 'gallery',
          title: 'Gallery Images',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'galleryItem',
              title: 'Gallery Item',
              fields: [
                { name: 'alt', title: 'Alt Text', type: 'string' },
                {
                  name: 'image',
                  title: 'Upload Image',
                  type: 'image',
                  options: { hotspot: true },
                },
                {
                  name: 'imageUrl',
                  title: 'Fallback Image Path / URL',
                  type: 'string',
                  description: 'Local fallback path if not uploading, e.g. /category/burger.png',
                },
              ],
              preview: {
                select: {
                  title: 'alt',
                  subtitle: 'imageUrl',
                  media: 'image',
                },
              },
            },
          ],
        }),
      ],
    }),

  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      categoryRefTitle: 'categoryRef.name',
      categoryName: 'categoryName',
      category: 'category',
      categoryFallback: 'categoryKey',
      media: 'image',
      price: 'price',
    },
    prepare({ title, categoryRefTitle, categoryName, category, categoryFallback, media, price }) {
      const cat = categoryRefTitle || categoryName || category || categoryFallback || 'Uncategorized';
      const priceText = price ? ` • ${price}` : '';
      return {
        title: title || 'Untitled Item',
        subtitle: `${cat}${priceText}`,
        media,
      };
    },
  },
});

