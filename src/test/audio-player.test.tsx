import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AudioPlayer, audioTime } from '@/components/academy/AudioPlayer';

describe('Foundation audio player', () => {
  it('formats recording times', () => {expect(audioTime(125)).toBe('2:05');});
  it('offers playback and seeking without links or download controls', () => {
    const {container} = render(<AudioPlayer src="https://barakshar-cdn.b-cdn.net/Prasthavna.mp3" title="Prasthavna" onSave={vi.fn()} onComplete={vi.fn()}/>);
    expect(screen.getByRole('button', {name:'Play recording'})).toBeInTheDocument();
    expect(screen.getByRole('slider', {name:'Recording position'})).toBeInTheDocument();
    expect(container.querySelector('a')).toBeNull();
    expect(container.querySelector('audio')?.hasAttribute('controls')).toBe(false);
  });
  it('resumes and saves progress on pause', () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const {container} = render(<AudioPlayer src="https://barakshar-cdn.b-cdn.net/Prasthavna.mp3" title="Recording" initialPosition={30} onSave={save} onComplete={vi.fn()}/>);
    const audio = container.querySelector('audio');
    if (!audio) throw new Error('Audio missing');
    Object.defineProperty(audio,'duration',{value:120,configurable:true});
    fireEvent.loadedMetadata(audio);
    expect(audio.currentTime).toBe(30);
    audio.currentTime=45;
    fireEvent.pause(audio);
    expect(save).toHaveBeenCalledWith(45,120);
  });
  it('stops showing loading on failure and refreshes the recording on retry', async () => {
    const refresh = vi.fn().mockResolvedValue('https://barakshar-cdn.b-cdn.net/Prasthavna.mp3?token=test-fixture');
    const {container} = render(<AudioPlayer src="https://barakshar-cdn.b-cdn.net/Prasthavna.mp3" title="Retry lesson" onSave={vi.fn()} onComplete={vi.fn()} onRefreshSource={refresh}/>);
    const audio = container.querySelector('audio');
    if (!audio) throw new Error('Audio missing');
    const load = vi.spyOn(audio, 'load').mockImplementation(() => {});
    fireEvent.error(audio);
    expect(screen.queryByText('Loading recording…')).toBeNull();
    expect(screen.getByRole('button', {name:'Play recording'})).toBeDisabled();
    fireEvent.click(screen.getByRole('button', {name:'Retry recording'}));
    await waitFor(() => expect(load).toHaveBeenCalled());
    expect(refresh).toHaveBeenCalledOnce();
    expect(audio.src).toContain('token=test-fixture');
    Object.defineProperty(audio,'duration',{value:120,configurable:true});
    fireEvent.loadedMetadata(audio);
    expect(screen.queryByRole('alert')).toBeNull();
  });
});