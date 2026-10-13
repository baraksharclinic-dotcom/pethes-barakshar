import { describe, expect, it } from 'vitest';
import { lessonSchema } from '@/lib/lesson-schema';

const lesson = {
  type: 'lesson', course_id: '11111111-1111-1111-1111-111111111111',
  title: 'Surya Upasana', title_mr: '', position: 1, duration_minutes: 45,
  audio_url: 'https://barakshar-cdn.b-cdn.net/weekend/SuryaUpasana.mp3',
  notes_path: null, available_from: null,
};

describe('Audio and PDF lessons', () => {
  it('accepts the weekend recording without any video field', () => {
    expect(lessonSchema.parse(lesson).audio_url).toBe(lesson.audio_url);
  });
  it('trims pasted audio and PDF URLs', () => {
    const result = lessonSchema.parse({...lesson, audio_url: `  ${lesson.audio_url}  `,
      notes_path: ' https://barakshar-cdn.b-cdn.net/weekend/Notes.pdf '});
    expect(result.audio_url).toBe(lesson.audio_url);
    expect(result.notes_path).toBe('https://barakshar-cdn.b-cdn.net/weekend/Notes.pdf');
  });
  it('supports PDF-only lessons and blank optional media', () => {
    expect(lessonSchema.parse({...lesson, audio_url: '', notes_path: '  '}).notes_path).toBeNull();
    expect(lessonSchema.parse({...lesson, audio_url: '  ', notes_path: 'https://barakshar-cdn.b-cdn.net/Notes.pdf'}).audio_url).toBe('');
  });
  it.each(['not a url', 'http://barakshar-cdn.b-cdn.net/audio.mp3', 'https://other.example/audio.mp3'])('rejects invalid audio safely: %s', audio_url => {
    expect(lessonSchema.safeParse({...lesson, audio_url}).success).toBe(false);
  });
  it('rejects non-PDF notes and malformed URLs without throwing', () => {
    expect(lessonSchema.safeParse({...lesson, notes_path: lesson.audio_url}).success).toBe(false);
    expect(lessonSchema.safeParse({...lesson, notes_path: 'not a url'}).success).toBe(false);
  });
});