"""Integration checks against Cloud: temporary users, ownership, and actual UI persistence."""
import os, secrets, unittest, uuid, requests
from playwright.sync_api import sync_playwright

class CloudOwnership(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.url=os.environ['SUPABASE_URL'].rstrip('/')
  cls.key=os.environ['SUPABASE_PUBLISHABLE_KEY']
  cls.admin={'apikey':os.environ['SUPABASE_SERVICE_ROLE_KEY'],'Authorization':'Bearer '+os.environ['SUPABASE_SERVICE_ROLE_KEY']}
  cls.users=[]
  for n in range(2):
   email=f'jeeva-check-{uuid.uuid4().hex}@example.com';password=secrets.token_urlsafe(24)
   r=requests.post(cls.url+'/auth/v1/admin/users',headers=cls.admin,json={'email':email,'password':password,'email_confirm':True,'user_metadata':{'full_name':f'Jeeva Test {n}'}});r.raise_for_status()
   user=r.json();cls.users.append({'id':user['id'],'email':email,'password':password})
   r=requests.post(cls.url+'/auth/v1/token?grant_type=password',headers={'apikey':cls.key},json={'email':email,'password':password});r.raise_for_status()
   cls.users[-1]['headers']={'apikey':cls.key,'Authorization':'Bearer '+r.json()['access_token']}
 @classmethod
 def tearDownClass(cls):
  for user in cls.users:requests.delete(cls.url+'/auth/v1/admin/users/'+user['id'],headers=cls.admin).raise_for_status()
 def test_00_profile_trigger(self):
  u=self.users[0];r=requests.get(self.url+'/rest/v1/profiles',headers=u['headers']);r.raise_for_status();self.assertEqual(r.json()[0]['user_id'],u['id']);self.assertEqual(r.json()[0]['full_name'],'Jeeva Test 0')
 def test_owner_only_profiles(self):
  a,b=self.users;r=requests.get(self.url+'/rest/v1/profiles?user_id=eq.'+a['id'],headers=b['headers']);self.assertEqual(r.json(),[])
  r=requests.patch(self.url+'/rest/v1/profiles?user_id=eq.'+a['id'],headers={**b['headers'],'Prefer':'return=representation'},json={'full_name':'Not allowed'});self.assertEqual(r.json(),[])
 def test_owner_only_health_tables(self):
  a,b=self.users
  cases={'health_metrics':{'metric_type':'weight','value':61.2,'unit':'kg'},'risk_assessments':{'assessment_type':'heart','risk_score':18,'risk_tier':'Low'},'appointments':{'doctor_id':'00000000-0000-4000-8000-000000000001','appointment_date':'2026-11-15','time_slot':'11:00','reason':'Test visit'},'notifications':{'title':'Test','message':'Private'},'health_reports':{'title':'Private report'}}
  for table,values in cases.items():
   with self.subTest(table=table):
    r=requests.post(self.url+'/rest/v1/'+table,headers={**a['headers'],'Prefer':'return=representation'},json={'user_id':a['id'],**values});r.raise_for_status();row=r.json()[0]
    r=requests.get(self.url+'/rest/v1/'+table+'?id=eq.'+row['id'],headers=b['headers']);self.assertEqual(r.json(),[])
    r=requests.patch(self.url+'/rest/v1/'+table+'?id=eq.'+row['id'],headers={**b['headers'],'Prefer':'return=representation'},json=values);self.assertEqual(r.json(),[])
    r=requests.post(self.url+'/rest/v1/'+table,headers=b['headers'],json={'user_id':a['id'],**values});self.assertGreaterEqual(r.status_code,400)
 def test_public_doctors_read_only(self):
  h={'apikey':self.key};r=requests.get(self.url+'/rest/v1/doctors',headers=h);r.raise_for_status();self.assertEqual(len(r.json()),6)
  r=requests.patch(self.url+'/rest/v1/doctors?id=eq.00000000-0000-4000-8000-000000000001',headers={**self.users[0]['headers'],'Prefer':'return=representation'},json={'consultation_fee':0});self.assertTrue(r.status_code >= 400 or r.json() == [])
  r=requests.get(self.url+'/rest/v1/doctors?id=eq.00000000-0000-4000-8000-000000000001',headers=h);self.assertEqual(r.json()[0]['consultation_fee'],800)
 def test_browser_persistence(self):
  u=self.users[0]
  with sync_playwright() as p:
   browser=p.chromium.launch(headless=True);page=browser.new_page(viewport={'width':1280,'height':1800});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto('http://localhost:8080/auth');page.get_by_label('Email',exact=True).fill(u['email']);page.get_by_label('Password',exact=True).fill(u['password']);page.get_by_role('button',name='Sign in',exact=True).click();page.wait_for_url('**/dashboard');page.get_by_text('No vitals recorded yet.').wait_for()
   page.goto('http://localhost:8080/profile');page.get_by_label('Full name',exact=True).fill('Jeeva Persistence Check')
   for label,value in [('Age','24'),('Height (cm)','168'),('Weight (kg)','61.2'),('Systolic BP (mmHg)','120'),('Diastolic BP (mmHg)','80')]:page.get_by_label(label,exact=True).fill(value)
   page.get_by_role('button',name='Save profile',exact=True).click();page.get_by_text('Health profile saved',exact=True).wait_for();page.reload();page.get_by_label('Full name',exact=True).wait_for();self.assertEqual(page.get_by_label('Full name',exact=True).input_value(),'Jeeva Persistence Check')
   page.goto('http://localhost:8080/tracker')
   for label,value in [('Weight (kg)','61.2'),('Systolic BP','121'),('Diastolic BP','79'),('Glucose (mg/dL)','95'),('Heart rate (bpm)','72'),('Water (L)','2.4'),('Sleep (h)','8'),('Activity (min)','35'),('Steps','8000')]:page.get_by_label(label,exact=True).fill(value)
   page.get_by_role('button',name='Save entry').click();page.get_by_text("Today's vitals logged",exact=True).wait_for();page.reload();page.get_by_label('Weight (kg)',exact=True).wait_for();self.assertEqual(page.get_by_label('Weight (kg)',exact=True).input_value(),'61.2')
   page.goto('http://localhost:8080/risk/heart');page.get_by_role('button',name='Calculate heart risk').click();page.get_by_text('Heart risk assessed:',exact=False).wait_for();page.reload();page.get_by_text('No assessment yet',exact=True).wait_for(state='hidden')
   page.goto('http://localhost:8080/doctors');page.get_by_role('button',name='Book',exact=True).first.click();page.get_by_label('Date',exact=True).fill('2026-11-15');page.get_by_label('Symptoms / reason').fill('Persistence test consultation');page.get_by_role('button',name='Confirm booking').click();page.get_by_text('Appointment booked with',exact=False).wait_for();page.goto('http://localhost:8080/appointments');page.get_by_text('Persistence test consultation',exact=True).wait_for();page.reload();page.get_by_text('Persistence test consultation',exact=True).wait_for()
   page.goto('http://localhost:8080/notifications');page.get_by_role('button',name='Mark all read').click();page.get_by_text('New',exact=True).first.wait_for(state='hidden');page.reload();page.get_by_role('heading',name='Notifications & reminders').wait_for();self.assertEqual(page.get_by_text('New',exact=True).count(),0)
   page.goto('http://localhost:8080/reports');page.get_by_role('button',name='Save report',exact=True).click();page.get_by_text('Report saved',exact=True).wait_for();page.reload();page.get_by_role('heading',name='Saved reports').wait_for()
   # Health data is never written to guest browser storage.
   guest=page.evaluate("localStorage.getItem('jeeva-guest-v2') || ''");self.assertNotIn('Jeeva Persistence Check',guest)
   page.screenshot(path='/tmp/browser/jeeva/verified-report.png')
   page.get_by_role('button',name='Sign out',exact=True).click();page.wait_for_url('**/auth');self.assertFalse(page.get_by_text('Jeeva Persistence Check').count());self.assertEqual(errors,[])
   browser.close()

if __name__=='__main__':unittest.main()
