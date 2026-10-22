export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-16';

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET (defaulting to production)'
);

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';

export const isSanityConfigured = Boolean(
  projectId && projectId !== 'your_project_id_here' && projectId.trim() !== ''
);

export const useCdn = process.env.NODE_ENV === 'production';

export const token = process.env.SANITY_API_READ_TOKEN;

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    console.warn(errorMessage);
  }
  return v as T;
}
