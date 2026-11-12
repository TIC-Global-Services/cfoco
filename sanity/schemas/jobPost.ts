import { defineField, defineType } from 'sanity';

export const jobPostType = defineType({
  name: 'jobPost',
  title: 'Job Post',
  type: 'document',
  groups: [
    { name: 'details', title: 'Job Details', default: true },
    { name: 'apply', title: 'Apply Method' },
  ],
  fields: [
    // ── Job Details ───────────────────────────────────────────────────────────
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      description: 'e.g. Store Supervisor',
      validation: (Rule) => Rule.required(),
      group: 'details',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'e.g. Bordeaux Centre',
      validation: (Rule) => Rule.required(),
      group: 'details',
    }),
    defineField({
      name: 'type',
      title: 'Employment Type',
      type: 'string',
      description: 'e.g. Full-Time, Part-Time, Full & Part-Time',
      initialValue: 'Full-Time',
      group: 'details',
    }),
    defineField({
      name: 'youare',
      title: 'You Are',
      type: 'string',
      description: 'Short description of the ideal candidate',
      group: 'details',
    }),
    defineField({
      name: 'nicetohave',
      title: 'Nice To Have',
      type: 'string',
      group: 'details',
    }),
    defineField({
      name: 'hours',
      title: 'Hours',
      type: 'string',
      group: 'details',
    }),
    defineField({
      name: 'pay',
      title: 'Pay',
      type: 'string',
      group: 'details',
    }),

    // ── Apply Method ──────────────────────────────────────────────────────────
    defineField({
      name: 'applyMethod',
      title: 'Apply Method',
      type: 'string',
      group: 'apply',
      options: {
        list: [
          { title: 'Email', value: 'email' },
          { title: 'Link (External URL)', value: 'link' },
        ],
        layout: 'radio',
      },
      initialValue: 'email',
      validation: (Rule) => Rule.required(),
    }),

    // Shown only when applyMethod === 'email'
    defineField({
      name: 'applyEmail',
      title: 'Application Email Address',
      type: 'string',
      description: 'Candidates will be directed to send their CV to this address',
      group: 'apply',
      hidden: ({ document }) => document?.applyMethod !== 'email',
      validation: (Rule) =>
        Rule.custom((val, ctx) => {
          if (ctx.document?.applyMethod !== 'email') return true;
          if (!val) return 'Email address is required when Apply Method is Email';
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(val) ? true : 'Please enter a valid email address';
        }),
    }),
    defineField({
      name: 'applySubject',
      title: 'Email Subject',
      type: 'string',
      description: 'Pre-filled subject line. Use {role} and {location} as placeholders.',
      initialValue: 'Application for {role} at {location}',
      group: 'apply',
      hidden: ({ document }) => document?.applyMethod !== 'email',
    }),

    // Shown only when applyMethod === 'link'
    defineField({
      name: 'applyLink',
      title: 'Application Link (URL)',
      type: 'url',
      description: 'External link to the job application form or listing',
      group: 'apply',
      hidden: ({ document }) => document?.applyMethod !== 'link',
      validation: (Rule) =>
        Rule.custom((val, ctx) => {
          if (ctx.document?.applyMethod !== 'link') return true;
          if (!val) return 'URL is required when Apply Method is Link';
          return true;
        }),
    }),
  ],

  preview: {
    select: {
      title: 'role',
      subtitle: 'location',
      type: 'type',
      method: 'applyMethod',
    },
    prepare({ title, subtitle, type, method }) {
      return {
        title: title ?? 'Untitled Role',
        subtitle: `${subtitle ?? ''}${type ? ` · ${type}` : ''} — Apply via ${method ?? '?'}`,
      };
    },
  },

  orderings: [
    {
      title: 'Newest First',
      name: 'createdAtDesc',
      by: [{ field: '_createdAt', direction: 'desc' }],
    },
  ],
});
