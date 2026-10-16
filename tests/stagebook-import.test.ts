import {describe,it,expect,vi} from 'vitest';
import {DOMParser} from 'linkedom';
import {readFileSync} from 'node:fs';
import {importStagebookHTML} from '../src/stagebook-import';
vi.stubGlobal('DOMParser',DOMParser);
const html=readFileSync(new URL('./fixtures/stagebook.html',import.meta.url),'utf8');
describe('Stagebook saved webpage import',()=>{
 it('preserves the seven charts, 52 identities, colors, 25 risers and attached props from the real shared-page structure',()=>{
  const {show,warnings}=importStagebookHTML(html);expect(show.name).toBe('Test song');expect(show.cast).toHaveLength(52);expect(show.songs[0].charts).toHaveLength(7);expect(show.stage.decks).toHaveLength(25);expect(show.songs[0].charts[6].props).toHaveLength(26);expect(warnings).toHaveLength(2);
  expect(show.cast[0].color).toBe('#f06c53');expect(show.songs[0].charts[0].positions[show.cast[0].id]).toEqual({x:20,y:22});expect(show.stage.decks[0]).toMatchObject({x:36,y:8,width:4,depth:4,height:0});
 });
 it('rejects unrelated HTML and unreadable positions instead of importing a partial show',()=>{expect(()=>importStagebookHTML('<html>not a stagebook</html>')).toThrow('Choose a Stagebook');expect(()=>importStagebookHTML(html.replace('left:490px','left:auto'))).toThrow('unreadable position')});
 it('does not merge ambiguous students with identical names and colors',()=>{const duplicate='<div class="placement" style="left:40px;top:40px;background:#f06c53"><span class="placement-name-contents">Student 1</span></div>';expect(()=>importStagebookHTML(html.replace('</h3><div class="stage">','</h3><div class="stage">'+duplicate))).toThrow('distinct names or colors')});
 it('keeps students with matching names but different colors distinct',()=>{const changed=html.replaceAll('Student 2<','Student 1<');expect(importStagebookHTML(changed).show.cast).toHaveLength(52)});
 it('never reuses workbook or chart identifiers across separate imports',()=>{const a=importStagebookHTML(html).show,b=importStagebookHTML(html).show;expect(a.id).not.toBe(b.id);expect(a.cast[0].id).not.toBe(b.cast[0].id);expect(a.songs[0].charts[0].id).not.toBe(b.songs[0].charts[0].id)});
 it('rejects files above the size limit',()=>expect(()=>importStagebookHTML('x'.repeat(5*1024*1024+1))).toThrow('smaller than 5 MB'));
});
