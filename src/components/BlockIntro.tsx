import {useEffect,useState} from 'react';
import './block-intro.css';
function shouldPlay(){try{return !window.matchMedia('(prefers-reduced-motion: reduce)').matches&&!sessionStorage.getItem('bloc-intro-seen')}catch{return false}}
export default function BlockIntro(){
 const [visible,setVisible]=useState(shouldPlay);
 function finish(){try{sessionStorage.setItem('bloc-intro-seen','1')}catch{}setVisible(false)}
 useEffect(()=>{if(!visible)return;const timer=setTimeout(finish,1850);return()=>clearTimeout(timer)},[visible]);
 if(!visible)return null;
 return <div className="block-intro"><div className="block-intro-mark" role="img" aria-label="Bloc"><i/><i/><i/><i/></div><span className="block-intro-word" aria-hidden="true">bloc<span>.</span></span><button onClick={finish}>Skip intro</button></div>
}
