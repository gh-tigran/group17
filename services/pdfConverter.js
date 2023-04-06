import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();

async function pdfConverter(html) {
  await page.setContent(`${html}<style>*{-webkit-print-color-adjust:exact;}</style>`, {});
  const id = 'data';
  const data = await page.evaluate((cId) => ({
    h2: document.querySelector(`#${cId}`).innerHTML,
  }), [id]);
  console.log(data);
  return page.pdf({
    width: 320,
    height: 600,
  });
}

process.on('beforeExit', () => {
  browser.close().catch(console.error);
});
process.once('SIGUSR2', () => {
  browser.close().catch(console.error);
});

export default pdfConverter;
