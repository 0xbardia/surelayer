// Run through Playwright CLI: run-code --filename scripts/verify-premium-browser.js
// Read-only public QA. It performs no wallet writes or chain mutations.
async page => {
  const errors = [], failures = [], badResponses = [], staleRequests = [], rows = [];
  const expectedContract = (typeof process !== 'undefined' ? process.env.SURELAYER_EXPECTED_CONTRACT_ADDRESS : undefined)?.toLowerCase();
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', r => {
    if (!(r.url().includes('_rsc=') && r.failure()?.errorText === 'net::ERR_ABORTED')) failures.push([r.url(), r.failure()?.errorText]);
  });
  page.on('response', r => { if (r.status() >= 400) badResponses.push([r.url(), r.status()]); });
  page.on('request', r => { if (/localhost|127\.0\.0\.1/i.test(r.url() + (r.postData() || ''))) staleRequests.push(r.url()); });
  const width = page.viewportSize().width;
  await page.addInitScript(() => {
    window.__premiumShifts = 0;
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__premiumShifts += entry.value;
    }).observe({type:'layout-shift', buffered:true});
  });
  for (const route of ['/', '/claims', '/claims/1', '/create', '/account']) {
    const response = await page.goto('https://surelayer.bydx.fun' + route);
    if (route === '/') await page.locator('.hero-panel .status').filter({hasText:'Live'}).waitFor();
    if (route === '/claims') await page.locator('.claim-row').first().waitFor();
    if (route === '/claims/1') await page.locator('.detail-title').waitFor();
    if (route === '/create') await page.getByText('Minimum 1 GEN.', {exact:false}).waitFor();
    await page.waitForTimeout(500);
    const state = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      heading: document.querySelector('h1')?.textContent,
      activeNavigation: document.querySelector('nav [aria-current="page"]')?.textContent || null,
      cls: window.__premiumShifts,
      formLabels: [...document.querySelectorAll('input:not([type=checkbox]),textarea')].every(el=>el.labels?.length),
    }));
    if (state.overflow || response.status() !== 200 || !state.formLabels) throw new Error(JSON.stringify({route,...state}));
    rows.push({route,http:response.status(),...state});
  }
  const config = await page.evaluate(() => fetch('/api/config',{cache:'no-store'}).then(r=>r.json()));
  if (!/^0x[a-f0-9]{40}$/i.test(config.contractAddress) || /^0x0{40}$/i.test(config.contractAddress) || config.chainId !== 61999) throw new Error('Runtime identity mismatch');
  if (expectedContract && config.contractAddress.toLowerCase() !== expectedContract) throw new Error('Runtime contract does not match SURELAYER_EXPECTED_CONTRACT_ADDRESS');
  if (errors.length || failures.length || badResponses.length || staleRequests.length) throw new Error(JSON.stringify({errors,failures,badResponses,staleRequests}));
  return {width,rows,errors,failures,badResponses,staleRequests,contract:config.contractAddress,chainId:config.chainId};
}
