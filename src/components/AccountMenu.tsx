import {useRef,useState,useEffect} from 'react';
import {ChevronDown,LogOut,UserRound} from 'lucide-react';
import {post} from '../api';
type Props={user:{name:string;email:string};beforeSignOut?:()=>Promise<boolean>};
export default function AccountMenu({user,beforeSignOut}:Props){
 const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{const outside=(e:PointerEvent)=>{if(!ref.current?.contains(e.target as Node))setOpen(false)};const key=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false)};document.addEventListener('pointerdown',outside);window.addEventListener('keydown',key);return()=>{document.removeEventListener('pointerdown',outside);window.removeEventListener('keydown',key)}},[]);
 async function signOut(){setBusy(true);setError('');try{if(beforeSignOut&&!await beforeSignOut())throw new Error('Your changes could not be saved. Try Save before signing out.');await post('/api/auth/sign-out',{});location.assign('/login')}catch(e){setError((e as Error).message);setBusy(false)}}
 return <div className="account-menu" ref={ref}><button className="account-menu-trigger" aria-label="Account options" aria-expanded={open} onClick={()=>setOpen(!open)}><span>{user.name.slice(0,1).toUpperCase()}</span><ChevronDown size={13}/></button>{open&&<div className="account-menu-popup"><strong>{user.name}</strong><small>{user.email}</small><a href="/account"><UserRound size={16}/>Account settings</a><button disabled={busy} onClick={()=>void signOut()}><LogOut size={16}/>{busy?'Signing out…':'Sign out'}</button>{error&&<p role="alert">{error}</p>}</div>}</div>
}
