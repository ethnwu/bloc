import {useState} from 'react';
import {Check,ChevronDown,ChevronLeft,ChevronRight,Copy,LayoutGrid,Music2,Maximize2,Play,Plus,Save,Share2,SlidersHorizontal,Undo2,Redo2,Users} from 'lucide-react';
import {sampleShow,placeCastOnStage} from '../model';
import Stage from './Stage';
import './landing-preview.css';
const example=sampleShow();
const names=['Alex','Avery','Bailey','Blake','Cameron','Casey','Charlie','Dakota','Drew','Eden','Elliot','Emery','Finley','Frankie','Harper','Hayden','Jamie','Jesse','Jordan','Jules','Kai','Kendall','Lane','Logan','Marley','Micah','Morgan','Noel','Parker','Quinn','Reese','Remy','Riley','Robin','Rowan','Sam'];
example.cast.forEach((p,i)=>{p.name=names[i];p.color=i%2?'#4c586f':'#c56150'});
example.songs[0].charts[0].positions=placeCastOnStage(example,example.songs[0].charts[0],'staggered',4);
export default function LandingPreview(){
 const [index,setIndex]=useState(0),song=example.songs[0],chart=song.charts[index];
 return <section className="preview-section" id="workspace" aria-label="Bloc editor preview"><header className="preview-section-heading"><h2>Editor preview</h2><p>Click a chart to see its formation. This is an example show.</p></header><div className="bloc-preview">
  <div className="bp-header"><div className="bp-brand"><i><span/><span/><span/><span/></i><b>bloc<span>.</span></b></div><div className="bp-document"><div><strong>Competition set</strong><small><Check size={12}/>Saved</small></div><div className="bp-menus" aria-hidden="true">File <span>Edit</span><span>View</span><span>Insert</span><span>Stage</span><span>Help</span></div></div><div className="bp-actions" aria-hidden="true"><span><Maximize2 size={14}/>Present</span><span><Save size={14}/>Save</span><span className="bp-share"><Share2 size={14}/>Share</span></div></div>
  <div className="bp-toolbar" aria-hidden="true"><Undo2/><Redo2/><i/><span>Fill width <ChevronDown/></span><i/><span><Plus/>New chart</span><i/><span><Users/>Students</span><span><LayoutGrid/>Risers</span><span className="bp-secondary"><Copy/>Props</span><span className="bp-secondary"><Music2/>Music</span><span className="bp-details"><SlidersHorizontal/>Chart details</span></div>
  <div className="bp-body"><aside className="bp-sidebar"><div className="bp-song"><small>SONG</small><span>Opening number <ChevronDown size={12}/></span></div><div className="bp-charts-label">CHARTS <span>03</span></div><div className="bp-charts">{song.charts.map((c,i)=><button key={c.id} className={index===i?'active':''} aria-pressed={index===i} aria-label={'Preview '+c.name} onClick={()=>setIndex(i)}><div className="bp-thumbnail"><Stage show={example} chart={c} mini/></div><span><small>{String(i+1).padStart(2,'0')}</small>{c.name}</span></button>)}</div><span className="bp-add" aria-hidden="true"><Plus size={13}/>Add chart</span></aside>
   <div className="bp-workspace"><div className="bp-paper"><Stage show={example} chart={chart} names hideOffstage gridMode="off"/></div><div className="bp-player" aria-label="Illustrative audio timeline"><ChevronLeft size={14}/><span className="bp-play" aria-hidden="true"><Play size={13} fill="currentColor"/></span><ChevronRight size={14}/><small>{index===0?'0:00':index===1?'0:08':'0:16'}</small><div className="bp-track"><span style={{width:(index*18)+'%'}}/><i style={{left:(index*18)+'%'}}/></div><small>3:42</small><span className="bp-speed">1×</span></div></div>
  </div><div className="bp-caption"><span>Formation preview</span><span>Click a chart to preview its formation</span></div>
 </div></section>
}
