import { z } from 'zod';

const bunnyUrl = (pdf: boolean) => z.string().trim().refine(value => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'barakshar-cdn.b-cdn.net'
      && !url.username && !url.password
      && (!pdf || url.pathname.toLowerCase().endsWith('.pdf'));
  } catch {
    return false;
  }
}, pdf ? 'Use your Bunny CDN PDF URL' : 'Use your Bunny CDN audio URL');

export const lessonSchema = z.object({
  type: z.literal('lesson'),
  id: z.string().uuid().optional(),
  course_id: z.string().uuid(),
  title: z.string().min(2),
  title_mr: z.string(),
  position: z.number().int().min(0),
  duration_minutes: z.number().int().min(1),
  audio_url: bunnyUrl(false),
  available_from: z.string().nullable(),
  notes_path: bunnyUrl(true).nullable().transform(value => value || null),
});