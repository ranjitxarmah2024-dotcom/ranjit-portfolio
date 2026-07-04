from pathlib import Path
from PyPDF2 import PdfReader
p = Path('assets/resume/resume.pdf')
reader = PdfReader(str(p))
text = []
for page in reader.pages:
    extracted = page.extract_text()
    if extracted:
        text.append(extracted)
out = Path('resume_text_output.txt')
out.write_text('\n'.join(text), encoding='utf-8')
print('wrote', out.exists(), out.stat().st_size)
