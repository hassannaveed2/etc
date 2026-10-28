"""Build the compact portrait edition from the approved complete profile."""
from lxml import html, etree
from html import escape
import re

source = html.parse('profile/index.html', parser=html.HTMLParser(encoding='utf-8'))
pages = source.xpath('//section[contains(concat(" ",normalize-space(@class)," ")," page ")]')
groups = [
 ('Chairman’s foreword',[3,4]), ('Strategic direction',[5,6]), ('Leadership navigation',[7,8]),
 ('ETC at a glance',[9,10,11]), ('Mandate, vision and mission',[12,13,14]),
 ('Values and governance',[15,16,17,18]), ('Organization and services',[19,20,21,22]),
 ('The assessment portfolio',[23,24,25,26]), ('Legal education assessments',[27,28]),
 ('Postgraduate assessments',[29,30]), ('Undergraduate admission testing',[31,32,33,34]),
 ('From a brief to a test',[35,36,37,38]), ('Blueprints, items and the bank',[39,40,41,42]),
 ('Calibration, security and piloting',[43,44,45,46]), ('Item statistics and fairness',[47,48,49,50]),
 ('The item life cycle and measurement',[51,52,53]), ('Precision and review decisions',[54,55]),
 ('Reliability and validity',[56,57,58]), ('Fairness at every stage',[59,60]),
 ('Evidence and responsible score use',[61,62,63]), ('Quality standards and review',[64,65,66]),
 ('Assurance, security and scoring',[67,68,69]), ('Test operations and reach',[70,71,72,73]),
 ('What sets ETC apart',[74,75]), ('Track record and partners',[76,77]),
 ('Our commitment to candidates',[78,79]), ('Strategic roadmap',[80,81]),
 ('Assessment glossary',[82,83]), ('Get in touch',[84])
]

# Make room for three chapter openers by joining related editorial pages.
merged_groups=[]
skip={'Mandate, vision and mission','Organization and services','Track record and partners'}
for group_title,indices in groups:
 if group_title in skip: continue
 if group_title=='ETC at a glance': merged_groups.extend([('About ETC',[]),('ETC, mandate and direction',[9,10,11,12,13,14])]); continue
 if group_title=='Values and governance': merged_groups.append(('Governance, values and services',[15,16,17,18,19,20,21,22])); continue
 if group_title=='The assessment portfolio': merged_groups.append(('Assessments & Methodology',[]))
 if group_title=='Quality standards and review': merged_groups.append(('Quality & Operations',[]))
 if group_title=='What sets ETC apart': merged_groups.append(('Capabilities, track record and partners',[74,75,76,77])); continue
 merged_groups.append((group_title,indices))
groups=merged_groups
groups=[g for g in groups if g[0] not in ['Precision and review decisions','Get in touch']]
groups=[(('Assessment portfolio and legal tests',[23,24,25,26,27,28]) if t=='Legal education assessments' else (t,ids)) for t,ids in groups if t not in ['The assessment portfolio','Fairness at every stage']]

reflowed=[]
for t,ids in groups:
 if t=='Item statistics and fairness': continue
 if t=='Calibration, security and piloting': reflowed.append(('Calibration, analysis and security',[43,44,45,46,47,48,49,50])); continue
 reflowed.append((t,ids))
 if t=='Assessment glossary': reflowed.append(('Assessment glossary — continued',[83]))
groups=reflowed

def text(node):
 return re.sub(r'\s+', ' ', ' '.join(node.itertext())).strip()

def clean(node):
 tag = node.tag if isinstance(node.tag,str) else ''
 classes = node.get('class','').split()
 if tag in ['svg','figure','img','use','symbol'] or any(x in classes for x in ['foot','pattern','eyebrow','ceo-band','ceo-portrait','portrait','chair-glow','chair-panel','chair-photo','pb','band','decor-num']): return ''
 if tag in ['h1','h2']: return ''
 if tag in ['h3','h4']:
  return '<h4>'+escape(text(node))+'</h4>'
 if tag == 'table':
  rows=[]
  for tr in node.xpath('.//tr'):
   cells=[]
   for td in tr.xpath('./th|./td'):
    cells.append('<'+td.tag+'>'+escape(text(td))+'</'+td.tag+'>')
   if cells: rows.append('<tr>'+''.join(cells)+'</tr>')
  return '<table>'+''.join(rows)+'</table>'
 if tag in ['p','blockquote']:
  value=text(node)
  if not value: return ''
  return '<'+tag+'>'+escape(value)+'</'+tag+'>'
 if tag in ['ul','ol']:
  return '<ul>'+''.join('<li>'+escape(text(li))+'</li>' for li in node.xpath('./li'))+'</ul>'
 if tag == 'dl': return '<dl>'+''.join('<'+c.tag+'>'+escape(text(c))+'</'+c.tag+'>' for c in node.xpath('.//dt|.//dd'))+'</dl>'
 children=list(node)
 if not children: return '<p>'+escape(text(node))+'</p>' if text(node) else ''
 # Label/value cards use spans and strong text instead of paragraph elements.
 if all(c.tag in ['span','b','strong','small','i','em','br','svg'] for c in children):
  value=text(node)
  return '<p class="fact">'+escape(value)+'</p>' if value else ''
 return ''.join(clean(c) for c in children)

def body_for(index):
 p=pages[index]
 return ''.join(clean(c) for c in p)

def foot(number,title): return '<footer><span>EDUCATION TESTING COUNCIL · 2026</span><span>'+str(number).zfill(2)+'</span></footer>'

def point_icon(label):
 value=label.casefold()
 exact={
  'a national assessment platform':'globe','how we work':'gear','centralized':'hub','the test-day journey':'flag',
  'dif':'scale','sem':'target','kr-20 / cronbach’s alpha':'chart','pre-test / piloting':'search','post-hoc analysis':'chart',
  '2 million':'users','251,685':'db','530 subject experts':'users','261 projects · 1,750 papers':'brief',
  '1–3 · plan':'grid','4–6 · develop':'pen','7–9 · validate':'check','10–11 · assemble':'layers','12–13 · deliver and review':'cycle'
 }
 if value in exact: return exact[value]
 matches=[
  ('email','mail'),('phone','phone'),('website','globe'),
  ('security','shield'),('secure','shield'),('integrity','shield'),('access','key'),
  ('fair','scale'),('legal','scale'),('law','scale'),('lat','scale'),('equating','scale'),
  ('candidate','users'),('stakeholder','users'),('partner','users'),('who','user'),
  ('research','search'),('review','search'),('investigat','search'),('audit','eye'),('oversight','eye'),('transparen','eye'),
  ('merit','badge'),('quality','check'),('reliab','check'),('retain','check'),('standard','check'),
  ('precision','target'),('target','target'),('purpose','target'),('valid','target'),('focus','target'),('design','target'),
  ('difficulty','chart'),('statistics','chart'),('discrimina','chart'),('scor','chart'),('evidence','chart'),('result','chart'),('record','chart'),('number','chart'),('logit','chart'),('fit','chart'),
  ('bank','db'),('calibrat','db'),('store','db'),('rasch','chart'),('item','doc'),('distractor','doc'),('response','doc'),
  ('digital','monitor'),('technology','monitor'),('computer','monitor'),('cbt','monitor'),
  ('bloom','mind'),('thinking','mind'),('knowledge','mind'),('blueprint','grid'),('tos','grid'),
  ('writing','pen'),('write','pen'),('revise','pen'),('content','doc'),('language','spell'),
  ('scholar','cap'),('undergraduate','cap'),('postgraduate','cap'),('hat','cap'),('usat','cap'),('education','cap'),
  ('international','globe'),('abroad','globe'),('pakistan','globe'),('national','globe'),('centre','pin'),('cities','pin'),
  ('registration','id'),('identity','id'),('arriv','id'),('seating','users'),('collect','scan'),('omr','scan'),('scan','scan'),
  ('print','print'),('movement','truck'),('delivery','truck'),('logistics','truck'),('frequency','cal'),('time','clock'),('fee','coins'),
  ('communic','chat'),('report','doc'),('guide','doc'),('rule','doc'),('hearing','scale'),
  ('govern','uni'),('council','uni'),('institution','uni'),('administration','brief'),('operation','gear'),('service','brief'),
  ('improv','cycle'),('life cycle','cycle'),('after','cycle'),('feedback','cycle'),('innovation','bulb'),('development','up'),('capacity','up'),('priorit','flag'),('direction','flag'),
 ]
 for token,icon in matches:
  if token in ['lat','hat']:
   if re.search(r'\b'+token+r'\b',value): return icon
   continue
  if token in value: return icon
 return 'doc'

def decorate(markup):
 root=html.fromstring(markup)
 targets=root.xpath('.//section[@class="topic"]/h3 | .//section[@class="topic"]//h4 | .//section[@class="topic"]//tr/td[1] | .//section[@class="topic"]//dt | .//div[contains(@class,"glossary-grid")]//h4 | .//div[@class="principles"]//b | .//section[@class="contact-compact"]//article/span | .//div[@class="cover-values"]/span')
 for node in targets:
  label=text(node)
  if not label: continue
  icon=point_icon(label)
  point=html.fromstring('<span class="point-label"><svg class="point-icon" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-'+icon+'"></use></svg><span>'+escape(label)+'</span></span>')
  node.text=None
  for child in list(node): node.remove(child)
  node.append(point)
 return html.tostring(root,encoding='unicode')

def topic(title,paras=(),rows=()):
 return '<section class="topic"><h3>'+escape(title)+'</h3>'+''.join('<p>'+escape(p)+'</p>' for p in paras)+('<table>'+''.join('<tr><td>'+escape(a)+'</td><td>'+escape(b)+'</td></tr>' for a,b in rows)+'</table>' if rows else '')+'</section>'

def condensed(title):
 if title=='Calibration, analysis and security':
  return topic('Calibration and piloting',['Calibration measures item difficulty and other properties so questions can be placed on a common scale. Items are tagged by subject, topic, thinking level and review history. Piloting provides evidence before an item is used for decisions.'])+topic('Security of the bank',rows=[('Access','Restrict access to authorized staff and the functions their role requires.'),('Preparation','Generate papers and handle confidential materials in controlled conditions.'),('Traceability','Record selection, review and use; protect data throughout delivery and scoring.')])+topic('Item-level analysis',rows=[('Difficulty','The p-value is the proportion answering correctly; judge it against the intended test difficulty.'),('Discrimination','Use corrected item–total correlation and upper–lower comparisons to examine separation of stronger and weaker candidates.'),('Distractors','Review option choices; options selected by fewer than 5% are non-functioning.'),('Rasch fit','The preferred Infit / Outfit mean-square range is 0.7–1.3.'),('Response patterns','Investigate blanks, invalid responses and possible miskeys.')])+topic('Fairness and post-test review',['DIF checks whether equally able candidates from different groups perform differently on an item. Mantel–Haenszel A/B/C classifications guide screening; category C items receive independent review. After live delivery, psychometric and subject experts review unexpected patterns and decide whether items should be retained, revised or critically reviewed.'])
 if title=='Assessment portfolio and legal tests':
  return topic('The ETC assessment portfolio',rows=[('LAT','Undergraduate law admissions.'),('LAW-GAT','Law graduates seeking enrolment as advocates.'),('HAT-General','MS/MPhil admissions and scholarship eligibility.'),('HAAT-Subject','Doctoral admissions and subject achievement.'),('USAT','Undergraduate admissions and scholarships.'),('Customized tests','Recruitment, screening and client-specific selection.')])+topic('LAT · Law Admission Test',['LAT is mandatory for admission to five-year LLB programmes in public and private universities and law colleges, following the Supreme Court’s directions on legal education reform. It assesses reasoning, language, general knowledge and written expression. Students completing intermediate / HSSC or equivalent take the test; it is held twice a year. The listed fee is Rs. 2,000.'])+topic('LAW-GAT · Law Graduate Assessment Test',['LAW-GAT assesses core legal knowledge and its application for LLB graduates seeking enrolment with a provincial Bar Council. A pass result is required for enrolment as an advocate. It is held quarterly across Pakistan; the listed fee is Rs. 3,000. Accuracy around the passing score is particularly important.'])+topic('One commitment across products',['Each test has a defined purpose, blueprint, expert review, secure administration and standardized scoring. Piloting and analysis support reliable, valid and fair selection decisions.'])
 if title=='ETC, mandate and direction':
  a=html.fromstring('<div>'+condensed('ETC at a glance')+'</div>')
  b=html.fromstring('<div>'+condensed('Mandate, vision and mission')+'</div>')
  # Keep the overview and metrics, followed by the full vision and mission.
  return ''.join(html.tostring(s,encoding='unicode') for s in list(a)[:2]+list(b)[2:])
 if title=='Governance, values and services':
  return topic('Values in practice',rows=[('Merit','Selection follows answers and published rules.'),('Transparency','Clear formats, syllabi, rules, keys and results.'),('Fairness','Bias review and suitable arrangements for special needs.'),('Integrity','Secure papers and a defined hearing procedure.'),('Quality','Expert review, piloting and statistical analysis.')])+topic('Oversight and accountability',['The Board of Governors sets direction and provides oversight. The Chief Executive Officer leads the Council. Internal Audit reports independently; the Secretariat provides technical, legal, financial and administrative advice.'])+topic('Five functional groups',rows=[('Quality Assurance','Monitoring, evaluation, collaboration and certification.'),('Academics & Research','Question bank, training, research and analytics.'),('Operations & Technology','Test delivery, technology, printing and candidate support.'),('Administration','People, finance, infrastructure and logistics.'),('Business Development','Marketing, media and institutional relationships.')])+topic('Services for institutions',['ETC supports admissions, scholarships, recruitment, promotion, screening and professional assessment. Clients can use an integrated process from requirement study and blueprint development through secure administration, scoring, analysis and reporting.'])
 if title=='Capabilities, track record and partners':
  a=html.fromstring('<div>'+condensed('What sets ETC apart')+'</div>')
  b=html.fromstring('<div>'+condensed('Track record and partners')+'</div>')
  return ''.join(html.tostring(s,encoding='unicode') for s in [a[1],b[0],b[1]])
 if title=='Precision and review decisions': return topic('Precision where decisions matter',[
 'The Test Information Function shows where a test measures most precisely; Conditional SEM expresses uncertainty at each ability level. Precision should be strongest around selection or passing scores.',
 'Item Characteristic Curves show the probability of a correct response as ability rises. Under Rasch / 1PL, curves share one S-shape and shift according to item difficulty. A Wright map helps assess how well the items target the candidate group.'])+topic('Item-level evidence',rows=[('Fit','Infit and Outfit mean-square statistics; preferred range 0.7–1.3.'),('Discrimination','Corrected item–total correlation and the upper–lower index using the top and bottom 27% of candidates.'),('Distractors','Option choices and efficiency; an option chosen by fewer than 5% is non-functioning.'),('Response patterns','Blank or invalid answers and wrong options selected more often than the key.')])+topic('Review decisions',rows=[('Retain','No major concern; the item can be reused.'),('Revise','Concerns require targeted revision and checking before reuse.'),('Critical review','Severe or converging evidence requires verification of the key and content.')])+topic('Screening supports expert judgement',[
 'Statistical flags are recommendations for investigation, not automatic deletions. Psychometric and subject-matter experts make the final decision together, considering the purpose, content and response evidence.'])
 if title=='Our commitment to candidates': return topic('Transparent information and fair treatment',[
 'Candidates should understand the assessment before they sit it. ETC publishes the test purpose, format, syllabus, timing, fees and rules, and works to make registration, communication and result reporting clear.',
 'Questions are checked for fairness and statistical quality. Reasonable arrangements can be requested for disabilities or special needs. Scores and personal data are handled confidentially, and results are issued through the published process.'])+topic('What ETC expects',rows=[('Prepare','Read the published rules, syllabus, admit-card instructions and test-day requirements.'),('Arrive ready','Bring the required identity document and admit card, and arrive on time.'),('Follow the rules','Observe instructions, timing and permitted-material requirements.'),('Work honestly','Do your own work and avoid unfair means.'),('Respect others','Help maintain a calm, fair environment for every candidate.')])+topic('How we remain accountable',rows=[('Published rules','Candidates can see the conditions under which the test is conducted.'),('Communication channels','The helpline and online portal provide support and a route for concerns.'),('Unfair-means hearings','Cases follow a documented process with an opportunity to be heard.'),('Post-test review','Statistical and operational findings inform improvements.'),('Oversight','Audit and governance arrangements support institutional accountability.')])
 if title=='Fairness at every stage': return topic('Equal opportunity to demonstrate ability',[
 'Fairness means that scores depend on the knowledge and skills being assessed, rather than gender, region, language background, school type, disability, income or another unrelated factor.',
 'A test can be reliable and valid for most candidates and still disadvantage some. Fairness therefore needs attention throughout development, administration, scoring and reporting. Equal treatment does not mean that every group must have the same average score.'])+topic('Checks across the assessment process',rows=[('Design','Define the purpose and blueprint, use the published syllabus and keep language clear.'),('Writing and review','Check every item for bias, stereotypes and unnecessarily unfamiliar contexts.'),('Statistical analysis','Use pilot and post-hoc DIF analysis; refer category C items for independent review.'),('Administration','Apply the same instructions and timing; provide reasonable arrangements for disabilities on request.'),('Scoring','Use standardized MCQ scoring and rubrics for written work; resolve faulty items consistently.'),('Reporting','Explain score uncertainty and use results only for the intended purpose.'),('Candidate rights','Provide published rules, support channels and a fair hearing for concerns.')])+topic('Fairness in practice',[
 'At ETC, equally able candidates should have the same opportunity to demonstrate their ability, whatever their background. Statistical flags guide investigation; final decisions also consider expert judgement about content and context.'])
 if title=='Assurance, security and scoring': return topic('Independent checks at several stages',[
 'Quality Assurance monitors test operations, paper development, printing and result generation. Multi-dimensional review brings content, technical, language and fairness perspectives to the same assessment.',
 'Monitoring before, during and after delivery connects preparation, administration and follow-up. Findings inform both immediate action and improvements to later tests.'])+topic('Security from bank to result',rows=[('Item and paper preparation','Control access, document review and manage paper generation in a secure environment.'),('Printing and movement','Protect confidential materials and keep their handling traceable.'),('At the centre','Apply identity checks, standardized instructions, timing and monitoring.'),('Collection and processing','Count, seal and return answer sheets securely before scanning and scoring.'),('Unfair-means cases','Use documented procedures and give candidates a fair hearing.')])+topic('Consistent scoring',[
 'MCQs use machine processing and checking procedures. Descriptive answers are marked with rubrics so that the same standard is applied across candidates. Statistical analysis checks the performance of both items and the test.',
 'Potential miskeys, weak items and unusual results are referred for investigation. Decisions about faulty questions should be applied consistently to affected candidates.'])+topic('Improving the quality system',[
 'Documented procedures, professional review and progress towards recognized quality standards support the Council’s institutional development and its commitment to trusted results.'])
 if title=='Legal education assessments': return topic('LAT · Law Admission Test',[
 'LAT is the national entry test for the five-year LLB programme. It is mandatory for admission to LLB programmes in public and private universities and law colleges, following the Supreme Court’s directions on legal education reform.'],[('Candidates','Students completing, or having completed, intermediate / HSSC or equivalent who wish to study law.'),('Focus','Reasoning, language, general knowledge and written expression, as set out in the test pattern.'),('Use and frequency','A required eligibility condition for LLB admission; held twice a year.'),('Listed fee','Rs. 2,000')])+topic('LAW-GAT · Law Graduate Assessment Test',[
 'LAW-GAT assesses law graduates seeking enrolment as advocates with a Bar Council. It checks the core legal knowledge needed for entry to professional practice.'],[('Candidates','Holders of an LLB degree seeking enrolment with a provincial Bar Council.'),('Focus','Knowledge and application of core areas of law, using a dedicated question bank.'),('Use and frequency','A pass result is required for enrolment as an advocate; held quarterly across Pakistan.'),('Listed fee','Rs. 3,000')])+topic('Standards at important gateways',[
 'LAT supports selection for legal study; LAW-GAT supports the transition into legal practice. Both require clear content coverage, standardized administration and reliable scoring. For the pass/fail decision in LAW-GAT, accuracy around the passing score is particularly important.'])
 if title=='Postgraduate assessments': return topic('HAT-General',[
 'The Higher Education Aptitude Test supports postgraduate study at MS and MPhil level and HEC scholarship eligibility. Five categories group candidates by broad field so that assessment takes place in a context close to their discipline.'],[('Who should take it','Graduates holding a 16-year degree or equivalent seeking MS/MPhil study.'),('What it measures','Verbal, quantitative and analytical reasoning.'),('How results are used','Universities and HEC use scores for eligibility and ranking for admission or scholarships.'),('Listed fee','Rs. 2,000')])+topic('HAAT-Subject',[
 'The Higher Education Aptitude & Achievement Test is designed for candidates moving towards doctoral study. It combines general aptitude with achievement in the candidate’s subject.'],[('Who should take it','Holders of an MS/MPhil or equivalent 18-year qualification applying for PhD programmes.'),('What it measures','Advanced reasoning and in-depth subject knowledge, reviewed by subject committees.'),('How results are used','Eligibility and merit decisions for PhD admissions and HEC scholarships.'),('Listed fee','Rs. 3,000')])+topic('Relevant content, comparable decisions',[
 'The two products serve different academic stages. General aptitude supports readiness for postgraduate study; subject achievement adds evidence about preparation for doctoral work. Institutions use the relevant assessment within their published admission and scholarship rules.'])
 if title=='Evidence and responsible score use': return topic('Evidence suited to the decision',rows=[('LAT','Blueprint and language/content review support legal-study entry; consistent scoring supports comparable admission decisions.'),('LAW-GAT','Core-law coverage, standard setting and evidence around the pass score support licensing decisions.'),('HAT-General','Section and total-score reliability, category alignment and comparability support postgraduate selection.'),('HAAT-Subject','Subject committees, advanced-content coverage and analysis support doctoral admission use.'),('USAT','Stream-specific coverage, the common core and rubric-based essays support undergraduate selection.'),('Customized tests','The agreed purpose, blueprint, review and analysis support the client’s particular selection task.')])+topic('Reliability, validity and fairness together',[
 'ETC examines consistency of scores, alignment with the intended knowledge and skills, and the opportunity for candidates to demonstrate ability fairly. DIF review, standardized conditions and documented scoring procedures contribute to that evidence.',
 'Relevant statistics include KR-20 / alpha, SEM and evidence about equivalence across forms. The choice of evidence depends on the assessment and the decision being made.'])+topic('Responsible interpretation',[
 'A test score is an estimate with a margin of error. Small score differences should not be given more meaning than the evidence supports. Scores should be used for the purpose for which the test was designed, alongside the institution’s published selection rules.',
 'Passing scores and ranking decisions need particular care. Reporting should explain results clearly and avoid presenting a score as a complete description of a candidate’s ability or potential.'])
 if title=='Track record and partners': return topic('Experience across assessment needs',[
 'ETC has tested 2 million candidates since 2017. Its work includes 261 client projects, 1,750 distinct papers, 850 blueprints and 802 piloted test batteries. Development and project figures are recorded from 1 July 2021; the item bank continues to grow.',
 'National products serve admissions, scholarships and entry to professional pathways. Customized assignments extend this work to recruitment, screening and institutional selection.'])+topic('Clients and institutional partners',[
 'The Council works with universities and higher-education institutions, government departments and public bodies, regulatory organizations and professional councils. Partnerships link the assessment purpose to the requirements of the institution using the results.',
 'HEC scholarship programmes use ETC assessments to support eligibility and merit decisions. Legal education testing connects the Council’s work with the Pakistan Bar Council, Bar Councils and institutions providing legal education.'])+topic('Support across the test process',rows=[('Before the test','Requirement study, test design, blueprint agreement and item review.'),('During delivery','Planning, centre coordination, secure administration and monitoring.'),('After delivery','Scoring, psychometric analysis, results and client reporting.'),('Beyond Pakistan','Test administration in cooperation with Pakistan’s embassies, including the UAE, Saudi Arabia, Afghanistan, Bangladesh and Sri Lanka.')])+topic('A shared commitment',[
 'The Council’s relationships with clients and partners are built around transparent selection, sound evidence, candidate service and secure operations. Each assignment provides further evidence for improving the assessment system.'])
 if title=='ETC at a glance': return topic('A national assessment platform',[
 'The Education Testing Council is Pakistan’s public-sector national testing body, working under the Higher Education Commission. It provides standardized, centralized and secure assessments for education and professional opportunities.',
 'The Council supports candidates, universities, scholarship programmes, government departments and regulatory bodies. Its work brings test design, item development, secure delivery, scoring and reporting into one assessment system.'])+topic('Our record in numbers',rows=[('2 million','Candidates tested since 2017'),('203 centres · 40 cities','National network, with capacity of about 100,000 candidates in a shift'),('251,685','Calibrated items in a continuously updated bank'),('261 projects · 1,750 papers','Tests delivered for clients, with distinct papers and no repetition'),('850 blueprints · 802 batteries','Blueprints developed and test batteries piloted'),('530 subject experts','Expertise available across subject areas')])+topic('How we work',rows=[('Standardized','The same rules, conditions and scoring for every candidate.'),('Centralized','A coordinated system for design, printing, delivery and results.'),('Secure','Controlled handling of papers, data and test materials.'),('Quality-driven','Questions reviewed, piloted and analysed before and after use.')])
 if title=='Mandate, vision and mission': return topic('A public mandate',[
 'ETC works under the Higher Education Commission to provide credible assessment for admissions, scholarships, recruitment, licensing and other institutional needs. Its purpose is to make selection fairer, more transparent and based on merit.',
 'Its national role includes legal education testing. Following the Supreme Court’s directions on legal education reforms, LAT and LAW-GAT provide gateways to legal study and professional practice.'])+topic('Legal education reforms',rows=[('Regulators','The Pakistan Bar Council and HEC regulate professional standards and legal education.'),('LAT','The Law Admission Test is held twice a year for admission to LLB programmes.'),('LAW-GAT','The Law Graduate Assessment Test is held quarterly for law graduates seeking enrolment as advocates.')])+topic('Our vision',[
 'To empower future generations of students to reach their full potential in service of the nation, by building a transparent, merit-based and equitable system of education and professional opportunity, with an unwavering commitment to quality, fairness and excellence.'])+topic('Our mission',[
 'To advance quality and equity in education, public service and the professions across Pakistan, by making sound decisions possible through assessments built on the core values of quality, integrity and equal opportunity.',
 'To use the best available technology, and to develop our own tools, so that the true potential of our young people can be recognized and put to work for the country.'])
 if title=='Values and governance': return topic('Values in daily practice',rows=[('Merit','Scores are based on answers given; selection follows published rules.'),('Transparency','Test formats, syllabi and rules are published in advance, with timely keys and results.'),('Fairness','Items are checked for bias and suitable arrangements can be requested for special needs.'),('Integrity','Papers are generated securely and unfair-means cases follow a defined hearing procedure.'),('Quality','Questions pass through expert review, piloting and statistical analysis.')])+topic('Oversight and representation',[
 'ETC’s governance connects policy oversight with clear operational responsibility. The Board of Governors sets direction and provides oversight. The Chief Executive Officer leads the Council and its day-to-day work.',
 'Institutional representation and specialist advice support decisions on standards, operations and the needs of stakeholders. Internal Audit reports independently, while the Secretariat provides technical, legal, financial and administrative advice.'])+topic('Accountable administration',[
 'Clear responsibilities, professional standards and documented procedures support the Council’s public mandate. Governance, quality assurance and operational teams work together so that assessment decisions remain credible and candidates can trust the process.'])
 if title=='Organization and services': return topic('A clear functional structure',[
 'Below the Board of Governors, the Chief Executive Officer leads five functional groups. Internal Audit provides independent reporting; the Secretariat supports technical, legal, financial and administrative work.'],[('Quality Assurance','Monitoring and evaluation; collaboration and certification.'),('Academics & Research','Question bank, training, research, innovation and data analytics.'),('Operations & Technology','Test administration, technology, printing, press and call centre.'),('Administration','Human resources, accounting, finance, infrastructure and logistics.'),('Marketing, Sales & Business Development','Business development, marketing, media and stakeholder engagement.')])+topic('Core departments at work',[
 'Test Development & Evaluation designs tests, maintains the bank, marks descriptive papers, compiles results and undertakes psychometric analysis. Test Operations plans and conducts tests across the country and manages candidate services.',
 'Quality Assurance monitors test operations, paper development, printing and result generation, and supports legal matters and unfair-means hearings.'])+topic('What we offer',[
 'ETC delivers admissions and scholarship tests, recruitment and promotion screening, licensing-related assessments and customized tests for government, regulators, universities and projects.',
 'Clients can draw on an integrated process: requirement study, blueprint and paper development, secure administration, scoring, statistical review and reporting.'])
 if title=='The assessment portfolio': return topic('Tests for education and opportunity',[
 'ETC’s national products serve different stages of education and professional entry. Each assessment has a defined purpose, target group and test pattern; scores should be interpreted for that intended use.'],[('LAT','Admission to undergraduate law programmes.'),('LAW-GAT','Assessment of law graduates seeking enrolment as advocates.'),('HAT-General','Postgraduate admissions and HEC scholarship eligibility.'),('HAAT-Subject','Subject-specific assessment for doctoral applicants.'),('USAT','Undergraduate admission and scholarship assessment.'),('Customized tests','Tests designed for a client’s specific selection requirements.')])+topic('Key attributes of an ETC test',[
 'A test begins with a clear purpose and blueprint. Subject experts develop and review questions, checking correctness, relevance, language, difficulty and fairness. Piloting and statistical analysis support the final selection of items.',
 'Secure preparation and administration protect the test. Standardized scoring and reporting help institutions make comparable, evidence-based decisions.'])+topic('Built to order, to the same standard',[
 'Customized assessments begin with the client’s requirements and selection purpose. ETC agrees the blueprint, assembles suitable items, administers the test under controlled conditions and produces scores and analysis.',
 'Customized tests follow the same review, piloting and analysis principles as the national products.'])
 if title=='Undergraduate admission testing': return topic('USAT: common core and subject knowledge',[
 'USAT is a standardized test for undergraduate admissions and HEC undergraduate scholarships. Six categories match candidates’ intermediate streams, combining a common aptitude core with discipline-specific knowledge.',
 'Part I comprises 75 MCQs: 20 Verbal Reasoning, 25 Quantitative Reasoning and 30 discipline-specific questions. Part II carries 25 marks: an argument-based essay (15) and a narrative essay (10), each chosen from three options.'])+topic('Six categories',rows=[('USAT-E · Pre-engineering','Physics 10 · Chemistry 10 · Mathematics 10'),('USAT-M · Pre-medical','Physics 8 · Chemistry 8 · Biology 14'),('USAT-CS · Computer science','Physics 8 · Computer Science 14 · Mathematics 8'),('USAT-GS · General science','Mathematics 10 · Statistics 10 · Economics 10'),('USAT-COM · Commerce','Accounting 10 · Commerce 10 · Economics 10'),('USAT-A · Arts and humanities','Islamiat/Ethics 10 · Pakistan Studies 10 · General Knowledge 10')])+topic('What the test assesses',[
 'The discipline component covers foundational concepts, subject knowledge and applied problem-solving. Verbal and quantitative reasoning assess general cognitive aptitude. The essays assess organization, argument, expression and written communication.',
 'The Table of Specifications balances content with thinking levels, using Bloom’s Taxonomy from knowledge and understanding through application and analysis. This makes the intended coverage explicit before the paper is assembled.'])
 if title=='From a brief to a test': return topic('Customized assessment',[
 'Beyond its national products, ETC builds tests for government departments, regulators, universities and projects. These include recruitment, specific cadres, admissions and screening. Every assignment starts with the selection purpose and the knowledge or skills the client needs to assess.'])+topic('A controlled development process',rows=[('1–3 · Plan','Define requirements, agree the blueprint and Table of Specifications, and identify the content and thinking levels.'),('4–6 · Develop','Commission items, review them with subject and technical experts, and check language, clarity and fairness.'),('7–9 · Validate','Pilot questions, analyse their statistical properties, and revise or replace weak items.'),('10–11 · Assemble','Select calibrated items to match the blueprint, generate the paper and complete final quality checks.'),('12–13 · Deliver and review','Administer securely, score and report results, then analyse live-test evidence to improve the bank.')])+topic('Scoring and reporting',[
 'MCQs are processed through standardized scoring; written responses use scoring rubrics and checking procedures. Client reporting presents the results and supporting analysis needed for the agreed selection purpose.',
 'The feedback loop continues after delivery. Psychometric and subject experts examine item performance and document whether questions should be retained, revised or critically reviewed.'])+topic('Same standard, every time',[
 'A customized test follows the same blueprint, review, piloting and analysis principles as the national products. The format can change with the purpose; the commitment to quality and fairness remains.'])
 if title=='Blueprints, items and the bank': return topic('Start with the blueprint',[
 'A blueprint, or Table of Specifications, defines what a test will cover, how many questions each area receives and which thinking levels are required. It links the purpose of the assessment to the questions that appear in the paper.',
 'Bloom’s Taxonomy helps balance knowledge, understanding, application, analysis, evaluation and creation. The blueprint prevents a paper from becoming an accidental collection of available questions.'])+topic('Good practice in item writing',rows=[('A clear task','Use plain language, a focused question and sufficient information.'),('A defensible answer','Make the key correct and the distractors plausible.'),('Relevant content','Match the syllabus, intended skill and thinking level.'),('Fair context','Avoid bias, stereotypes, unnecessary complexity and clues to the answer.'),('Expert review','Check content, technical quality, language and fairness before use.')])+topic('The ETC item bank',[
 'The item bank is a secure academic resource containing 251,685 calibrated test items. It allows the Council to assemble different but equivalent papers, avoid repeating questions and respond to client requirements.',
 'Items are organized by subject and linked to their content area, thinking level and statistical properties. The twelve listed subject banks together hold 188,310 items; the overall total covers all banks. Calibration, tagging and continued review keep the resource useful as it grows.'])
 if title=='Calibration, security and piloting': return topic('Calibration and tagging',[
 'Calibration measures an item’s statistical properties so that it can be selected for an appropriate purpose and difficulty level. Tagging connects it to the subject, topic, blueprint and thinking level, as well as its review and usage history.',
 'Together, these records help ETC build balanced papers and compare forms. A question’s quality is judged using expert review and statistical evidence, rather than difficulty alone.'])+topic('Security of the bank',rows=[('Controlled access','Only authorized personnel can access the bank and the functions needed for their role.'),('Protected preparation','Paper generation and handling take place under controlled conditions.'),('Traceable use','Records support accountability for item selection, review and administration.'),('Continuous safeguards','Security extends from item development through printing, delivery, scoring and storage.')])+topic('Pre-test / pilot analysis',[
 'New items are tried on a sample before they are used for decisions. Pilot analysis checks difficulty, discrimination, distractor functioning and other statistical properties, while experts examine content and fairness.',
 'Weak or ambiguous items can be revised and tested again. Usable items enter the bank with evidence about their performance; those needing further scrutiny are referred for review.'])+topic('After the live test',[
 'Post-hoc analysis checks the administered paper and its items against the actual candidate responses. Unexpected results, possible miskeys and fairness concerns are investigated before decisions about future use.'])
 if title=='Item statistics and fairness': return topic('Evidence at item level',rows=[('Difficulty (p-value)','The proportion answering correctly; interpreted against the test’s purpose and intended difficulty.'),('Discrimination','How well an item distinguishes stronger and weaker candidates, including corrected item–total correlation and upper–lower comparison.'),('Distractor functioning','Whether wrong options attract candidates as intended; an option chosen by fewer than 5% is non-functioning.'),('Rasch / 1PL fit','Infit and Outfit mean-square statistics check agreement with the measurement model; the preferred range is 0.7–1.3.'),('Response quality','Blank, invalid and unusual option patterns can reveal problems needing investigation.')])+topic('Differential Item Functioning (DIF)',[
 'DIF checks whether equally able candidates from different groups have different chances of answering an item correctly. It is used to identify potential fairness concerns, not to assume that every group must achieve the same average score.',
 'Mantel–Haenszel A/B/C classifications support screening. Category C items receive independent review. Statistical evidence is considered alongside content, language and context before a decision is made.'])+topic('Pilot and live-test evidence',[
 'Pilot analysis informs item selection before a test. Post-hoc analysis checks the live administration, the answer key, overall score patterns and the behaviour of individual questions.',
 'A wrong option chosen more often than the key may signal a miskey. Unexpected fit, negative discrimination or a fairness flag prompts investigation by psychometric and subject experts.'])
 if title=='The item life cycle and measurement': return topic('An ongoing improvement cycle',rows=[('Develop and review','Write items to the blueprint; check content, language, technical quality and fairness.'),('Pilot and calibrate','Gather responses, analyse performance and establish item properties.'),('Store and select','Tag approved items and assemble papers to the required specification.'),('Administer and analyse','Deliver securely and review live-test evidence.'),('Retain, revise or review','Document decisions, improve weak items and test revisions before reuse.')])+topic('The psychometric report',[
 'After every test, ETC prepares a report on candidate results and item performance. It asks whether the paper measured ability accurately, consistently and fairly, and how each item contributed to that measurement.',
 'Classical Test Theory works with observed scores. The Rasch / one-parameter logistic (1PL) model places candidate ability and item difficulty on a common scale measured in logits. The probability of success depends on the gap between ability and difficulty.'])+topic('Targeting and separation',[
 'A person–item, or Wright, map plots abilities and item difficulties together. Gaps show where coverage is too easy, too hard or thin. Reliability and separation show how consistently a test measures and how well it distinguishes ability levels.',
 'The report combines these measures with item-level review so that improvements can be directed to the parts of the test where they are most useful.'])
 if title=='Reliability and validity': return topic('Reliable, valid and fair decisions',[
 'Reliability concerns consistency: a candidate should receive similar results when the same ability is measured under comparable conditions. Validity concerns the evidence supporting the interpretation and intended use of those results. Fairness concerns equal opportunity to demonstrate ability.'])+topic('Types of reliability',rows=[('Internal consistency','KR-20 and Cronbach’s alpha examine how consistently items contribute to a test score.'),('Test–retest','Checks score stability over time when ability is expected to remain comparable.'),('Parallel forms','Examines consistency across different versions designed to measure the same ability.'),('Inter-rater','Checks agreement between markers of written or practical responses.'),('Measurement error','SEM expresses the uncertainty around an individual score and helps avoid false precision.')])+topic('Sources of validity evidence',rows=[('Content','Blueprints and expert review check coverage of the intended knowledge and skills.'),('Construct','The assessment should measure the intended ability rather than unrelated factors.'),('Criterion relationships','Relationships with relevant external outcomes can support the intended interpretation.'),('Consequences and use','Selection rules and score use should match the purpose for which evidence was gathered.')])+topic('Interpreting the evidence',[
 'No single coefficient proves that a test is suitable for every decision. Reliability, content review, statistical analysis and the context of use must be considered together, particularly around a passing or selection score.'])
 if title=='Quality standards and review': return topic('Quality throughout the assessment',[
 'ETC’s quality framework covers test design, question development, expert review, secure administration, scoring and reporting. Checks occur at several stages so that responsibility for quality is shared across the assessment process.'])+topic('Expert committees',rows=[('Content and subject review','Checks correctness, relevance and subject coverage against the blueprint.'),('Technical review','Examines item structure, keys, distractors and assessment design.'),('Language review','Checks clarity, expression and language appropriate to the candidates.'),('Fairness review','Looks for bias, stereotypes and context unrelated to the ability being tested.'),('Final review','Confirms paper readiness and the resolution of issues identified earlier.')])+topic('Evidence before and after use',[
 'Piloting and psychometric analysis support item selection. After administration, live-response evidence supports review of the whole paper and individual questions. Problems can be referred for revision, specialist investigation or a documented scoring decision.',
 'The framework connects subject expertise with statistical evidence: neither is treated as a substitute for the other.'])+topic('Continuous improvement',[
 'Quality assurance monitors the procedures that produce a reliable result as well as the result itself. Findings feed back into item-writing guidance, training, bank maintenance and operational practice.'])
 if title=='Test operations and reach': return topic('A coordinated national network',[
 'ETC operates through 203 test centres in 40 cities, with capacity for about 100,000 candidates in a shift. National delivery depends on coordinated planning, trained staff, secure materials and standardized instructions.'])+topic('The test-day journey',rows=[('Registration','Candidates register, pay online and receive an admit card with centre, date and time.'),('Arrival and identity','Staff verify the admit card and identity document.'),('Seating and instructions','Candidates follow the seating plan and receive standard instructions.'),('Administration','Sealed papers are opened in front of candidates and timing is observed.'),('Collection and scanning','Answer sheets are counted, sealed, returned securely and scanned.'),('Results','Scores are analysed and results are published and shared with client institutions.')])+topic('Operations responsibilities',[
 'The Test Operations Department plans venues and schedules, coordinates staffing and logistics, supports candidate communication and manages secure movement of materials. Monitoring and reporting help identify and resolve issues during administration.'])+topic('International administration',[
 'ETC also conducts tests abroad in cooperation with Pakistan’s embassies. Its international experience includes the United Arab Emirates, Saudi Arabia, Afghanistan, Bangladesh and Sri Lanka.'])
 if title=='What sets ETC apart': return topic('One integrated assessment system',[
 'ETC brings design, research, item development, bank management, secure administration, scoring and analysis into one coordinated system. This enables the Council to follow a test from its original purpose through to the evidence supporting the result.'])+topic('Capabilities that work together',rows=[('Expertise','Subject experts and assessment specialists support content and technical decisions.'),('A calibrated bank','A substantial item resource supports balanced papers and different test forms.'),('National reach','A coordinated centre network serves candidates across Pakistan.'),('Security','Controls apply to items, papers, materials, data and scoring.'),('Evidence','Pilot and post-hoc analysis guide item review and future use.'),('Flexibility','National products and customized tests support different institutional needs.')])+topic('From requirement to result',[
 'Clients can work with the Council across the assessment process: defining requirements, agreeing the blueprint, developing the paper, arranging delivery and receiving scores and analysis.',
 'The same public-service purpose runs through these activities: credible selection, equal opportunity and confidence that results reflect the knowledge and skills being assessed.'])
 if title=='Strategic roadmap': return topic('Our direction',[
 'ETC aims to become a fully digital, research-led and internationally certified national testing body that every candidate and institution in Pakistan can trust. Its institutional priorities connect better tools with stronger people, evidence and services.'])+topic('Priorities for the years ahead',rows=[('Digital transformation','Strengthen technology across test development, delivery, candidate services and reporting.'),('Research and innovation','Use assessment research and psychometric evidence to improve tests and decisions.'),('Quality and certification','Strengthen standards, quality systems and progress towards international certification.'),('Institutional capacity','Develop professional skills, governance and the systems needed for sustained growth.'),('Stakeholder confidence','Improve communication and responsiveness to candidates, partners and clients.')])+topic('An assessment system that earns trust',[
 'Progress is measured by the quality of the whole process: useful questions, secure delivery, consistent scoring, fair treatment and clear results. Technology supports these aims alongside professional judgement and documented review.'])
 return None

def section(title,indices,number):
 if not indices:
  picture,position={
   'About ETC':('campus.jpg','54% center'),
   'Assessments & Methodology':('experts.jpg','50% center'),
   'Quality & Operations':('real-hall-wide.jpg','62% center')
  }[title]
  return '<article class="page chapter" data-title="'+escape(title)+'"><img class="chapter-photo" src="/profile/img/'+picture+'" alt="'+escape(title)+'" style="object-position:'+position+'"><div class="chapter-title"><h2>'+escape(title).replace(' &amp; ',' &amp;<br>')+'.</h2></div>'+foot(number,title)+'</article>'
 lead = number in [3,4,5]
 if lead:
  src={3:'chairman-cutout.png',4:'chairman-niaz.jpg',5:'real-ceo-portrait.jpg'}[number]
  name={3:'Prof. Dr Niaz Ahmed Akhtar',4:'Dr. Zia Ul Haq',5:'Dr Muhammad Imtiaz Haider'}[number]
  role={3:'Chairman, Higher Education Commission of Pakistan',4:'Executive Director, Higher Education Commission of Pakistan',5:'Chief Executive Officer, Education Testing Council'}[number]
  quote={3:'A fair test opens a door. Our responsibility is to ensure that it opens on the strength of merit.',4:'Strengthening assessment through integrity, innovation, standardization and excellent service.',5:'Building confidence in assessment by placing merit, integrity and the candidate experience at the heart of everything we do.'}[number]
  hero='<div class="leader"><img src="/profile/img/'+src+'" alt="'+name+'"><div><blockquote>“'+quote+'”</blockquote><b>'+name+'</b><small>'+role+'</small></div></div>'
  body=body_for(indices[0])
  if number==3:
   paragraphs=[
    'The Education Testing Council (ETC), established under the auspices of the Higher Education Commission (HEC), plays an important role in advancing fair, reliable and transparent assessments in Pakistan. Its work supports merit-based access to education, scholarships, employment and professional opportunities.',
    'For a candidate, a single test result can influence the course of a life. We must therefore treat every assessment as a public trust. Candidates should be judged on their knowledge and ability, regardless of their background or connections. Consistent procedures, secure examinations and sound test design are essential to upholding that trust.',
    'ETC has developed into a national assessment platform serving universities, government departments, regulatory bodies and professional councils. The confidence placed in ETC by these institutions brings with it a responsibility to maintain the integrity of every assessment it conducts.',
    'As we look ahead, HEC will support ETC in improving the quality of its questions, strengthening examination security and communicating more clearly with candidates. Continued investment in technology, research and skilled people will help ETC respond to changing needs while maintaining the reliability, validity and fairness of its assessments.',
    'I commend the ETC team and its partner institutions for their work. Together, we can build a culture in which opportunity follows merit and every candidate can have confidence in the result they receive.'
   ]
   body=''.join('<p>'+escape(p)+'</p>' for p in paragraphs)
  if number==4:
   body='<p>The Higher Education Commission established the Education Testing Council to give Pakistan a credible, professionally managed and self-sustaining national testing body. Our aim is straightforward: access to higher education and professional opportunities should be decided by merit, through processes that are open, consistent and trusted.</p><p>Institutions need tests that are standardized, secure and quick to report; candidates need clear information and fair treatment. ETC responds by combining sound measurement methods with appropriate technology. Every stage is guided by evidence and checked for quality.</p><p>We will continue to build institutional confidence through good governance, professional capacity, secure examinations and timely results. Collaboration with universities, public-sector organizations, employers and professional bodies will help make assessment more accessible, efficient and responsive.</p>'
   body+=topic('Strategic priorities',rows=[('Excellence','Reliable, well-designed assessments.'),('Integrity','Credible examinations and secure delivery.'),('Digital transformation','Technology-enabled tests and candidate services.'),('Confidence','Transparent, responsive stakeholder relationships.'),('Capacity','Professional standards, governance and improvement.')])
 else:
  hero=''
  body=''
  for index in indices:
   # The full USAT specification is summarized by the adjacent coverage and thinking-level tables.
   if index==33: continue
   label=pages[index].get('data-label','')
   body+='<section class="topic"><h3>'+escape(label)+'</h3>'+body_for(index)+'</section>'
 if number==30:
  body='''<p class="intro">Education Testing Council<br>Higher Education Commission, Islamabad, Pakistan</p>
  <div class="contacts"><article><span>Email</span><h3>etc@hec.gov.pk</h3></article><article><span>Phone</span><h3>051-90408184</h3></article><article><span>Website</span><h3>etc.hec.gov.pk</h3></article></div>
  <h3>Assessment services</h3><div class="service-grid"><p>Admissions and aptitude testing</p><p>Scholarships and postgraduate pathways</p><p>Recruitment and customized assessment</p><p>Professional and legal education tests</p></div>
  <blockquote>Merit · Transparency · Fairness · Quality</blockquote><p>For test announcements, registration, candidate guidance and results, visit the ETC website or contact the Council through the details above.</p>'''
 # Number 31 is actually contact (29 grouped pages start at page 3).
 if title=='Get in touch':
  body='''<div class="contact-brand"><img src="https://sbsi-cdn.sgp1.digitaloceanspaces.com/ETC/mockup/brand/etc-crest.png" alt="ETC crest"><p class="intro">Education Testing Council<br>Higher Education Commission, Islamabad, Pakistan</p></div><div class="contacts"><article><span>Email</span><h3>etc@hec.gov.pk</h3></article><article><span>Phone</span><h3>051-90408184</h3></article><article><span>Website</span><h3>etc.hec.gov.pk</h3></article></div><h3>Assessment services</h3><div class="service-grid"><p>Admissions and aptitude testing</p><p>Scholarships and postgraduate pathways</p><p>Recruitment and customized assessment</p><p>Professional and legal education tests</p></div><blockquote>Merit · Transparency · Fairness · Quality</blockquote><p>For test announcements, registration, candidate guidance and results, visit the ETC website or contact the Council through the details above.</p>'''
 if title in ['Assessment glossary','Assessment glossary — continued','Get in touch']:
  terms=[]
  for source_index in [82,83]:
   for term in pages[source_index].xpath('.//dt'):
    definition=term.getnext()
    if definition is not None: terms.append('<div><h4>'+escape(text(term))+'</h4><p>'+escape(text(definition))+'</p></div>')
  if title=='Assessment glossary': body='<div class="glossary-grid roomy-glossary">'+''.join(terms[:12])+'</div>'
  elif title=='Assessment glossary — continued': body='<div class="glossary-grid roomy-glossary">'+''.join(terms[12:])+'</div>'
  else: body='<section><h3>Assessment glossary · continued</h3><div class="glossary-grid">'+''.join(terms[16:])+'</div></section><section class="contact-compact"><h3>Education Testing Council</h3><p>Higher Education Commission, Islamabad, Pakistan</p><div class="contacts"><article><span>Email</span><h3>etc@hec.gov.pk</h3></article><article><span>Phone</span><h3>051-90408184</h3></article><article><span>Website</span><h3>etc.hec.gov.pk</h3></article></div></section>'
 edited=condensed(title)
 if edited: body=edited
 if title=='The item life cycle and measurement':
  body+=topic('Precision and review decisions',[
   'The Test Information Function and Conditional SEM show where a test measures most precisely and where uncertainty is greater. Item characteristic curves and Wright maps help assess difficulty and targeting.',
   'Item review considers discrimination, distractor functioning, response patterns and Rasch fit (preferred Infit / Outfit range 0.7–1.3). Experts decide whether to retain, revise or critically review each item; flags do not trigger automatic deletion.'
  ])
 if title=='Reliability and validity':
  body+=topic('Fairness throughout the process',['Fairness means that scores depend on the knowledge and skills being assessed, rather than unrelated personal or social factors. ETC checks content for bias, uses DIF analysis, applies standardized administration and scoring, and provides reasonable arrangements on request. Candidates can raise concerns through published support and hearing procedures.'])
 if title=='Strategic roadmap': hero='<img class="roadmap-art" src="/profile/img/strategic-roadmap-plain.png" alt="Institutional progress in green and gold">'
 return '<article class="page '+('leadership' if lead else '')+'" data-title="'+escape(title)+'"><header><span class="eyebrow">INSTITUTIONAL PROFILE · '+str(number).zfill(2)+'</span><h2>'+escape(title)+'.</h2></header>'+hero+'<div class="content">'+body+'</div>'+foot(number,title)+'</article>'

css='''
:root { --paper:#FBF9F4; --deep:#102C21; --green:#226447; --gold:#B8913A; --ink:#20392D; --muted:#627166; --line:#DDDCCF; --pw:794px; --ph:1123px; }
*{box-sizing:border-box}body{margin:0;background:#E7E3DA;color:var(--ink);font-family:Mulish,Arial,sans-serif}button{font:inherit;cursor:pointer}
.toolbar{height:58px;position:fixed;inset:0 0 auto;display:flex;align-items:center;justify-content:space-between;padding:0 24px;background:var(--paper);z-index:10;border-bottom:1px solid var(--line);gap:20px}.toolbar b{font-family:Outfit,sans-serif}.toolbar small{color:var(--muted);margin-left:12px}.toolbar button{border:1px solid var(--line);background:white;border-radius:6px;padding:8px 12px}.toolbar button.active{background:var(--deep);color:white}
#stage{position:fixed;inset:76px 68px 66px;display:flex;align-items:center;justify-content:center}#frame{position:relative}#book{position:absolute;top:0;left:0;transform-origin:top left}.spread{display:flex;width:max-content;box-shadow:0 8px 26px #17271c29}.spread[hidden]{display:none}
.page{width:var(--pw);height:var(--ph);position:relative;background:var(--paper);padding:58px 58px 64px;overflow:hidden;display:flex;flex-direction:column;gap:22px;flex-shrink:0}.page:before{content:'';position:absolute;inset:0 0 auto auto;width:260px;height:220px;background:url(/profile/img/pattern-gold.png) top right/260px;opacity:.23;mask-image:linear-gradient(225deg,#000,transparent 75%);pointer-events:none}.spread .page:first-child:before{left:0;right:auto;transform:scaleX(-1)}
header{flex:none}h2{font:600 40px/1.05 Outfit,sans-serif;letter-spacing:-1.2px;margin:16px 0 0;color:var(--deep)}.eyebrow{font-size:10px;font-weight:800;letter-spacing:1.7px;color:var(--green);border-bottom:2px solid var(--gold);padding-bottom:9px;display:inline-block}h3{font:600 20px/1.2 Outfit,sans-serif;margin:0 0 12px;color:var(--deep)}h4{font:600 16px/1.25 Outfit,sans-serif;margin:14px 0 7px}p{margin:0 0 11px}p:last-child{margin-bottom:0}p.fact{border-left:2px solid var(--gold);padding-left:12px;margin-bottom:12px}blockquote{font-family:'Source Serif 4',Georgia,serif;font-style:italic;font-size:19px;line-height:1.5;border-left:2px solid var(--gold);padding:3px 0 3px 16px;margin:10px 0 18px;color:var(--deep)}
.content{flex:1;min-height:0;display:flex;flex-direction:column;justify-content:space-between;gap:20px;font-size:15px;line-height:1.65}.topic{flex:none;border-top:1px solid var(--line);padding-top:16px}.topic:first-child{border-top:2px solid var(--gold)}.topic h3{font-size:19px}.topic table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:.91em;line-height:1.5;margin:10px 0}td,th{text-align:left;padding:9px 8px;border-bottom:1px solid var(--line);vertical-align:top;overflow-wrap:anywhere}th{color:var(--green);font-weight:800;background:#F0F1E9}td:first-child{font-weight:700}ul{margin:7px 0;padding-left:20px}li{margin-bottom:7px}dl{margin:0;display:grid;grid-template-columns:145px 1fr;gap:11px 20px}dt{font-weight:800;color:var(--green)}dd{margin:0}footer{flex:none;display:flex;justify-content:space-between;align-items:end;font-size:9px;letter-spacing:1.4px;font-weight:800;color:var(--muted);padding-top:12px}footer span:last-child{color:var(--deep);font:600 13px Outfit,sans-serif}
.leader{display:grid;grid-template-columns:160px 1fr;gap:26px;align-items:center;padding:20px;background:#EDF0E7;border-top:2px solid var(--gold)}.leader img{width:160px;height:190px;object-fit:cover;object-position:50% 20%;border-radius:5px}.leadership:first-child .leader img{object-fit:contain;object-position:bottom}.leader blockquote{font-size:21px;border:0;padding:0;margin:0 0 15px}.leader b{font:600 16px Outfit,sans-serif}.leader small{display:block;font-size:11px;margin-top:5px;line-height:1.5}.leadership .content{justify-content:flex-start;gap:16px}.leadership .content>p{font-size:16px;line-height:1.85}.leadership .content .sub{display:none}
.cover,.back{color:white;padding:58px;background:var(--deep)}.cover:before,.back:before{display:none}.cover-photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:62% center}.cover:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,#0b231af0,#0b231a8c 65%,#0b231a24),linear-gradient(0deg,#0b231a 0%,transparent 65%)}.cover>*:not(.cover-photo){z-index:1;position:relative}.brand{display:flex;gap:15px;align-items:center;font-size:10px;letter-spacing:1.4px;font-weight:800}.brand img{width:64px;height:64px;object-fit:contain}.cover h1{font:600 78px/.99 Outfit,sans-serif;letter-spacing:-3px;margin:0}.cover h1 span{color:#D9BE7C}.cover-main{margin-top:95px}.cover .strap{color:#D9BE7C;font-size:15px;margin-top:27px;font-weight:700}.cover .intro{font-size:17px;line-height:1.75;width:85%;color:#e3e7df}.cover-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:auto}.cover-stats div{border-top:2px solid #b8913a;padding-top:17px}.cover-stats b{font:600 35px Outfit,sans-serif;display:block}.cover-stats span{font-size:11px}.edition{display:flex;justify-content:space-between;align-items:end;border-top:1px solid #b8913a80;padding-top:20px;margin-top:20px}.edition span{font-size:11px;line-height:1.7;max-width:70%;text-transform:uppercase;letter-spacing:1px}.edition b{font:600 22px Outfit,sans-serif}.back{align-items:center;justify-content:center;text-align:center;gap:32px}.back img{width:180px}.back h2{color:white;font-size:43px}.back p{font-size:20px;line-height:1.8}.back .motto{color:#D9BE7C;font-size:16px}
.toc{display:grid;grid-template-columns:1fr 1fr;gap:0 28px;margin:0;padding:0;list-style:none;align-content:start}.toc li{display:flex;justify-content:space-between;gap:10px;padding:13px 0;border-bottom:1px solid var(--line);margin:0;font:500 15px/1.3 Outfit,sans-serif}.toc li span:last-child{color:var(--green);font-weight:700}.toc-intro{font-size:17px;line-height:1.7;margin-bottom:10px}.principles{display:grid;grid-template-columns:1fr 1fr;gap:20px;border-top:2px solid var(--gold);padding-top:20px;margin-top:20px}.principles b{font:600 19px Outfit,sans-serif;display:block;margin-bottom:5px}.principles p{font-size:13px;line-height:1.6}.roadmap-art{width:100%;height:210px;object-fit:cover;flex:none}.contact-brand{display:flex;align-items:center;gap:28px}.contact-brand img{width:130px}.intro{font-size:19px;line-height:1.7}.contacts{display:grid;gap:0}.contacts article{border-top:1px solid var(--line);padding:24px 0}.contacts span{text-transform:uppercase;letter-spacing:1.8px;color:var(--green);font-size:10px;font-weight:800}.contacts h3{font-size:26px;margin:10px 0 0}.service-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.service-grid p{margin:0;background:#EEF1E8;border-left:2px solid var(--gold);padding:15px;font-size:14px}.nav{position:fixed;top:50%;border-radius:50%;width:43px;height:43px;background:white;border:1px solid var(--line);font-size:24px;z-index:12}.nav:disabled{opacity:.3}#prev{left:12px}#next{right:12px}.pager{position:fixed;bottom:20px;left:0;right:0;text-align:center;font-size:12px;color:var(--muted)}.pager b{color:var(--deep);margin-right:18px}.all #stage{position:relative;inset:auto;margin:82px auto 60px;display:block;width:calc(100% - 40px)}.all #book{position:relative;display:flex;flex-direction:column;gap:30px}.all .nav,.all .pager{display:none}
@page{size:210mm 297mm;margin:0}@media print{body{background:white}.toolbar,.nav,.pager{display:none!important}#stage,#frame,#book{display:block!important;position:static!important;margin:0!important;width:auto!important;height:auto!important;transform:none!important}.spread{display:contents!important}.page{width:210mm;height:297mm;break-after:page;box-shadow:none}}
'''

cover='''<article class="page cover" data-title="Cover"><img class="cover-photo" src="/profile/img/cover-assessment-enhanced.png" alt="Candidates sitting an assessment"><div class="brand"><img src="https://sbsi-cdn.sgp1.digitaloceanspaces.com/ETC/mockup/brand/etc-crest.png" alt="ETC crest"><span>HIGHER EDUCATION COMMISSION<br>PAKISTAN</span></div><div class="cover-main"><h1>Assessment,<br>Testing and<br><span>Evaluation.</span></h1><p class="strap">Education Testing Council · Institutional Profile</p><p class="intro">A national assessment platform opening pathways to education, scholarships and professional opportunity through merit.</p></div><div class="cover-stats"><div><b>2 million</b><span>Candidates tested since 2017</span></div><div><b>203</b><span>Test centres in 40 cities</span></div><div><b>251,685</b><span>Calibrated test items</span></div></div><div class="edition"><span>To advance quality and equity in education through assessments for a brighter Pakistan</span><b>2026 Edition</b></div></article>'''
cover=cover.replace('<div class="cover-stats">','<div class="cover-values"><span>Merit</span><span>Transparency</span><span>Fairness</span><span>Quality</span></div><div class="cover-stats">')
tocitems='<li><span>Welcome</span><span>03</span></li>'+''.join('<li><span>'+escape(title)+'</span><span>'+str(i+5).zfill(2)+'</span></li>' for i,(title,_) in enumerate(groups))+'<li><span>Conclusion</span><span>30</span></li>'
toc='<article class="page" data-title="Contents"><header><span class="eyebrow">CONTENTS</span><h2>Inside this profile.</h2></header><div class="content"><p class="toc-intro">Who we are, how we work, and the evidence behind every ETC assessment.</p><ol class="toc">'+tocitems+'</ol><div class="principles"><div><b>Merit</b><p>Opportunity earned through ability and performance.</p></div><div><b>Transparency</b><p>Processes clear, explained and open to scrutiny.</p></div><div><b>Fairness</b><p>Every candidate assessed impartially.</p></div><div><b>Quality</b><p>Consistent standards, continuously improved.</p></div></div></div>'+foot(2,'Contents')+'</article>'
blank='<article class="page blank-page" data-title="Blank inside cover"></article>'
welcome='<article class="page bookend" data-title="Welcome"><header><span class="eyebrow">WELCOME</span><h2>Opportunity begins<br>with merit.</h2></header><div class="content">'+topic('Welcome to the Education Testing Council',['Behind every assessment is a person looking towards the next stage of life: a place at university, a scholarship, a profession or a new opportunity. ETC’s work is to help make those decisions credible, consistent and fair.'])+topic('Inside this profile',['Explore the Council’s purpose, leadership and services, followed by the assessments and methods that support its work. The final chapters explain quality assurance, secure operations, partnerships and the priorities guiding ETC’s future.'])+'<blockquote>Merit · Transparency · Fairness · Quality</blockquote><p>Education Testing Council<br>Higher Education Commission, Pakistan</p></div>'+foot(3,'Welcome')+'</article>'
conclusion='<article class="page bookend" data-title="Conclusion"><header><span class="eyebrow">CONCLUSION</span><h2>Confidence in assessment.<br>Opportunity through merit.</h2></header><div class="content">'+topic('A shared public trust',['Assessment connects individual ambition with institutional decisions. That responsibility calls for clear test purposes, sound questions, secure delivery, reliable scoring and fair treatment of every candidate.'])+topic('A connected system',['ETC brings these elements together through expert review, a calibrated item bank, psychometric analysis and coordinated operations. Its partnerships with institutions support selection for education, scholarships, employment and professional pathways.'])+topic('Looking ahead',['The Council’s direction is to strengthen technology, research, professional capacity and quality systems. Continued improvement—and clear communication with candidates and partners—will help sustain confidence in the results.'])+'<blockquote>Every assessment should support a decision that candidates and institutions can trust.</blockquote></div>'+foot(30,'Conclusion')+'</article>'
content=[cover,blank,welcome,toc]+[section(t,ids,i+3) for i,(t,ids) in enumerate(groups)]+[conclusion,blank]
content.append('''<article class="page back" data-title="Back cover"><img src="https://sbsi-cdn.sgp1.digitaloceanspaces.com/ETC/mockup/brand/etc-crest.png" alt="ETC crest"><h2>Education<br>Testing Council.</h2><p>Higher Education Commission<br>Islamabad, Pakistan</p><p class="motto">Merit · Transparency · Fairness · Quality</p><p>etc.hec.gov.pk</p></article>''')
assert len(content)==32
content[-1]=content[-1].replace('<p>etc.hec.gov.pk</p>','<p class="back-contact">etc@hec.gov.pk<br>051-90408184<br>etc.hec.gov.pk</p>')
for actual in range(2,30):
 root=html.fromstring(content[actual])
 footer=root.find('footer')
 if footer is not None: footer[-1].text=str(actual+1).zfill(2)
 eyebrow=root.xpath('./header/span[@class="eyebrow"]')
 if eyebrow and root.get('data-title')!='Contents': eyebrow[0].text='INSTITUTIONAL PROFILE · '+str(actual+1).zfill(2)
 content[actual]=html.tostring(root,encoding='unicode')
content=[decorate(page) for page in content]
spreads=['<div class="spread">'+content[0]+'</div>']
for i in range(1,31,2): spreads.append('<div class="spread">'+''.join(content[i:i+2])+'</div>')
spreads.append('<div class="spread">'+content[-1]+'</div>')
css+='''
.topic p{margin-bottom:8px}.topic p.fact{padding-left:10px;margin-bottom:7px;line-height:1.45}.topic h4{margin:9px 0 5px;font-size:1.05em}.topic h3{margin-bottom:9px}.topic{padding-top:12px}.content{gap:16px}.topic dl{font-size:.94em;grid-template-columns:135px 1fr;gap:9px 15px}.topic td,.topic th{padding:7px}.leadership .content>p{font-size:inherit;line-height:1.65}.leader{padding:16px}.leader img{height:175px;width:145px}.leader{grid-template-columns:145px 1fr}.leader blockquote{font-size:19px}.toc li{padding:10px 0;font-size:14px}.principles{gap:15px;margin-top:8px;padding-top:15px}.content>blockquote{font-size:1.15em}.topic blockquote{font-size:1.1em}.content .topic table{font-size:.9em}.content>.topic:only-child dl{grid-template-columns:155px 1fr;gap:11px 18px}.topic .fact{font-size:inherit}
table td:first-child{width:30%}.leader+ .content{line-height:1.6}.leader+ .content>p{line-height:1.6}.content>.topic:only-child dl{font-size:1em}
.glossary-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px 28px;font-size:14px;line-height:1.5}.glossary-grid h4{font-size:14px;margin:0 0 4px;color:var(--green)}.glossary-grid p{margin:0;font-size:12.5px}.glossary-grid>div{border-top:1px solid var(--line);padding-top:9px}
.glossary-grid{gap:18px 26px}.glossary-grid p{font-size:14px}.glossary-grid h4{font-size:15px}.contact-compact{border-top:2px solid var(--gold);padding-top:20px}.contact-compact .contacts{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}.contact-compact .contacts h3{font-size:18px}.contact-compact .contacts article{padding:14px 0}.content:has(>.glossary-grid){justify-content:flex-start}
.content>.glossary-grid{height:100%;align-content:space-between}
.leader{height:209px;flex:none;grid-template-columns:145px 1fr;gap:26px;align-items:center;padding:16px}
.page.leadership .leader img{display:block;width:145px;height:175px;object-fit:cover;object-position:50% 20%;border-radius:5px}
.page[data-title="Chairman’s foreword"] .leader{padding:16px 16px 0 0}
.page[data-title="Chairman’s foreword"] .leader img{display:block;height:191px;align-self:end;object-fit:contain;object-position:left bottom;border-radius:0}
.page[data-title="Chairman’s foreword"] .leader>div{padding-bottom:16px}
.cover .brand img{width:82px;height:82px}.cover .brand{font-size:12px;gap:20px}.cover-main{margin-top:42px}.cover h1{font-size:99px;line-height:1.04;letter-spacing:-3.5px}.cover .strap{font-size:18px;margin-top:29px}.cover .intro{font-size:21px;line-height:1.65;width:94%;margin-top:18px}.cover-values{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:27px;padding:24px 0;border-top:1px solid #b8913a88;border-bottom:1px solid #b8913a88;color:#E2C77F;font:500 17px Outfit,sans-serif}.cover-stats{margin-top:auto;padding-top:12px}.cover-stats b{font-size:40px}.cover-stats span{font-size:12px;line-height:1.6;display:block;margin-top:6px}
'''
css+='''
.point-label{display:flex;align-items:flex-start;gap:8px}.point-label>span{min-width:0}.point-icon{display:block;flex:0 0 16px;width:16px;height:16px;margin-top:2px;fill:none;stroke:var(--green);stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.topic>h3 .point-icon{width:21px;height:21px;flex-basis:21px;margin-top:0;color:var(--green)}.topic>h3 .point-label{gap:10px;align-items:center}.topic td .point-icon{width:14px;height:14px;flex-basis:14px;margin-top:3px}.topic td .point-label{gap:7px}.glossary-grid .point-icon{width:15px;height:15px;flex-basis:15px;margin-top:1px}.cover-values .point-icon{stroke:#E2C77F;width:18px;height:18px;flex-basis:18px;margin-top:1px}.cover-values .point-label{gap:7px}.principles .point-icon{width:20px;height:20px;flex-basis:20px}.content ul{list-style:none;padding-left:0}.content ul>li{position:relative;padding-left:18px}.content ul>li:before{content:'▸';color:var(--gold);position:absolute;left:0;top:0;font-weight:800}.contact-compact .contacts .point-icon{width:16px;height:16px;flex-basis:16px;margin-top:0}
'''
css+='''
.chapter{padding:58px;justify-content:center;color:white;background:var(--deep)}.chapter:before{display:none}.chapter-photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.chapter:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(9,35,24,.82),rgba(9,35,24,.22)),linear-gradient(0deg,rgba(9,35,24,.75),transparent 50%)}.chapter-title{position:relative;z-index:1;margin-top:220px;border-top:3px solid var(--gold);padding-top:28px}.chapter h2{color:white;font-size:72px;line-height:1.08;letter-spacing:-2px;margin:0}.chapter footer{position:absolute;bottom:40px;left:58px;right:58px;z-index:1;color:#e2e8df}.chapter footer span:last-child{color:white}
'''
css+='''
.blank-page:before{display:none}.compact-glossary{gap:8px 24px;line-height:1.35}.compact-glossary h4{font-size:13px;margin-bottom:3px}.compact-glossary p{font-size:12px;line-height:1.35}.compact-glossary>div{padding-top:7px}.compact-glossary .point-icon{width:13px;height:13px;flex-basis:13px}.back-contact{font-size:17px!important;line-height:1.8!important}
'''
css+='''
.compact-glossary{row-gap:4px}.compact-glossary>div{padding-top:4px}.compact-glossary .point-label{gap:6px}
'''
css+='''
.blank-page{background:#fff!important}.bookend h2{font-size:53px;line-height:1.1}.bookend .content{font-size:19px!important;line-height:1.8}.bookend .topic h3{font-size:22px}.bookend blockquote{font-size:27px;margin:0;padding-left:22px}.bookend .topic{padding-top:22px}.bookend header{margin-bottom:22px}
'''
css+='''
.roomy-glossary{gap:24px 28px;align-content:space-between;height:100%;line-height:1.6}.roomy-glossary h4{font-size:17px;margin-bottom:9px}.roomy-glossary p{font-size:16px;line-height:1.65}.roomy-glossary>div{padding-top:14px}.roomy-glossary .point-icon{width:18px;height:18px;flex-basis:18px;margin-top:2px}
'''
css+='''
.roomy-glossary{gap:16px 28px;line-height:1.5}.roomy-glossary h4{font-size:16px;margin-bottom:6px}.roomy-glossary p{font-size:15px;line-height:1.5}.roomy-glossary>div{padding-top:10px}
'''
css+='''
.roomy-glossary .point-label{align-items:flex-start;gap:9px}.roomy-glossary .point-icon{width:24px;height:24px;flex-basis:24px;padding:3px;margin-top:0;border:1px solid #C7D7C8;border-radius:50%;background:#EDF3EA;stroke:var(--green)}.roomy-glossary{row-gap:12px}
'''
css+='''
.page[data-title="Undergraduate admission testing"] .topic:nth-child(2) td:first-child{width:43%;white-space:nowrap}.page[data-title="Undergraduate admission testing"] .topic:nth-child(2) td:first-child .point-label>span{white-space:nowrap}
'''
js='''
const sheets=[...document.querySelectorAll('.spread')], book=document.querySelector('#book'), frame=document.querySelector('#frame'), stage=document.querySelector('#stage');let current=0,all=false;
function fit(){const width=all?1588:sheets[current].querySelectorAll('.page').length*794;const scale=all?Math.min(1,stage.clientWidth/1588):Math.min(stage.clientWidth/width,stage.clientHeight/1123);book.style.width=width+'px';book.style.transform='scale('+scale+')';frame.style.width=width*scale+'px';frame.style.height=(all?book.scrollHeight:1123)*scale+'px'}
function show(n){current=Math.max(0,Math.min(sheets.length-1,n));sheets.forEach((s,i)=>s.hidden=!all&&i!==current);document.querySelector('#prev').disabled=current===0;document.querySelector('#next').disabled=current===sheets.length-1;const pp=[...sheets[current].querySelectorAll('.page')];document.querySelector('#label').textContent=pp.map(p=>p.dataset.title).join(' · ');document.querySelector('#count').textContent=(current===0?'Cover':current===sheets.length-1?'Back cover':'Pages '+(current*2)+'–'+(current*2+1))+' / 32';history.replaceState(null,'','/a4/'+location.search+'#s'+current);fit()}
document.querySelector('#prev').onclick=()=>show(current-1);document.querySelector('#next').onclick=()=>show(current+1);document.querySelector('#print').onclick=()=>window.print();document.querySelector('#mode').onclick=function(){all=!all;document.body.classList.toggle('all',all);this.textContent=all?'Show spreads':'All pages';show(current)};window.onresize=fit;document.addEventListener('keydown',e=>{if(e.key==='ArrowRight')show(current+1);if(e.key==='ArrowLeft')show(current-1)});
function typeset(){document.querySelectorAll('.page:not(.cover):not(.back)').forEach(p=>{if(!p.offsetHeight)return;const c=p.querySelector('.content');if(!c)return;let size=17;c.style.fontSize=size+'px';c.style.gap='16px';while(c.scrollHeight>c.clientHeight&&size>11.5){size-=.25;c.style.fontSize=size+'px';c.style.gap=Math.max(8,size-3)+'px'};})}
document.fonts.ready.then(()=>{typeset();fit()});show(parseInt(location.hash.replace('#s',''))||0);const observer=new MutationObserver(()=>typeset());sheets.forEach(s=>observer.observe(s,{attributes:true,attributeFilter:['hidden']}));
'''
out='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>A4 Institutional Profile — Education Testing Council</title><link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Mulish:wght@400;500;600;700;800&family=Source+Serif+4:ital,opsz,wght@1,8..60,400&display=swap" rel="stylesheet"><style>'+css+'</style></head><body><div class="toolbar"><div><b>Education Testing Council</b><small>A4 portrait · 210 × 297 mm · 32 pages</small></div><div><button id="mode">All pages</button> <button id="print">Print / PDF</button></div></div><main id="stage"><div id="frame"><div id="book">'+''.join(spreads)+'</div></div></main><button class="nav" id="prev" aria-label="Previous spread">‹</button><button class="nav" id="next" aria-label="Next spread">›</button><div class="pager"><b id="label"></b><span id="count"></span></div><script>'+js+'</script></body></html>'
symbols=re.findall(r'<symbol\b[^>]*>.*?</symbol>',open('profile/index.html',encoding='utf-8').read(),re.S)
sprite='<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute;overflow:hidden" aria-hidden="true"><defs>'+''.join(symbols)+'</defs></svg>'
out=out.replace('<body>','<body>'+sprite,1)
# Emit an apply_patch update so the generated artifact uses the standard edit mechanism.
print('*** Begin Patch\n*** Add File: D:\\GitHub\\ETC\\a5\\a4\\index.html')
for line in out.splitlines(): print('+'+line)
print('*** End Patch')
