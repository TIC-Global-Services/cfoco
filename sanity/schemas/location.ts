import { defineField, defineType } from 'sanity';

export const locationType = defineType({
  name: 'location',
  title: 'Location',
  type: 'document',
  fieldsets: [
    { name: 'general', title: 'General Info', options: { collapsible: true, collapsed: false } },
    { name: 'geo', title: 'Geo & Coordinates (Globe / Map)', options: { collapsible: true, collapsed: false } },
    { name: 'tagline', title: 'Tagline & Highlights', options: { collapsible: true, collapsed: true } },
    { name: 'contact', title: 'Address & Opening Hours', options: { collapsible: true, collapsed: true } },
    { name: 'dish', title: 'Signature Dish', options: { collapsible: true, collapsed: true } },
    { name: 'gallery', title: 'Location Images & Tour', options: { collapsible: true, collapsed: true } },
    { name: 'stats', title: 'Features & Statistics', options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    // General Info
    defineField({
      name: 'name',
      title: 'Location Name',
      type: 'string',
      description: 'e.g., Bordeaux Centre, Mérignac, Talence',
      validation: (Rule) => Rule.required(),
      fieldset: 'general',
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL identifier)',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
      fieldset: 'general',
    }),
    defineField({
      name: 'cityTag',
      title: 'City Tag',
      type: 'string',
      description: 'e.g., Bordeaux, France',
      validation: (Rule) => Rule.required(),
      fieldset: 'general',
    }),
    defineField({
      name: 'badge',
      title: 'Badge',
      type: 'string',
      description: 'e.g., Flagship, Airport Hub, Riverside, Student Hub',
      fieldset: 'general',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order in the carousel (1, 2, 3...)',
      initialValue: 1,
      fieldset: 'general',
    }),

    // Geo & Coordinates
    defineField({
      name: 'coordinates',
      title: 'Coordinates (Lat / Lng for 3D Globe)',
      type: 'object',
      fieldset: 'geo',
      fields: [
        defineField({
          name: 'lat',
          title: 'Latitude',
          type: 'number',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'lng',
          title: 'Longitude',
          type: 'number',
          validation: (Rule) => Rule.required(),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mapCoords',
      title: 'Flat Map Position (Optional)',
      type: 'object',
      fieldset: 'geo',
      fields: [
        defineField({ name: 'top', title: 'Top percentage (e.g. 14%)', type: 'string' }),
        defineField({ name: 'left', title: 'Left percentage (e.g. 48.2%)', type: 'string' }),
      ],
    }),

    // Tagline & Highlights
    defineField({
      name: 'tagline',
      title: 'Tagline & Highlights',
      type: 'object',
      fieldset: 'tagline',
      fields: [
        defineField({ name: 'prefix', title: 'Prefix (e.g., Bustling & Bold.)', type: 'string' }),
        defineField({ name: 'highlight', title: 'Highlight (e.g., Our Original.)', type: 'string' }),
        defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
      ],
    }),

    // Address & Contact & Hours
    defineField({
      name: 'address',
      title: 'Address',
      type: 'string',
      fieldset: 'contact',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
      fieldset: 'contact',
    }),
    defineField({
      name: 'mapsUrl',
      title: 'Google Maps Link',
      type: 'url',
      fieldset: 'contact',
    }),
    defineField({
      name: 'openingHours',
      title: 'Opening Hours',
      type: 'object',
      fieldset: 'contact',
      fields: [
        defineField({ name: 'weekday', title: 'Weekday (e.g. Mon–Thu 11:00–23:00)', type: 'string' }),
        defineField({ name: 'weekend', title: 'Weekend (e.g. Fri–Sat 11:00–01:00)', type: 'string' }),
        defineField({ name: 'sunday', title: 'Sunday (e.g. Sun 12:00–22:00)', type: 'string' }),
      ],
    }),

    // Signature Dish
    defineField({
      name: 'signatureDish',
      title: 'Signature Dish',
      type: 'object',
      fieldset: 'dish',
      fields: [
        defineField({ name: 'badge', title: 'Badge (e.g. Signature Dish)', type: 'string', initialValue: 'Signature Dish' }),
        defineField({ name: 'title', title: 'Dish Title', type: 'string' }),
        defineField({ name: 'subtitle', title: 'Dish Subtitle', type: 'string' }),
      ],
    }),

    // Gallery & Tour
    defineField({
      name: 'tourTitle',
      title: 'Tour Title',
      type: 'string',
      initialValue: 'Step Inside The Crunch',
      fieldset: 'gallery',
    }),
    defineField({
      name: 'tourSubtitle',
      title: 'Tour Subtitle',
      type: 'string',
      initialValue: 'Take A Virtual Tour',
      fieldset: 'gallery',
    }),
    defineField({
      name: 'images',
      title: 'Location Photos',
      type: 'object',
      fieldset: 'gallery',
      fields: [
        defineField({
          name: 'storefront',
          title: 'Storefront Image',
          type: 'image',
          options: { hotspot: true },
        }),
        defineField({
          name: 'storefrontUrl',
          title: 'Storefront Image URL Fallback (optional)',
          type: 'string',
        }),
        defineField({
          name: 'kiosks',
          title: 'Kiosks Image',
          type: 'image',
          options: { hotspot: true },
        }),
        defineField({
          name: 'kiosksUrl',
          title: 'Kiosks Image URL Fallback (optional)',
          type: 'string',
        }),
        defineField({
          name: 'dining',
          title: 'Dining Area Image',
          type: 'image',
          options: { hotspot: true },
        }),
        defineField({
          name: 'diningUrl',
          title: 'Dining Image URL Fallback (optional)',
          type: 'string',
        }),
        defineField({
          name: 'barStools',
          title: 'Bar Stools Image',
          type: 'image',
          options: { hotspot: true },
        }),
        defineField({
          name: 'barStoolsUrl',
          title: 'Bar Stools Image URL Fallback (optional)',
          type: 'string',
        }),
        defineField({
          name: 'counter',
          title: 'Counter Image',
          type: 'image',
          options: { hotspot: true },
        }),
        defineField({
          name: 'counterUrl',
          title: 'Counter Image URL Fallback (optional)',
          type: 'string',
        }),
        defineField({
          name: 'virtualTour',
          title: 'Virtual Tour Image',
          type: 'image',
          options: { hotspot: true },
        }),
        defineField({
          name: 'virtualTourUrl',
          title: 'Virtual Tour Image URL Fallback (optional)',
          type: 'string',
        }),
      ],
    }),

    // Features & Statistics
    defineField({
      name: 'features',
      title: 'Features & Amenities',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
      fieldset: 'stats',
    }),
    defineField({
      name: 'stats',
      title: 'Statistics',
      type: 'object',
      fieldset: 'stats',
      fields: [
        defineField({ name: 'established', title: 'Established Year (e.g. 2011)', type: 'string' }),
        defineField({ name: 'capacity', title: 'Seating Capacity (e.g. 85 Seats)', type: 'string' }),
        defineField({ name: 'averageWait', title: 'Average Wait Time (e.g. 4 Mins)', type: 'string' }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'cityTag',
      media: 'images.storefront',
    },
    prepare(selection) {
      const { title, subtitle } = selection;
      return {
        ...selection,
        title: title ? `CFC ${title}` : 'Untitled Location',
        subtitle: subtitle || '',
      };
    },
  },
});
