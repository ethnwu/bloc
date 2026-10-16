// Three-way merge for a show workbook. ID-keyed arrays keep edits attached to the
// right performer/chart even when a collaborator inserts or reorders an item.
const equal=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
const object=(x:any):x is Record<string,any>=>!!x&&typeof x==='object'&&!Array.isArray(x);
export class MergeConflict extends Error{constructor(public path:string){super('Another collaborator changed the same field ('+path+'). Export your changes before reloading.')}}
export function mergeWorkbook<T>(base:T,mine:T,theirs:T,path='show'):T{
 if(equal(mine,base))return structuredClone(theirs);if(equal(theirs,base)||equal(mine,theirs))return structuredClone(mine);
 if(base===undefined&&object(mine)&&object(theirs))base={} as T;if(base===undefined&&Array.isArray(mine)&&Array.isArray(theirs))base=[] as T;
 if(object(base)&&object(mine)&&object(theirs)){const out:Record<string,any>={};for(const key of new Set([...Object.keys(base),...Object.keys(mine),...Object.keys(theirs)])){const value=mergeWorkbook(base[key],mine[key],theirs[key],path+'.'+key);if(value!==undefined)out[key]=value}return out as T}
 if(Array.isArray(base)&&Array.isArray(mine)&&Array.isArray(theirs)&&[base,mine,theirs].every(a=>a.every(x=>object(x)&&typeof x.id==='string'))){
  const b=new Map(base.map(x=>[x.id,x])),m=new Map(mine.map(x=>[x.id,x])),t=new Map(theirs.map(x=>[x.id,x]));const merged=new Map<string,any>();for(const id of new Set([...b.keys(),...m.keys(),...t.keys()])){const item=mergeWorkbook(b.get(id),m.get(id),t.get(id),path+'['+id+']');if(item!==undefined)merged.set(id,item)}
  const ids=(a:any[])=>a.map(x=>x.id).filter(id=>b.has(id));const reordered=!equal(ids(mine),ids(base).filter(id=>m.has(id)));const order=reordered?[...mine,...theirs]:[...theirs,...mine];return [...new Set(order.map(x=>x.id))].filter(id=>merged.has(id)).map(id=>merged.get(id)) as T
 }
 throw new MergeConflict(path);
}
