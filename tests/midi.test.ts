import {describe,it,expect} from 'vitest';
import {Midi} from '@tonejs/midi';
import {isMidi,readMidi,encodeWav} from '../src/midi-audio';
describe('MIDI rehearsal audio',()=>{
 it('recognizes common MIDI extensions and MIME types',()=>{expect(isMidi({name:'Opener.MID',type:''})).toBe(true);expect(isMidi({name:'song',type:'audio/x-midi'})).toBe(true);expect(isMidi({name:'song.mp3',type:'audio/mpeg'})).toBe(false)});
 it('preserves note times, tempos, and simultaneous tracks when parsing',()=>{const m=new Midi();m.header.setTempo(90);m.addTrack().addNote({midi:60,time:1,duration:2,velocity:.8});m.addTrack().addNote({midi:67,time:1,duration:1,velocity:.6});const {midi,duration}=readMidi(Uint8Array.from(m.toArray()).buffer);expect(midi.tracks).toHaveLength(2);expect(midi.tracks[0].notes[0].time).toBeCloseTo(1,2);expect(midi.tracks[0].notes[0].duration).toBeCloseTo(2,2);expect(duration).toBeCloseTo(5,2)});
 it('rejects empty and malformed MIDI',()=>{expect(()=>readMidi(new ArrayBuffer(4))).toThrow();expect(()=>readMidi(Uint8Array.from(new Midi().toArray()).buffer)).toThrow('no notes')});
 it('encodes valid PCM WAV and normalizes clipping peaks',()=>{const wave=new DataView(encodeWav(new Float32Array([0,2,-2])));expect(wave.getUint32(24,true)).toBe(22050);expect(wave.getUint32(40,true)).toBe(6);expect(wave.getUint16(22,true)).toBe(1);expect(wave.getInt16(46,true)).toBeLessThan(32767);expect(wave.getInt16(48,true)).toBeGreaterThan(-32768)});
});
