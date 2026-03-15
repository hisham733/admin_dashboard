const prisma = require('../configs/prisma');

const HIDE_PRINT_STYLE = `<style>[onclick*="print"],[class*="print"],[id*="print"]{display:none!important;}</style>`;

const RESIZE_SCRIPT = `<script>
(function(){
  function hidePrintButtons(){
    document.querySelectorAll('button,a,input[type="button"],input[type="submit"]').forEach(function(el){
      var t = (el.textContent||el.value||'').trim().toLowerCase();
      var oc = (el.getAttribute('onclick')||'').toLowerCase();
      var cl = (el.className||'').toLowerCase();
      if(t==='print'||t.includes('print')||oc.includes('print')||cl.includes('print')){
        el.style.setProperty('display','none','important');
      }
    });
  }
  function reportHeight(){
    var h = Math.max(200, document.body.scrollHeight || document.documentElement.scrollHeight);
    if (window.parent) window.parent.postMessage({ type: 'preview-resize', height: h }, '*');
  }
  window.addEventListener('message', function(e){
    if (e.data && e.data.fields) {
      hidePrintButtons();
      setTimeout(reportHeight, 80);
    }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ hidePrintButtons(); reportHeight(); });
  else { hidePrintButtons(); reportHeight(); }
})();
</script>`;

async function getTemplate(req, res) {
  const template = await prisma.template.findFirst({
    orderBy: { id: 'asc' }
  });
  if (!template || !template.html) {
    return res.status(404).type('text/html').send('<!DOCTYPE html><html><body><p>No template found.</p></body></html>');
  }
  const inject = HIDE_PRINT_STYLE + RESIZE_SCRIPT;
  const html = template.html.includes('</body>')
    ? template.html.replace('</body>', inject + '</body>')
    : template.html + inject;
  res.type('text/html').send(html);
}

async function hasTemplate(req, res) {
  const template = await prisma.template.findFirst({
    orderBy: { id: 'asc' },
    select: { id: true, html: true }
  });
  const hasHtml = template && template.html && String(template.html).trim().length > 0;
  res.json({ exists: !!(template && template.id && hasHtml) });
}

module.exports = { getTemplate, hasTemplate };
