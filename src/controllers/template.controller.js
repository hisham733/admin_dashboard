const prisma = require('../configs/prisma');

// 1. Injected CSS to hide print buttons during preview
const HIDE_PRINT_STYLE = `<style>
  [onclick*="print"], [class*="print"], [id*="print"], .form-actions { display:none!important; }
</style>`;

// 2. Injected Script with heavy Logging for the Browser Console
const RESIZE_SCRIPT = `<script>
(function(){
  function reportHeight(){
    setTimeout(function() {
      var h = Math.max(200, document.body.scrollHeight || document.documentElement.scrollHeight);
      if (window.parent) {
        window.parent.postMessage({ type: 'preview-resize', height: h }, '*');
      }
    }, 100);
  }

  // Listen for data updates from the Admin Console UI
  window.addEventListener('message', function(e){
    if (e.data && (e.data.fields || e.data.type === 'update-preview')) {
      reportHeight();
    }
  });

  window.addEventListener('load', function() {
    reportHeight();
  });
})();
</script>`;

/**
 * GET /template
 * Serves the HTML with full debug logs in the terminal.
 */
async function getTemplate(req, res) {
  try {
    const template = await prisma.template.findFirst({ orderBy: { id: 'asc' } });
    
    if (!template) {
      return res.status(404).type('text/html').send('<!DOCTYPE html><html><body>No template found in DB.</body></html>');
    }

    if (!template.html) {
      return res.status(404).type('text/html').send('<!DOCTYPE html><html><body>Template HTML is empty.</body></html>');
    }

    const inject = HIDE_PRINT_STYLE + RESIZE_SCRIPT;
    let finalHtml = template.html;

    // Inject before closing body tag
    if (finalHtml.includes('</body>')) {
      finalHtml = finalHtml.replace('</body>', inject + '</body>');
    } else {
      finalHtml = finalHtml + inject;
    }

    res.type('text/html').send(finalHtml);

  } catch (err) {
    res.status(500).send('Internal Server Error: ' + err.message);
  }
}

/**
 * GET /template/exists
 * Debugs the presence check.
 */
async function hasTemplate(req, res) {
  try {
    const template = await prisma.template.findFirst({
      orderBy: { id: 'asc' },
      select: { id: true, html: true }
    });

    const hasHtml = template && template.html && String(template.html).trim().length > 0;
    const exists = !!(template && template.id && hasHtml);

    res.json({ exists: exists });
  } catch (err) {
    res.json({ exists: false, error: err.message });
  }
}

module.exports = { getTemplate, hasTemplate };