from pathlib import Path
import json,hashlib,re,ast,subprocess,urllib.parse
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]
class Links(HTMLParser):
 def __init__(self):super().__init__();self.refs=[]
 def handle_starttag(self,tag,attrs):
  for k,v in attrs:
   if k in {'src','href','poster'} and v:self.refs.append(v)
report={'hash_errors':[],'source_changes':[],'missing_links':[],'template_links':[],'missing_presentation_inputs':[],'syntax_errors':[],'checked_links':0,'html_files':0,'python_files':0,'js_files':0,'large_files':[],'secret_files':[]}
records=json.loads((ROOT/'inventory/files.json').read_text(encoding='utf-8'))
for r in records:
 p=ROOT/r['path']; h=hashlib.sha256(p.read_bytes()).hexdigest()
 if h!=r['sha256']:report['hash_errors'].append(r['path'])
 if p.stat().st_size>50*1024**2:report['large_files'].append(r['path'])
 if p.suffix=='.html':
  report['html_files']+=1;parser=Links();parser.feed(p.read_text(encoding='utf-8',errors='replace'))
  for ref in parser.refs:
   url=urllib.parse.urlsplit(ref)
   if url.scheme or url.netloc or not url.path or '${' in ref or '{{' in ref:continue
   if url.path.startswith('/'):continue
   target=p.parent/urllib.parse.unquote(url.path)
   report['checked_links']+=1
   if not target.exists():
    is_template='/site/' in r['path'] and '/livrables/' not in r['path'] and '/40_DELIVERABLES/' not in r['path']
    report['template_links' if is_template else 'missing_links'].append({'file':r['path'],'target':ref})
 if p.suffix=='.py':
  report['python_files']+=1
  try:ast.parse(p.read_text(encoding='utf-8-sig'))
  except Exception as e:report['syntax_errors'].append({'file':r['path'],'error':str(e)})
 if p.suffix in {'.js','.mjs'}:
  report['js_files']+=1
  result=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
  if result.returncode:report['syntax_errors'].append({'file':r['path'],'error':result.stderr[:500]})
secret=re.compile(rb'(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|sk-(?:proj-|live_|test_)?[A-Za-z0-9_-]{30,}|-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----|AKIA[0-9A-Z]{16})')
for p in (ROOT/'brands').rglob('presentation.json'):
 for row in json.loads(p.read_text(encoding='utf-8')).get('planches',[]):
  if not (p.parent/'out'/row[0]).exists():report['missing_presentation_inputs'].append({'file':p.relative_to(ROOT).as_posix(),'input':row[0]})
for p in (ROOT/'brands').rglob('*'):
 if p.is_file() and secret.search(p.read_bytes()):report['secret_files'].append(p.relative_to(ROOT).as_posix())
(ROOT/'inventory/verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:len(v) if isinstance(v,list) else v for k,v in report.items()}))
