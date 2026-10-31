import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Appointment, AuthState, ChatMessage, Doctor, HealthProfile, Notification, Settings, StoredRisk, VitalsLog } from './types';
import type { RiskResult } from '@/services/mlService';
import type { Database } from '@/integrations/supabase/types';
import { demoAppointments, demoChat, demoDoctors, demoNotifications, demoProfile, demoVitals } from './demoData';
import { emptyProfile, jsonValue, listDoctors, loadHealthData, metricsToRows, profileToRow } from './cloud-data';

interface AppState { auth: AuthState; profile: HealthProfile; vitals: VitalsLog[]; appointments: Appointment[]; notifications: Notification[]; chat: ChatMessage[]; settings: Settings; risks: StoredRisk; doctors: Doctor[]; reports: Database['public']['Tables']['health_reports']['Row'][] }
const defaultState: AppState = { auth: {signedIn:false,guest:false,name:'',email:''}, profile:demoProfile, vitals:demoVitals, appointments:demoAppointments, notifications:demoNotifications, chat:demoChat, settings:{units:'metric',notifications:{reminders:true,hydration:true,appointments:true,weekly:true},theme:'light'}, risks:{}, doctors:demoDoctors, reports:[] };
const KEY = 'jeeva-guest-v2';
interface Ctx extends AppState { loading:boolean; saving:boolean; loadError:string; update:(patch:Partial<AppState>)=>Promise<boolean>; reset:()=>void; signOut:()=>Promise<void>; enterGuest:()=>Promise<void>; recordAssessment:(type:'heart'|'diabetes',result:RiskResult,input:unknown)=>Promise<boolean>; saveReport:()=>Promise<boolean>; retry:()=>void }
const AppContext = React.createContext<Ctx|null>(null);
export function AppProvider({children}:{children:React.ReactNode}) {
 const queryClient = useQueryClient(); const router = useRouter();
 const [state,setState]=React.useState(defaultState); const stateRef=React.useRef(state); stateRef.current=state;
 const [loading,setLoading]=React.useState(true); const [saving,setSaving]=React.useState(false); const [loadError,setLoadError]=React.useState('');
 const userRef=React.useRef<User|null>(null); const generation=React.useRef(0); const ready=React.useRef(false);
 const guestState=React.useRef(defaultState);
 const apply=React.useCallback((patch:Partial<AppState>)=>{setState(s=>({...s,...patch}));},[]);
 const hydrate=React.useCallback(async(user:User|null)=>{
  const version=++generation.current; userRef.current=user; ready.current=false; setLoadError(''); setLoading(true);
  if(!user){setState({...guestState.current,auth:{...defaultState.auth,guest:guestState.current.auth.guest}}); ready.current=true; setLoading(false); return;}
  setState({...defaultState,profile:{...emptyProfile,name:user.user_metadata['full_name'] ?? '',email:user.email ?? ''},vitals:[],appointments:[],notifications:[],chat:[],risks:{},reports:[],auth:{signedIn:true,guest:false,name:user.user_metadata['full_name'] ?? '',email:user.email ?? ''}});
  try { const data=await queryClient.fetchQuery({queryKey:['health',user.id],queryFn:()=>loadHealthData(user.id),staleTime:0});
   if(version!==generation.current)return;
   const prefs=data.preferences as Partial<Settings>;
   setState(s=>({...s,...data,settings:{...defaultState.settings,...prefs},auth:{signedIn:true,guest:false,name:data.profile.name,email:user.email ?? ''}})); ready.current=true;
  }catch{if(version===generation.current)setLoadError('Your records could not be loaded. Please try again.');}
  finally{if(version===generation.current)setLoading(false);}
 },[queryClient]);
 React.useEffect(()=>{
  try{const raw=localStorage.getItem(KEY);if(raw)guestState.current={...defaultState,...JSON.parse(raw),auth:{...defaultState.auth,guest:true}};}catch{/* ignore damaged demo data */}
  let active=true;
  const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
   if(!['SIGNED_IN','SIGNED_OUT','USER_UPDATED','INITIAL_SESSION'].includes(event))return;
   // Schedule work outside the auth callback to avoid the SDK's auth lock.
   setTimeout(()=>{if(!active)return; if(event==='SIGNED_OUT'){void queryClient.cancelQueries();queryClient.clear();}
    void supabase.auth.getUser().then(({data})=>{if(active)void hydrate(data.user);});
    if(event!=='INITIAL_SESSION'){void router.invalidate();if(event!=='SIGNED_OUT')void queryClient.invalidateQueries({queryKey:['health']});}
   },0);
  });
  void supabase.auth.getUser().then(({data})=>{if(active)void hydrate(data.user);});
  void listDoctors().then(doctors=>{if(active){apply({doctors});guestState.current={...guestState.current,doctors};}}).catch(()=>{/* guest directory fallback */});
  return()=>{active=false;subscription.unsubscribe();generation.current++;};
 },[hydrate,queryClient,router,apply]);
 React.useEffect(()=>{
  document.documentElement.classList.toggle('dark',state.settings.theme==='dark');
  if(loading||userRef.current)return;
  guestState.current=state;try{localStorage.setItem(KEY,JSON.stringify(state));}catch{/* storage quota */}
 },[state,loading]);
 const update=React.useCallback(async(patch:Partial<AppState>)=>{
  const user=userRef.current; const before=stateRef.current; const version=generation.current;
  if(!user){apply(patch);return true;}
  if(!ready.current){toast.error('Wait for your records to load before saving.');return false;}
  setSaving(true);
  try{
   if(patch.profile){const {error}=await supabase.from('profiles').update(profileToRow(patch.profile)).eq('user_id',user.id);if(error)throw error;}
   if(patch.settings){const {error}=await supabase.from('profiles').update({preferences:jsonValue(patch.settings)}).eq('user_id',user.id);if(error)throw error;}
   if(patch.vitals){const added=patch.vitals.filter(v=>!before.vitals.some(x=>x.id===v.id));if(added.length){const {error}=await supabase.from('health_metrics').insert(added.flatMap(v=>metricsToRows(v,user.id)));if(error)throw error;}}
   if(patch.appointments){for(const a of patch.appointments){const old=before.appointments.find(x=>x.id===a.id);if(old?.status===a.status)continue;
    const result=old ? await supabase.from('appointments').update({status:a.status}).eq('id',a.id).eq('user_id',user.id) : await supabase.from('appointments').insert({id:a.id,user_id:user.id,doctor_id:a.doctorId,appointment_date:a.date,time_slot:a.time,reason:a.reason,status:a.status,mode:a.mode});if(result.error)throw result.error;
   }}
   if(patch.notifications){for(const n of patch.notifications){if(before.notifications.find(x=>x.id===n.id)?.read===n.read)continue;const {error}=await supabase.from('notifications').update({is_read:n.read}).eq('id',n.id).eq('user_id',user.id);if(error)throw error;}}
   if(version!==generation.current)return false;
   apply({...patch,...(patch.profile?{auth:{...before.auth,name:patch.profile.name}}:{})});
   if(patch.appointments){const data=await loadHealthData(user.id);if(version===generation.current)apply({notifications:data.notifications});}
   return true;
  }catch{toast.error('Changes were not saved. Please try again.');return false;}finally{setSaving(false);}
 },[apply]);
 const signOut=React.useCallback(async()=>{
  await queryClient.cancelQueries(); queryClient.clear(); const {error}=await supabase.auth.signOut();if(error){toast.error('Could not sign out. Please try again.');return;}
  await hydrate(null);await router.navigate({to:'/auth',replace:true});
 },[queryClient,hydrate,router]);
 const enterGuest=React.useCallback(async()=>{if(userRef.current)await signOut();guestState.current={...guestState.current,auth:{...defaultState.auth,guest:true}};await hydrate(null);},[signOut,hydrate]);
 const recordAssessment=React.useCallback(async(type:'heart'|'diabetes',result:RiskResult,input:unknown)=>{
  const user=userRef.current;const version=generation.current;
  if(user){if(!ready.current)return false;setSaving(true);const {error}=await supabase.from('risk_assessments').insert({user_id:user.id,assessment_type:type,risk_score:result.score,risk_tier:result.tier,input_parameters:jsonValue(input),contributing_factors:jsonValue(result.factors),recommendations:result.recommendations,consult_advisory:result.consultAdvisory,model:result.model,assessed_at:result.generatedAt});setSaving(false);if(error){toast.error('Assessment could not be saved.');return false;}}
  if(version!==generation.current)return false;setState(s=>({...s,risks:{...s.risks,[type]:result}}));return true;
 },[]);
 const saveReport=React.useCallback(async()=>{const user=userRef.current;if(!user){return true;}if(!ready.current)return false;const s=stateRef.current;const version=generation.current;setSaving(true);const {data,error}=await supabase.from('health_reports').insert({user_id:user.id,title:'Jeeva health summary',summary:'Educational health summary; not a medical diagnosis.',report_data:jsonValue({profile:s.profile,vitals:s.vitals,risks:s.risks,appointments:s.appointments})}).select().single();setSaving(false);if(error){toast.error('Report could not be saved.');return false;}if(version!==generation.current)return false;if(data)setState(s=>({...s,reports:[data,...s.reports]}));return true;},[]);
 const reset=React.useCallback(()=>{if(userRef.current)return;guestState.current={...defaultState,doctors:stateRef.current.doctors};setState(guestState.current);},[]);
 const value={...state,loading,saving,loadError,update,reset,signOut,enterGuest,recordAssessment,saveReport,retry:()=>void hydrate(userRef.current)};
 return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export function useApp(){const ctx=React.useContext(AppContext);if(!ctx)throw new Error('useApp must be used inside AppProvider');return ctx;}
export const uid=()=>crypto.randomUUID();
