import { defineField, defineType } from 'sanity';

export const locationReviewsType = defineType({
  name: 'locationReviews',
  title: 'Location Reviews Section',
  type: 'document',
  fields: [
    defineField({
      name: 'overallReviewCount',
      title: 'Overall Reviews Count',
      type: 'string',
      description: 'The big number displayed in the center of the reviews section (e.g. "11,897")',
      initialValue: '11,897',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Section Heading',
      type: 'string',
      description: 'Heading displayed below the review count',
      initialValue: "Reviews Can't Be Wrong",
    }),
    defineField({
      name: 'titleFr',
      title: 'Section Heading (French)',
      type: 'string',
      description: 'e.g., Les avis ne mentent pas',
      initialValue: "Les avis ne mentent pas",
    }),
    defineField({
      name: 'reviews',
      title: 'General Customer Reviews (6 Cards)',
      type: 'array',
      description: 'The 6 customer review cards displayed in the floating vertical scroll timeline',
      validation: (Rule) => Rule.max(12),
      initialValue: [
        {
          authorName: 'Yousra Djeddou',
          rating: 5,
          quote: 'Formules interessantes à partager, on a pris la box wings-tenders cétait pas mal dutout et généreux. Service rapide et efficace.',
        },
        {
          authorName: 'Arm',
          rating: 5,
          quote: "A very nice, clean restaurant with fast service and a warm welcome. There's an outdoor terrace. The tacos are good and quite generous",
        },
        {
          authorName: 'Camille Roussel',
          rating: 5,
          quote: 'Des tenders croustillants marinés au babeurre, des sauces maison qui font toute la différence. Accueil au top !',
        },
        {
          authorName: 'Med saleck',
          rating: 5,
          quote: 'Beautiful place!! The tacos were delicious, the music was great, and just for the service',
        },
        {
          authorName: 'Timeo scerri',
          rating: 5,
          quote: 'The staff were very pleasant and smiling, the food was excellent and served quickly, and the music created a great atmosphere. I highly recommend it',
        },
        {
          authorName: 'Thomas Dubois',
          rating: 5,
          quote: 'Un vrai régal à chaque passage. Le bucket à partager et les frites croustillantes sont tout simplement incontournables.',
        },
      ],
      of: [
        {
          type: 'object',
          name: 'reviewCard',
          title: 'Review Card',
          fields: [
            defineField({
              name: 'authorName',
              title: 'Customer Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'rating',
              title: 'Rating (1-5)',
              type: 'number',
              initialValue: 5,
              validation: (Rule) => Rule.required().min(1).max(5),
            }),
            defineField({
              name: 'quote',
              title: 'Review Quote',
              type: 'text',
              rows: 3,
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'quoteFr',
              title: 'Review Quote (French)',
              type: 'text',
              rows: 3,
              description: 'Optional French translation of the review',
            }),
          ],
          preview: {
            select: {
              title: 'authorName',
              subtitle: 'quote',
              rating: 'rating',
            },
            prepare({ title, subtitle, rating }) {
              return {
                title: `${title || 'Customer'} (${'★'.repeat(rating || 5)})`,
                subtitle,
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      count: 'overallReviewCount',
      title: 'title',
    },
    prepare({ count, title }) {
      return {
        title: `Location Reviews (${count || '11,897'})`,
        subtitle: title || "Reviews Can't Be Wrong",
      };
    },
  },
});
