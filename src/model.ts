import { z } from 'zod';
export type Point={x:number;y:number;queued?:boolean};
export type CastGroup={id:string;name:string;color:string};
export type PropType={id:string;name:string;symbol:"circle"|"triangle"|"square"|"diamond"|"star";color:string;outline:boolean};
export type PropPlacement={id:string;typeId:string;performerId?:string;x:number;y:number;label?:string};
export type NumberLine={mode:"mirrored"|"signed"|"sequence"|"custom"|"none";step:number;reverse:boolean;extent?:number;labels?:string};
export type Performer={id:string;name:string;number:string;part:string;color:string;groupId?:string};
export type Deck={id:string;x:number;y:number;width:number;depth:number;height:number;label:string};
export type Stage={width:number;depth:number;decks:Deck[];name?:string;numberLine?:NumberLine};
export type Chart={id:string;name:string;cue:string;at:number;travel:number;notes:string;positions:Record<string,Point>;props?:PropPlacement[];partners?:Record<string,string>};
export type Song={id:string;name:string;bpm:number;charts:Chart[];track?:{id:string;name:string;size:number}};
export type Show={id:string;name:string;ensemble:string;stage:Stage;cast:Performer[];songs:Song[];groups?:CastGroup[];propTypes?:PropType[];color?:string};
export type ProjectSummary={id:string;name:string;ensemble:string;revision:number;updated_at:number;archived:number;color?:string;role?:string};
export const palette=['#567666','#b68155','#707b9c','#96758c','#4f8790','#8d8b53'];
export const newId=()=>crypto.randomUUID();
export function riserPreset(rows:number,columns=4):Deck[]{return Array.from({length:rows*columns},(_,i)=>({id:newId(),x:8+(i%columns)*8,y:1+Math.floor(i/columns)*4,width:8,depth:4,height:(rows-Math.floor(i/columns))*8,label:''}))}
export function makeChart(name='Opening',at=0,positions:Record<string,Point>={}):Chart{return{id:newId(),name,cue:'',at,travel:2,notes:'',positions:structuredClone(positions)}}
export function makeSong(name='Untitled song'):Song{return{id:newId(),name,bpm:120,charts:[makeChart()]}}
export function makeShow(name:string,ensemble='',rows=3):Show{return{id:newId(),name,ensemble,stage:{width:48,depth:24,decks:riserPreset(rows),numberLine:{mode:"mirrored",step:4,reverse:false,extent:20}},groups:[],propTypes:[],color:palette[0],cast:[],songs:[makeSong('Opening number')]}}
export function wingPoint(i:number,width:number,side:'left'|'right'='right'):Point{const col=Math.floor(i/12)%3;return{x:side==='right'?-7+col*2.5:width+2+col*2.5,y:2+(i%12)*2.4}}
export function addCast(show:Show,people:Omit<Performer,'id'>[]):Show{const copy=structuredClone(show);for(const p of people){const person={...p,id:newId()};copy.cast.push(person);copy.songs.forEach(s=>s.charts.forEach(c=>c.positions[person.id]=wingPoint(copy.cast.length-1,copy.stage.width)))}return copy}
export function sampleShow():Show{let s=makeShow('Competition set','Sample ensemble');s=addCast(s,Array.from({length:36},(_,i)=>({name:['Alex','Jordan','Morgan','Taylor','Riley','Sam'][i%6]+' '+(i+1),number:String(i+1),part:['Soprano','Alto','Tenor','Bass'][Math.floor(i/9)],color:palette[Math.floor(i/9)]})));const positions=Object.fromEntries(s.cast.map((p,i)=>[p.id,{x:10+(i%12)*2.55,y:3+Math.floor(i/12)*4}]));s.songs[0].charts=[makeChart('Opening picture',0,positions),makeChart('Verse 1',8,Object.fromEntries(s.cast.map((p,i)=>[p.id,{x:6+(i%9)*4.5,y:8+Math.floor(i/9)*5}]))),makeChart('Chorus',16,Object.fromEntries(s.cast.map((p,i)=>[p.id,{x:8+(i%12)*2.9,y:12+Math.floor(i/12)*5}])) )];s.songs[0].charts[1].cue='“Here we go” · m. 9';s.songs[0].charts[2].cue='First chorus · m. 17';return s}
// A chart is the picture reached at its cue. Travel happens immediately before it.
export function positionsAt(song:Song,time:number):{positions:Record<string,Point>;index:number}{const charts=song.charts;if(!charts.length)return{positions:{},index:0};let i=0;while(i+1<charts.length&&time>=charts[i+1].at)i++;const a=charts[i],b=charts[i+1];if(!b)return{positions:a.positions,index:i};const start=Math.max(a.at,b.at-b.travel);if(time<=start)return{positions:a.positions,index:i};const p=Math.max(0,Math.min(1,(time-start)/(b.at-start||1)));return{index:i,positions:Object.fromEntries(Object.entries(a.positions).map(([id,point])=>{const end=b.positions[id]||point;return[id,point.queued||end.queued?(p<1?point:end):{x:point.x+(end.x-point.x)*p,y:point.y+(end.y-point.y)*p}]}))}}
const point=z.object({x:z.number().min(-8).max(128),y:z.number().min(0).max(100),queued:z.boolean().optional()});const id=z.string().min(1).max(80);
export const showSchema=z.object({id,name:z.string().trim().min(1).max(100),ensemble:z.string().max(100),color:z.string().regex(/^#[0-9a-f]{6}$/i).optional(),groups:z.array(z.object({id,name:z.string().min(1).max(60),color:z.string().regex(/^#[0-9a-f]{6}$/i)})).max(50).optional(),propTypes:z.array(z.object({id,name:z.string().min(1).max(60),symbol:z.enum(['circle','triangle','square','diamond','star']),color:z.string().regex(/^#[0-9a-f]{6}$/i),outline:z.boolean()})).max(50).optional(),stage:z.object({name:z.string().max(80).optional(),numberLine:z.object({mode:z.enum(['mirrored','signed','sequence','custom','none']),step:z.number().min(1).max(16),reverse:z.boolean(),extent:z.number().min(4).max(60).optional(),labels:z.string().max(400).optional()}).optional(),width:z.number().min(16).max(120),depth:z.number().min(12).max(100),decks:z.array(z.object({id,x:z.number().min(0).max(120),y:z.number().min(0).max(100),width:z.number().min(1).max(32),depth:z.number().min(1).max(16),height:z.number().min(0).max(96),label:z.string().max(40)})).max(80)}),cast:z.array(z.object({id,name:z.string().min(1).max(80),number:z.string().max(8),part:z.string().max(40),groupId:id.optional(),color:z.string().regex(/^#[0-9a-f]{6}$/i)})).max(150),songs:z.array(z.object({id,name:z.string().min(1).max(100),bpm:z.number().min(30).max(300),track:z.object({id,name:z.string().max(255),size:z.number().max(30*1024*1024)}).optional(),charts:z.array(z.object({id,name:z.string().min(1).max(80),cue:z.string().max(200),at:z.number().min(0).max(7200),travel:z.number().min(0).max(120),notes:z.string().max(5000),positions:z.record(z.string(),point),partners:z.record(z.string(),id).optional(),props:z.array(z.object({id,typeId:id,performerId:id.optional(),x:z.number().min(-8).max(128),y:z.number().min(0).max(100),label:z.string().max(80).optional()})).max(300).optional()})).min(1).max(200)})).min(1).max(30)}).superRefine((s,ctx)=>{if(new Set(s.cast.map(p=>p.id)).size!==s.cast.length||new Set(s.songs.map(p=>p.id)).size!==s.songs.length)ctx.addIssue({code:'custom',message:'Duplicate identifiers'});for(const song of s.songs){if(new Set(song.charts.map(c=>c.id)).size!==song.charts.length)ctx.addIssue({code:'custom',message:'Duplicate chart identifiers'});song.charts.forEach((c,i)=>{if(i&&c.at<=song.charts[i-1].at)ctx.addIssue({code:'custom',message:'Chart cue times must increase'});for(const p of s.cast)if(!c.positions[p.id])ctx.addIssue({code:'custom',message:'Every performer needs a position in every chart'})})}});
export function timeLabel(t:number){return `${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}.${Math.floor((t%1)*10)}`}

export function createGroup(show:Show,name:string,count:number,color:string):Show{const s=structuredClone(show),group={id:newId(),name,color};s.groups=[...(s.groups||[]),group];for(let i=0;i<count;i++){const p:Performer={id:newId(),name:`${name} ${i+1}`,number:String(i+1),part:name,color,groupId:group.id};s.cast.push(p);s.songs.forEach(song=>song.charts.forEach(c=>c.positions[p.id]={x:0,y:0,queued:true}))}return s}
export function copyChart(chart:Chart,blank=false):Chart{const c=structuredClone(chart);c.id=newId();if(blank){c.positions=Object.fromEntries(Object.keys(chart.positions).map(id=>[id,{x:0,y:0,queued:true}]));c.props=[];c.partners={}}return c}
export function interpolateCharts(a:Chart,b:Chart,t:number):Record<string,Point>{return Object.fromEntries(Object.entries(b.positions).map(([id,end])=>{const start=a.positions[id]||end;return[id,start.queued||end.queued?(t<1?start:end):{x:start.x+(end.x-start.x)*t,y:start.y+(end.y-start.y)*t}]}))}

// Derive chart labels without changing the roster's stored full names.
export function studentLabels(cast:Pick<Performer,'id'|'name'>[]):Record<string,string>{
 const parsed=cast.map(p=>{const comma=p.name.split(',');const words=(comma.length>1?comma.slice(1).join(' '):p.name).trim().split(/\s+/).filter(Boolean);const first=words[0]||p.name.trim();const last=comma.length>1?comma[0].trim():(words.length>1?words[words.length-1]:'');return{id:p.id,first,last,key:first.normalize('NFKC').toLocaleLowerCase()}});
 const counts=new Map<string,number>();for(const p of parsed)counts.set(p.key,(counts.get(p.key)||0)+1);
 return Object.fromEntries(parsed.map(p=>[p.id,counts.get(p.key)!>1&&p.last?`${p.first} ${Array.from(p.last)[0].toLocaleUpperCase()}.`:p.first]));
}

/** Place cast in measured, centered rows without changing the roster or other charts. */
export function placeCastOnStage(show:Pick<Show,'cast'|'stage'>,chart:Chart,mode:'remaining'|'all'='remaining'):Record<string,Point>{
 const {width,depth}=show.stage;
 const isPlaced=(p:Point|undefined)=>!!p&&!p.queued&&p.x>=0&&p.x<=width&&p.y>=0&&p.y<=depth;
 const targets=show.cast.filter(p=>mode==='all'||!isPlaced(chart.positions[p.id]));
 const original=structuredClone(chart.positions);if(!targets.length)return original;
 const rowsFor=(count:number)=>{const columns=Math.max(1,Math.min(count,Math.ceil(Math.sqrt(count*width/(depth*.56))))),rows=Math.ceil(count/columns),mx=Math.min(2,width/5),my=Math.min(2,depth/5),dx=(width-2*mx)/Math.max(1,columns-1),dy=(depth-2*my)/Math.max(1,rows-1);return Array.from({length:count},(_,i)=>{const row=Math.floor(i/columns),inRow=Math.min(columns,count-row*columns);return{x:Math.round((width/2-(inRow-1)*dx/2+(i%columns)*dx)*100)/100,y:Math.round((rows===1?depth/2:my+row*dy)*100)/100}})};
 if(mode==='all'){const spots=rowsFor(targets.length);targets.forEach((p,i)=>original[p.id]=spots[i]);return original}
 const fixed=show.cast.filter(p=>isPlaced(chart.positions[p.id])).map(p=>chart.positions[p.id]);
 for(let attempt=0;attempt<7;attempt++){
  const occupied=[...fixed],spots:Point[]=[],distance=1.7/(attempt+1);
  for(const point of rowsFor(Math.ceil(show.cast.length*(1.5+attempt*.75)))){if(occupied.every(p=>Math.hypot(p.x-point.x,(p.y-point.y)*.56)>=distance)){spots.push(point);occupied.push(point);if(spots.length===targets.length)break}}
  if(spots.length===targets.length){targets.forEach((p,i)=>original[p.id]=spots[i]);return original}
 }
 throw new Error('This stage is too crowded to place the remaining students automatically.');
}
