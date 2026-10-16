import {makeShow,newId,showSchema,type Show,type Deck,type Chart,type PropType} from './model';
export type StagebookImport={show:Show;warnings:string[]};
const failure='Choose a Stagebook webpage saved as HTML. PDF and native Stagebook exports need a different importer.';
function coord(el:HTMLElement,key:'left'|'top'){const value=el.style[key];if(!/^-?\d+(\.\d+)?px$/.test(value))throw new Error('A chart has an unreadable position. Import stopped without saving.');return parseFloat(value)}
function color(value:string){if(/^#[\da-f]{6}$/i.test(value))return value.toLowerCase();const m=value.match(/^rgb\(\s*(\d+)[, ]+\s*(\d+)[, ]+\s*(\d+)\s*\)$/i);if(m&&m.slice(1).every(v=>+v<=255))return '#'+m.slice(1).map(v=>(+v).toString(16).padStart(2,'0')).join('');throw new Error('A student has an unreadable color. Import stopped without saving.')}
export function importStagebookHTML(source:string):StagebookImport{
 if(source.length>5*1024*1024)throw new Error('Choose a Stagebook HTML file smaller than 5 MB.');
 const doc=new DOMParser().parseFromString(source,'text/html');
 const root=doc.querySelector('#stagebook-page');if(!root)throw new Error(failure);
 const nodes=Array.from(root.querySelectorAll('.chart')).filter(c=>c.querySelector('.stage'));if(!nodes.length||nodes.length>200)throw new Error('This file must contain between 1 and 200 Stagebook charts.');
 const name=(doc.title.replace(/\s*-\s*Stagebook\s*$/i,'').trim()||'Imported Stagebook').slice(0,100);
 const show=makeShow(name,'',0);show.stage={name:'Imported Stagebook stage',width:40,depth:32,decks:[],numberLine:{mode:'mirrored',step:4,reverse:false,extent:20}};
 const warnings=['Upload the rehearsal track separately and set each chart’s music cue. Imported charts start 10 seconds apart.','Stagebook’s webpage does not include riser heights. Set the heights in Stage & risers.'];
 const roster=new Map<string,string>(), propTypes=new Map<string,PropType>();let firstDecks='';
 const charts:Chart[]=nodes.map((node,index)=>{
  const decks:Deck[]=Array.from(node.querySelectorAll<HTMLElement>('.stage > .riser')).map(el=>({id:newId(),x:coord(el,'left')/25,y:coord(el,'top')/15,width:el.classList.contains('square')?4:8,depth:4,height:0,label:''}));
  const signature=JSON.stringify(decks.map(({id,...d})=>d));if(!index){show.stage.decks=decks;firstDecks=signature}else if(signature!==firstDecks&&!warnings.some(w=>w.startsWith('Riser layouts')))warnings.push('Riser layouts differ between charts. Bloc uses the first chart’s layout for the whole show.');
  const chart:Chart={id:newId(),name:(node.querySelector('h3')?.textContent?.trim()||`Chart ${index+1}`).slice(0,80),cue:'',at:index*10,travel:index?2:0,notes:'Imported from Stagebook. Review music cues and riser heights.',positions:{},props:[]};
  const seen=new Set<string>();
  for(const el of node.querySelectorAll<HTMLElement>('.stage > .placement')){
   const name=el.querySelector('.placement-name-contents')?.textContent?.trim().replace(/\s+/g,' ');if(!name)throw new Error('A student is missing a name. Import stopped without saving.');
   const shade=color(el.style.backgroundColor||el.style.background);const key=name+'\0'+shade;
   if(seen.has(key))throw new Error(`Two students named “${name}” have the same color in a chart. Give them distinct names or colors in Stagebook before importing.`);seen.add(key);
   let id=roster.get(key);if(!id){id=newId();roster.set(key,id);show.cast.push({id,name,number:String(show.cast.length+1),part:'',color:shade})}
   const point={x:(coord(el,'left')+10)/25,y:(coord(el,'top')+10)/15};chart.positions[id]=point;
   for(const img of el.querySelectorAll('img')){
    const src=img.getAttribute('src')||'';const symbol=src.match(/\/(circle|triangle|square|diamond|star)(-dark)?\.png(?:\?.*)?$/i);
    if(!symbol){if(!warnings.includes('Some prop symbols could not be imported.'))warnings.push('Some prop symbols could not be imported.');continue}
    const key=symbol[1].toLowerCase()+(symbol[2]||'');let type=propTypes.get(key);if(!type){type={id:newId(),name:key.replace('-dark',' filled'),symbol:symbol[1].toLowerCase() as PropType['symbol'],color:'#303030',outline:!symbol[2]};propTypes.set(key,type)}
    chart.props!.push({id:newId(),typeId:type.id,performerId:id,...point});
   }
  }
  return chart;
 });
 if(!show.cast.length)throw new Error('No students were found in this Stagebook file.');
 for(const chart of charts)for(const p of show.cast)if(!chart.positions[p.id])chart.positions[p.id]={x:0,y:0,queued:true};
 show.propTypes=[...propTypes.values()];show.songs=[{id:newId(),name,bpm:120,charts}];
 const result=showSchema.safeParse(show);if(!result.success)throw new Error('This Stagebook exceeds Bloc’s supported stage, student, or chart limits. Nothing was imported.');
 return {show:result.data as Show,warnings};
}
