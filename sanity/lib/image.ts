import { createImageUrlBuilder } from '@sanity/image-url';
import { dataset, projectId } from '../env';

const imageBuilder = createImageUrlBuilder({
  projectId: projectId || 'placeholder',
  dataset: dataset || 'production',
});

export const urlForImage = (source: any) => {
  if (!source) return null;
  try {
    return imageBuilder.image(source).auto('format').fit('max');
  } catch (err) {
    console.error('Failed to generate image URL from source', err);
    return null;
  }
};
