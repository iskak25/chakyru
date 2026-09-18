const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript(() => {
    const inv = { id:'test-site3d', templateId:'baxmal', eventType:'toi', names:'A & B', hosts:'x', date:'2026-12-12', time:'17:00', venue:'v', address:'a', city:'c', message:'m', dressCode:'', adultsOnly:false, music:false, musicUrl:'', mapUrl:'', coverImage:'', layout:{}, extras:[], blockColors:{}, createdAt:new Date().toISOString(), guests:[], wishes:[] };
    window.localStorage.setItem('chakyru-invitations', JSON.stringify([inv]));
  });
  const page = await context.newPage();
  await page.goto('http://localhost:3000/create/test-site3d', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  await page.evaluate(() => {
    const user = { id:'google:iskak2512@gmail.com', name:'Iskak', role:'host', auth:'google', email:'iskak2512@gmail.com', accountRole:'admin', templates:[] };
    window.localStorage.setItem('chakyru-user', JSON.stringify(user));
    window.dispatchEvent(new Event('chakyru-sync'));
  });
  await page.waitForTimeout(3000);
  await page.locator('.editor-dock-tabs button', { hasText: 'Музыка' }).click();
  await page.waitForTimeout(800);
  const info = await page.evaluate(() => {
    const dock = document.querySelector('.editor-dock');
    const panel = document.querySelector('.editor-dock-panel');
    const tabs = document.querySelector('.editor-dock-tabs');
    const rect = (el) => el ? (({x,y,width,height}) => ({x,y,width,height}))(el.getBoundingClientRect()) : null;
    const cs = (el) => el ? { position: getComputedStyle(el).position, height: getComputedStyle(el).height, top: getComputedStyle(el).top, bottom: getComputedStyle(el).bottom, display: getComputedStyle(el).display, flexDirection: getComputedStyle(el).flexDirection } : null;
    return { dockRect: rect(dock), dockStyle: cs(dock), panelRect: rect(panel), panelStyle: cs(panel), tabsRect: rect(tabs) };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
