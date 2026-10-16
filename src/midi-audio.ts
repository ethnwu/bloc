import {Midi} from '@tonejs/midi';
const sampleRate=22050,limit=30*1024*1024;
export function isMidi(file:Pick<File,'name'|'type'>){return /\.midi?$/i.test(file.name)||/^(audio\/(x-)?midi|audio\/mid|application\/(x-)?midi)$/i.test(file.type)}
export function readMidi(bytes:ArrayBuffer){
 let midi:Midi;try{midi=new Midi(bytes)}catch{throw new Error('This MIDI file could not be read. Export it as a standard .mid file and try again.')}
 const notes=midi.tracks.flatMap(t=>t.notes);if(!notes.length)throw new Error('This MIDI file has no notes to play.');
 if(notes.length>30000)throw new Error('This MIDI has too many notes to render. Export an audio version instead.');
 const duration=midi.duration+2;if(!Number.isFinite(duration)||duration<=0||duration*sampleRate*2+44>limit)throw new Error('This MIDI is too long to render within the 30 MB audio limit. Export a shorter track or an MP3.');
 return{midi,duration};
}
export function encodeWav(samples:Float32Array,rate=sampleRate):ArrayBuffer{
 const bytes=new ArrayBuffer(44+samples.length*2),v=new DataView(bytes);const text=(offset:number,s:string)=>{for(let i=0;i<s.length;i++)v.setUint8(offset+i,s.charCodeAt(i))};
 text(0,'RIFF');v.setUint32(4,36+samples.length*2,true);text(8,'WAVE');text(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);text(36,'data');v.setUint32(40,samples.length*2,true);
 let peak=0;for(const s of samples)peak=Math.max(peak,Math.abs(s));const scale=peak>.92?.92/peak:1;
 for(let i=0;i<samples.length;i++){const s=Math.max(-1,Math.min(1,samples[i]*scale));v.setInt16(44+i*2,s<0?s*32768:s*32767,true)}return bytes;
}
export async function renderMidi(file:File):Promise<File>{
 const {midi,duration}=readMidi(await file.arrayBuffer());
 if(typeof OfflineAudioContext==='undefined')throw new Error('MIDI rendering is unavailable in this browser. Try an updated browser or upload an MP3.');
 const context=new OfflineAudioContext(1,Math.ceil(duration*sampleRate),sampleRate),master=context.createGain();master.gain.value=.24;master.connect(context.destination);
 // A bundled rehearsal synth avoids external soundfonts and works on iPad.
 for(const track of midi.tracks){
  const pedal=track.controlChanges[64]||[],volumes=track.controlChanges[7]||[],expressions=track.controlChanges[11]||[];
  const valueAt=(events:typeof pedal,time:number,fallback:number)=>{let value=fallback;for(const event of events){if(event.time>time)break;value=event.value}return value};
  for(const note of track.notes){
   const start=Math.max(0,note.time),naturalEnd=start+Math.max(.04,note.duration);let end=naturalEnd;
   if(valueAt(pedal,naturalEnd,0)>=.5)end=pedal.find(p=>p.time>naturalEnd&&p.value<.5)?.time??Math.min(duration-1,naturalEnd+3);
   const velocity=note.velocity*valueAt(volumes,start,1)*valueAt(expressions,start,1);
   if(velocity<=0)continue;
   const gain=context.createGain();gain.connect(master);gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(velocity,start+.008);gain.gain.exponentialRampToValueAtTime(Math.max(.001,velocity*.28),Math.max(start+.02,end));gain.gain.exponentialRampToValueAtTime(.0001,Math.min(duration,end+.65));
   const osc=context.createOscillator();osc.type=track.channel===9?'triangle':'sine';osc.frequency.value=440*Math.pow(2,(note.midi-69)/12);osc.connect(gain);osc.start(start);osc.stop(Math.min(duration,end+.7));
   if(track.channel!==9){const harmonic=context.createOscillator(),level=context.createGain();harmonic.type='sine';harmonic.frequency.value=osc.frequency.value*2;level.gain.value=.22;harmonic.connect(level);level.connect(gain);harmonic.start(start);harmonic.stop(Math.min(duration,end+.7))}
  }
 }
 let rendered:AudioBuffer;try{rendered=await context.startRendering()}catch{throw new Error('This device could not render the MIDI. Try a shorter file or upload an MP3.')}
 return new File([encodeWav(rendered.getChannelData(0))],file.name.replace(/\.(mid|midi)$/i,'')+' (MIDI rehearsal).wav',{type:'audio/wav'});
}
