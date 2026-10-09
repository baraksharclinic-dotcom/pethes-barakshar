import { useRef, useState } from 'react';
import { Pause, Play, RotateCcw, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const audioTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

export function AudioPlayer({ src, title, initialPosition = 0, onSave, onComplete }: {
  src: string; title: string; initialPosition?: number;
  onSave: (position: number, duration: number) => Promise<void>;
  onComplete: () => Promise<void>;
}) {
  const ref = useRef<HTMLAudioElement>(null);
  const lastSaved = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');
  const [speed, setSpeed] = useState('1');
  const persist = (force = false) => {
    const audio = ref.current;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    if (!force && Math.abs(audio.currentTime - lastSaved.current) < 10) return;
    lastSaved.current = audio.currentTime;
    void onSave(audio.currentTime, audio.duration).catch(() => setError('Listening progress could not be saved.'));
  };
  const seek = (seconds: number) => {
    const audio = ref.current;
    if (!audio || !duration) return;
    audio.currentTime = Math.max(0, Math.min(seconds, duration));
    setPosition(audio.currentTime);
    persist(true);
  };
  return <div className="rounded-lg border bg-card p-5 sm:p-7" onContextMenu={e => e.preventDefault()}>
    <audio ref={ref} src={src} preload="metadata" aria-label={title}
      onLoadedMetadata={() => { const audio = ref.current; if (!audio || !Number.isFinite(audio.duration)) return; setDuration(audio.duration); audio.currentTime = initialPosition >= audio.duration ? 0 : initialPosition; setPosition(audio.currentTime); }}
      onPlay={() => {setPlaying(true);setError('');}} onPause={() => {setPlaying(false);persist(true);}}
      onTimeUpdate={() => {setPosition(ref.current?.currentTime ?? 0);persist();}}
      onEnded={() => {setPlaying(false);persist(true);void onComplete().catch(() => setError('Completion could not be saved.'));}}
      onError={() => setError('This recording is unavailable. Please try again later.')} />
    <div className="flex items-center gap-3">
      <Button size="icon" aria-label={playing ? 'Pause recording' : 'Play recording'} title={playing ? 'Pause' : 'Play'} onClick={async () => {const audio = ref.current;if (!audio) return;if (playing) audio.pause();else try {await audio.play();} catch {setError('Unable to play this recording.');}}}>{playing ? <Pause/> : <Play/>}</Button>
      <div className="min-w-0 flex-1"><p className="break-words font-semibold">{title}</p><p className="text-sm text-muted-foreground">{audioTime(position)} / {audioTime(duration)}</p></div>
    </div>
    <input type="range" aria-label="Recording position" className="mt-6 w-full accent-primary" min={0} max={duration || 1} step={0.1} value={Math.min(position, duration || 1)} disabled={!duration} onChange={e => seek(Number(e.target.value))}/>
    <div className="mt-3 flex items-center justify-between gap-3">
      <div className="flex gap-2"><Button variant="ghost" size="icon" title="Back 15 seconds" aria-label="Back 15 seconds" onClick={() => seek(position - 15)}><RotateCcw/></Button><Button variant="ghost" size="icon" title="Forward 15 seconds" aria-label="Forward 15 seconds" onClick={() => seek(position + 15)}><RotateCw/></Button></div>
      <label className="flex items-center gap-2 text-sm">Speed<select aria-label="Playback speed" className="rounded border bg-background p-2" value={speed} onChange={e => {setSpeed(e.target.value);if (ref.current) ref.current.playbackRate = Number(e.target.value);}}>{['0.75','1','1.25','1.5','2'].map(s => <option key={s} value={s}>{s}×</option>)}</select></label>
    </div>
    <p className="mt-3 text-sm text-muted-foreground">{duration ? `${Math.round(position / duration * 100)}% listened` : 'Loading recording…'}</p>
    {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
  </div>;
}