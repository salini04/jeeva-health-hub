import { useEffect, useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/Logo';

export const Route = createFileRoute('/reset-password')({
  head: () => ({meta:[{title:'Reset password — Jeeva'},{name:'description',content:'Securely choose a new password for your Jeeva account.'},{property:'og:title',content:'Reset password — Jeeva'},{property:'og:description',content:'Recover access to your private Jeeva health records.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
  component: ResetPassword,
});
function ResetPassword(){
 const [password,setPassword]=useState('');const [confirm,setConfirm]=useState('');const [valid,setValid]=useState(false);const [busy,setBusy]=useState(false);const [message,setMessage]=useState('Checking reset link…');const navigate=useNavigate();
 useEffect(()=>{
  const hash=new URLSearchParams(window.location.hash.slice(1));
  const recovery=hash.get('type')==='recovery';
  void supabase.auth.getUser().then(({data})=>{setValid(recovery && Boolean(data.user));setMessage(recovery && data.user ? '' : 'This reset link is invalid or expired. Request a new link from Sign in.');});
 },[]);
 return <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6"><Logo /><h1 className="text-2xl font-semibold">Reset your password</h1><form className="space-y-4" onSubmit={async e=>{e.preventDefault();if(password.length<8||password!==confirm){setMessage('Use at least 8 characters and matching passwords.');return;}setBusy(true);const {error}=await supabase.auth.updateUser({password});setBusy(false);if(error)setMessage(error.message);else await navigate({to:'/dashboard'});}}><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)} disabled={!valid}/><Label htmlFor="confirm-password">Confirm password</Label><Input id="confirm-password" type="password" required value={confirm} onChange={e=>setConfirm(e.target.value)} disabled={!valid}/>{message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}<Button disabled={!valid||busy} type="submit">Save new password</Button></form><Link to="/auth" className="text-sm text-primary">Back to sign in</Link></main>;
}