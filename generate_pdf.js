const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();

  // Load the HTML file
  const htmlPath = path.resolve(__dirname, 'index.html');
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');

  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for fonts to load properly
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(resolve => setTimeout(resolve, 1000)); // Short safety buffer

  // Set viewport to A4-like width
  await page.setViewport({ width: 1200, height: 900, deviceScaleFactor: 1.5 });

  // Generate PDF - A4 format, print-optimized
  await page.pdf({
    path: 'Juan_Sebastian_Macias_Duque_HV.pdf',
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: `
      <div style="font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; font-size: 8px; color: #777777; width: 100%; display: flex; justify-content: space-between; padding-left: 15mm; padding-right: 15mm; box-sizing: border-box;">
        <span>Juan Sebastián Macías Duque — Administrador de Empresas</span>
        <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
      </div>
    `,
    margin: {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm'
    },
    preferCSSPageSize: true
  });

  await browser.close();
  console.log('PDF generado exitosamente: Juan_Sebastian_Macias_Duque_HV.pdf');
})();
