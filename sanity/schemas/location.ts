import { defineField, defineType } from 'sanity';

export const locationType = defineType({
  name: 'location',
  title: 'Restaurant Location',
  type: 'document',
  groups: [
    { name: 'basicInfo', title: 'Basic Information', default: true },
    { name: 'hero', title: 'Hero Section' },
    { name: 'experience', title: 'Experience Section' },
    { name: 'virtualTour', title: 'Virtual Tour Section' },
  ],
  fields: [
    // ========================================================================
    // TAB 1: BASIC INFORMATION
    // ========================================================================
    defineField({
      name: 'name',
      title: 'Restaurant Name',
      type: 'string',
      description: 'e.g., Bordeaux Centre, Mérignac, Talence',
      validation: (Rule) => Rule.required(),
      group: 'basicInfo',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
      group: 'basicInfo',
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
      description: 'e.g., Bordeaux, Mérignac, Talence, Pessac',
      validation: (Rule) => Rule.required(),
      group: 'basicInfo',
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
      description: 'e.g., France',
      initialValue: 'France',
      validation: (Rule) => Rule.required(),
      group: 'basicInfo',
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'string',
      description: 'e.g., 14 Rue Sainte-Catherine, 33000 Bordeaux',
      validation: (Rule) => Rule.required(),
      group: 'basicInfo',
    }),
    defineField({
      name: 'latitude',
      title: 'Latitude',
      type: 'number',
      description: 'e.g., 44.8416106 (Used for 3D Globe & Maps)',
      validation: (Rule) => Rule.required(),
      group: 'basicInfo',
    }),
    defineField({
      name: 'longitude',
      title: 'Longitude',
      type: 'number',
      description: 'e.g., -0.5810938 (Used for 3D Globe & Maps)',
      validation: (Rule) => Rule.required(),
      group: 'basicInfo',
    }),
    defineField({
      name: 'badge',
      title: 'Badge (Optional)',
      type: 'string',
      description: 'e.g., Flagship, Airport Hub, Riverside, Student Hub',
      group: 'basicInfo',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 1,
      group: 'basicInfo',
    }),

    // ========================================================================
    // TAB 2: HERO SECTION
    // ========================================================================
    defineField({
      name: 'heroBackgroundImage',
      title: 'Background Image',
      type: 'image',
      options: { hotspot: true },
      description: 'High-resolution hero storefront banner',
      group: 'hero',
    }),
    defineField({
      name: 'heroBackgroundImageUrl',
      title: 'Background Image URL Fallback',
      type: 'string',
      description: 'Fallback path if no image file uploaded (e.g. /location_details-hero.jpg)',
      group: 'hero',
    }),
    defineField({
      name: 'heroLocationLabel',
      title: 'Location Label',
      type: 'string',
      description: 'Badge or pin label (e.g., Bordeaux, France or CFC Tasty)',
      group: 'hero',
    }),
    defineField({
      name: 'heroHeading',
      title: 'Heading',
      type: 'string',
      description: 'Main location title displayed in the hero banner (e.g., Bordeaux Centre)',
      group: 'hero',
    }),
    defineField({
      name: 'heroDescription',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Tagline & description beneath the heading',
      group: 'hero',
    }),
    defineField({
      name: 'heroDirectionsUrl',
      title: 'Directions URL',
      type: 'url',
      description: 'Google Maps link for the Get Directions button',
      group: 'hero',
    }),

    // ========================================================================
    // TAB 3: EXPERIENCE SECTION
    // ========================================================================
    defineField({
      name: 'interiorImages',
      title: 'Restaurant Interior Images',
      type: 'object',
      description: 'Photographs of the dining area, bar seating, and service counters',
      group: 'experience',
      fields: [
        defineField({
          name: 'dining',
          title: 'Dining Area Image',
          type: 'image',
          options: { hotspot: true },
        }),
        defineField({
          name: 'diningUrl',
          title: 'Dining Area URL Fallback',
          type: 'string',
        }),
        defineField({
          name: 'barStools',
          title: 'Bar Stools / High-top Seating Image',
          type: 'image',
          options: { hotspot: true },
        }),
        defineField({
          name: 'barStoolsUrl',
          title: 'Bar Stools URL Fallback',
          type: 'string',
        }),
        defineField({
          name: 'counter',
          title: 'Service Counter Image',
          type: 'image',
          options: { hotspot: true },
        }),
        defineField({
          name: 'counterUrl',
          title: 'Service Counter URL Fallback',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'orderingKioskImage',
      title: 'Ordering Kiosk Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Photo of the digital ordering kiosks',
      group: 'experience',
    }),
    defineField({
      name: 'orderingKioskImageUrl',
      title: 'Ordering Kiosk Image URL Fallback',
      type: 'string',
      group: 'experience',
    }),
    defineField({
      name: 'signatureDish',
      title: 'Signature Dish',
      type: 'object',
      group: 'experience',
      fields: [
        defineField({
          name: 'badge',
          title: 'Badge',
          type: 'string',
          initialValue: 'Signature Dish',
        }),
        defineField({
          name: 'title',
          title: 'Dish Title',
          type: 'string',
          description: 'e.g., The Original Tender Box.',
        }),
        defineField({
          name: 'subtitle',
          title: 'Dish Subtitle',
          type: 'string',
          description: 'e.g., The Recipe That Started The Obsession',
        }),
        defineField({
          name: 'image',
          title: 'Dish Image',
          type: 'image',
          options: { hotspot: true },
        }),
        defineField({
          name: 'imageUrl',
          title: 'Dish Image URL Fallback',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'openingHours',
      title: 'Opening Hours',
      type: 'object',
      group: 'experience',
      fields: [
        defineField({
          name: 'weekday',
          title: 'Weekday (e.g. Mon–Thu 11:00–23:00)',
          type: 'string',
        }),
        defineField({
          name: 'weekend',
          title: 'Weekend (e.g. Fri–Sat 11:00–01:00)',
          type: 'string',
        }),
        defineField({
          name: 'sunday',
          title: 'Sunday (e.g. Sun 12:00–22:00)',
          type: 'string',
        }),
      ],
    }),

    // ========================================================================
    // TAB 4: VIRTUAL TOUR SECTION
    // ========================================================================
    defineField({
      name: 'virtualTourBackgroundImage',
      title: 'Background Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Ambiance / panorama background for the virtual tour banner',
      group: 'virtualTour',
    }),
    defineField({
      name: 'virtualTourBackgroundImageUrl',
      title: 'Background Image URL Fallback',
      type: 'string',
      description: 'Fallback image path (e.g. /cfc_ambience.jpg)',
      group: 'virtualTour',
    }),
    defineField({
      name: 'virtualTourHeading',
      title: 'Heading',
      type: 'string',
      initialValue: 'Step Inside The Crunch',
      description: 'Banner heading text',
      group: 'virtualTour',
    }),
    defineField({
      name: 'virtualTourButtonText',
      title: 'Button Text',
      type: 'string',
      initialValue: 'Take A Virtual Tour',
      description: 'CTA button label',
      group: 'virtualTour',
    }),
    defineField({
      name: 'virtualTourUrl',
      title: 'Virtual Tour URL',
      type: 'url',
      description: 'URL to the 360° interactive experience (e.g. Matterport or web tour)',
      group: 'virtualTour',
    }),

    // ========================================================================
    // BACKWARD COMPATIBILITY / DEPRECATED FIELD CLEANUP (hidden from studio UI)
    // ========================================================================
    defineField({ name: 'cityTag', title: 'Legacy City Tag', type: 'string', hidden: true }),
    defineField({ name: 'phone', title: 'Legacy Phone', type: 'string', hidden: true }),
    defineField({ name: 'mapsUrl', title: 'Legacy Maps URL', type: 'url', hidden: true }),
    defineField({ name: 'coordinates', title: 'Legacy Coordinates', type: 'object', hidden: true, fields: [
      defineField({ name: 'lat', type: 'number' }),
      defineField({ name: 'lng', type: 'number' }),
    ]}),
    defineField({ name: 'mapCoords', title: 'Legacy Map Coords', type: 'object', hidden: true, fields: [
      defineField({ name: 'top', type: 'string' }),
      defineField({ name: 'left', type: 'string' }),
    ]}),
    defineField({ name: 'tagline', title: 'Legacy Tagline', type: 'object', hidden: true, fields: [
      defineField({ name: 'prefix', type: 'string' }),
      defineField({ name: 'highlight', type: 'string' }),
      defineField({ name: 'description', type: 'text' }),
    ]}),
    defineField({ name: 'images', title: 'Legacy Images', type: 'object', hidden: true, fields: [
      defineField({ name: 'storefrontUrl', type: 'string' }),
      defineField({ name: 'kiosksUrl', type: 'string' }),
      defineField({ name: 'diningUrl', type: 'string' }),
      defineField({ name: 'barStoolsUrl', type: 'string' }),
      defineField({ name: 'counterUrl', type: 'string' }),
      defineField({ name: 'virtualTourUrl', type: 'string' }),
    ]}),
    defineField({ name: 'tourTitle', title: 'Legacy Tour Title', type: 'string', hidden: true }),
    defineField({ name: 'tourSubtitle', title: 'Legacy Tour Subtitle', type: 'string', hidden: true }),
    defineField({ name: 'features', title: 'Legacy Features', type: 'array', of: [{ type: 'string' }], hidden: true }),
    defineField({ name: 'stats', title: 'Legacy Stats', type: 'object', hidden: true, fields: [
      defineField({ name: 'established', type: 'string' }),
      defineField({ name: 'capacity', type: 'string' }),
      defineField({ name: 'averageWait', type: 'string' }),
    ]}),
    defineField({ name: 'hero', title: 'Legacy Hero Object', type: 'object', hidden: true, fields: [
      defineField({ name: 'backgroundImageUrl', type: 'string' }),
      defineField({ name: 'locationLabel', type: 'string' }),
      defineField({ name: 'heading', type: 'string' }),
      defineField({ name: 'description', type: 'string' }),
      defineField({ name: 'directionsUrl', type: 'string' }),
    ]}),
    defineField({ name: 'experience', title: 'Legacy Experience Object', type: 'object', hidden: true, fields: [
      defineField({ name: 'orderingKioskImageUrl', type: 'string' }),
    ]}),
    defineField({ name: 'virtualTour', title: 'Legacy Virtual Tour Object', type: 'object', hidden: true, fields: [
      defineField({ name: 'backgroundImageUrl', type: 'string' }),
      defineField({ name: 'heading', type: 'string' }),
      defineField({ name: 'buttonText', type: 'string' }),
      defineField({ name: 'virtualTourUrl', type: 'string' }),
    ]}),
  ],
  preview: {
    select: {
      title: 'name',
      city: 'city',
      country: 'country',
      media: 'heroBackgroundImage',
    },
    prepare(selection) {
      const { title, city, country } = selection;
      const subtitle = [city, country].filter(Boolean).join(', ');
      return {
        ...selection,
        title: title ? `CFC ${title}` : 'Untitled Location',
        subtitle: subtitle || 'Restaurant Location',
      };
    },
  },
});
