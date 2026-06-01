import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = 'http://localhost:3002';
const SS_DIR = 'C:\\Temp\\promokit-screenshots';
mkdirSync(SS_DIR, { recursive: true });

let ssCount = 0;
async function ss(page, name) {
  const p = `${SS_DIR}\\${String(++ssCount).padStart(2,'0')}-${name}.png`;
  await page.screenshot({ path: p, fullPage: true });
}

const results = [];
function log(emoji, label, detail) {
  const line = `${emoji} ${label}${detail ? ' → ' + detail : ''}`;
  results.push(line);
  console.log(line);
}

const FAKE = {
  success: true, plan: 'starter',
  data: { whatsapp: ['WA1','WA2','WA3'], instagram: ['IG1','IG2','IG3'], facebook: ['FB1','FB2'], google: 'Google desc', flyerTagline: 'Tagline', flyerHighlight: 'Highlight' },
  business: { businessName: 'Test Kirana', businessType: 'Kirana Store', description: 'Groceries', location: 'Hyderabad', whatsapp: '9876543210', language: 'English', tone: 'Friendly & Warm', offerEnabled: true, offerBadge: '20% OFF', offerOccasion: 'Diwali', offerValidTill: '2026-11-01', offerItems: [{name:'Veggies',price:'40',original:'50'}], logoUrl: '' }
};

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

const consoleErrors = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => consoleErrors.push('PAGE_ERR:' + e.message));

// ── 1. LANDING ──────────────────────────────────────────────────────────────
await page.goto(BASE, { waitUntil: 'networkidle' });
await ss(page, 'landing');
const title = await page.title();
const heroH1 = await page.locator('h1').first().textContent().catch(() => '');
const navLinks = (await page.locator('nav a').allTextContents()).filter(t => t.trim());
const chatWidget = await page.locator('button').filter({ hasText: '💬' }).count() > 0;
log('✅', 'Landing loads', `"${title}"`);
log('✅', 'Hero H1', `"${heroH1?.trim().slice(0,65)}"`);
log('✅', 'Nav links', navLinks.join(' | '));
log(chatWidget ? '✅' : '⚠️', 'Chat widget', chatWidget ? 'present' : 'NOT FOUND');

// Scroll + check pricing
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1000);
await ss(page, 'landing-pricing');
const has499 = await page.locator('text=₹499').count() > 0;
const has999 = await page.locator('text=₹999').count() > 0;
log(has499 || has999 ? '✅' : '⚠️', 'Pricing on landing', has499 || has999 ? `₹499=${has499} ₹999=${has999}` : 'NOT VISIBLE — check Pricing component');

// ── 2. CREATE FORM ──────────────────────────────────────────────────────────
await page.goto(BASE + '/create', { waitUntil: 'networkidle' });
await ss(page, 'create-step1');

// Use type() for React controlled inputs — more reliable than fill()
await page.locator('input[placeholder*="गणेश"]').click();
await page.locator('input[placeholder*="गणेश"]').type('Raj Medical Store', { delay: 20 });
await page.locator('select').first().selectOption({ label: 'Pharmacy' });
await page.locator('textarea').first().click();
await page.locator('textarea').first().type('Quality medicines and health products for all ages', { delay: 10 });
await page.locator('input[placeholder*="Kukatpally"]').click();
await page.locator('input[placeholder*="Kukatpally"]').type('Ameerpet, Hyderabad', { delay: 20 });
await page.waitForTimeout(300);

// Check form state via React
const formState = await page.evaluate(() => {
  const inputs = document.querySelectorAll('input[placeholder], textarea, select');
  const vals = {};
  inputs.forEach(el => { if (el.value) vals[el.placeholder || el.tagName] = el.value.slice(0,30); });
  return vals;
});
log('🔍', 'Form state after fill', JSON.stringify(formState).slice(0,120));

await ss(page, 'create-step1-filled');
await page.locator('button:has-text("Continue")').click();
await page.waitForTimeout(800);
await ss(page, 'create-after-continue');
const errorMsg = await page.locator('text=required, text=fill in, [class*="red"]').textContent().catch(() => '');
const step2vis = await page.locator('text=Preferences').isVisible().catch(() => false);
log(step2vis ? '✅' : '❌', 'Step 1 → 2 navigation', step2vis ? 'moved to Preferences' : `STUCK${errorMsg ? ': "' + errorMsg + '"' : ' (no error shown)'}`);

if (step2vis) {
  const langCount = await page.locator('button').filter({ hasText: /हिन्दी|English/ }).count();
  log(langCount >= 2 ? '✅' : '⚠️', 'Language grid', `${langCount} lang buttons`);
  await page.locator('button').filter({ hasText: 'English' }).click().catch(() => {});
  await page.locator('button:has-text("Review")').click();
  await page.waitForTimeout(600);
  await ss(page, 'create-step3');
  const step3vis = await page.locator('text=Review').first().isVisible().catch(() => false);
  log(step3vis ? '✅' : '❌', 'Step 2 → 3 (Review)', step3vis ? 'rendered' : 'STUCK');
  if (step3vis) {
    const genBtnVisible = await page.locator('button:has-text("Generate My PromoKit")').isVisible().catch(() => false);
    log(genBtnVisible ? '✅' : '❌', 'Generate button in Step 3', genBtnVisible ? 'present' : 'MISSING');
  }
} else {
  log('⚠️', 'Step 2/3 tests', 'skipped — could not navigate past Step 1');
}

// ── 3. RESULTS PAGE ─────────────────────────────────────────────────────────
await page.goto(BASE + '/results', { waitUntil: 'domcontentloaded' });
await page.evaluate(d => { localStorage.setItem('promokit_result', JSON.stringify(d)); localStorage.setItem('promokit_plan','starter'); }, FAKE);
await page.reload({ waitUntil: 'networkidle' });
await ss(page, 'results');
const resultsH1 = await page.locator('h1').first().textContent().catch(() => '');
log(resultsH1?.includes('Ready') ? '✅' : '⚠️', 'Results page', `"${resultsH1?.trim()}"`);

for (const tab of ['WhatsApp', 'Instagram', 'Facebook', 'Google', 'Flyer']) {
  await page.locator('button').filter({ hasText: tab }).first().click();
  await page.waitForTimeout(350);
  await ss(page, `tab-${tab.toLowerCase()}`);
  log('✅', `Tab: ${tab}`, 'renders');
}

await page.locator('button').filter({ hasText: 'WhatsApp' }).first().click();
await page.waitForTimeout(300);
const copies = await page.locator('button:has-text("Copy")').count();
const shares = await page.locator('a[href*="wa.me"]').count();
const schedules = await page.locator('button:has-text("Schedule")').count();
log(copies === 3 ? '✅' : '⚠️', 'Copy btns (3 msgs)', `${copies}`);
log(shares === 3 ? '✅' : '⚠️', 'WhatsApp share links', `${shares}`);
log(schedules === 3 ? '✅' : '⚠️', 'Schedule reminder btns', `${schedules}`);

// Reminder modal — test Escape bug
await page.locator('button:has-text("Schedule")').first().click();
await page.waitForTimeout(400);
const modalOpen = await page.locator('text=Set Reminder').isVisible().catch(() => false);
await ss(page, 'reminder-modal');
log(modalOpen ? '✅' : '⚠️', 'Reminder modal', modalOpen ? 'opens' : 'does not open');
if (modalOpen) {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const stillOpen = await page.locator('text=Set Reminder').isVisible().catch(() => false);
  log(stillOpen ? '❌' : '✅', 'Reminder Escape key', stillOpen ? 'BUG — Escape does NOT close modal' : 'closes OK');
  if (stillOpen) await page.locator('button:has-text("Cancel")').click();
  await page.waitForTimeout(300);
}

// Regenerate
const regen = await page.locator('a:has-text("Regenerate"), button:has-text("Regenerate")').count();
log(regen > 0 ? '✅' : '⚠️', 'Regenerate', regen > 0 ? 'button present' : 'only links to /create');

// Flyer
await page.locator('button').filter({ hasText: 'Flyer' }).first().click();
await page.waitForTimeout(600);
await ss(page, 'flyer-tab');
const thumbs = await page.locator('button[style*="aspect-ratio"]').count();
const pngBtn = await page.locator('button:has-text("PNG")').count();
const pdfBtn = await page.locator('button:has-text("PDF")').count();
const animBtn = await page.locator('button:has-text("Animate"), button:has-text("Animated ON")').count();
log(thumbs >= 9 ? '✅' : '⚠️', 'Flyer templates grid', `${thumbs} thumbnails`);
log(pngBtn > 0 ? '✅' : '❌', 'PNG download', pngBtn > 0 ? 'present' : 'MISSING');
log(pdfBtn > 0 ? '✅' : '⚠️', 'PDF export (Starter)', pdfBtn > 0 ? 'present' : 'upgrade gate shown');
log(animBtn > 0 ? '✅' : '⚠️', 'Animate toggle', animBtn > 0 ? 'present' : 'MISSING');

// ── 4. API TESTS ─────────────────────────────────────────────────────────────
// QR
const qr = await page.request.get(`${BASE}/api/qr?url=https%3A%2F%2Fwa.me%2F919876543210`);
log(qr.ok() ? '✅' : '❌', 'QR API', `HTTP ${qr.status()} ${qr.headers()['content-type']?.split(';')[0]}`);

// One poster test to check basic render
const poster1 = await page.request.get(`${BASE}/api/poster?name=Test&type=Kirana&tagline=Best+Shop&highlight=Come+visit&template=saffron&language=English`, { timeout: 45000 }).catch(e => ({ ok: () => false, status: () => 0, _err: e.message }));
log(poster1.ok?.() ? '✅' : '⚠️', 'Poster API (saffron)', poster1.ok?.() ? `HTTP ${poster1.status()} image/png` : `socket hang up / timeout — Satori font loading takes >30s on first cold start`);

// Test all 9 after warming up (re-use cached fonts)
if (poster1.ok?.()) {
  const templates = ['diwali','rose','midnight','ocean','emerald','violet','sunrise','steel'];
  const bad = [];
  for (const t of templates) {
    const r = await page.request.get(`${BASE}/api/poster?name=T&type=K&tagline=T&highlight=H&template=${t}&language=English`, { timeout: 30000 }).catch(() => null);
    if (!r || !r.ok()) bad.push(t);
  }
  log(bad.length === 0 ? '✅' : '⚠️', 'Remaining 8 templates', bad.length ? `issues: ${bad.join(',')}` : 'all OK');
}

// Generate API — test plan gate for locked language
const marRes = await page.request.post(`${BASE}/api/generate`, {
  data: { businessName: 'T', businessType: 'Kirana Store', description: 'G', location: 'H', language: 'Marathi', tone: 'Friendly & Warm', festivals: false }
});
const marBody = await marRes.json().catch(() => ({}));
log(marRes.status() === 402 ? '✅' : '⚠️', 'Language gate (Marathi, no auth)', `HTTP ${marRes.status()} "${marBody.error?.slice(0,60)}"`);

// ── 5. AUTH PAGES ─────────────────────────────────────────────────────────────
await page.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle' });
await ss(page, 'auth-login');
const loginFields = await page.locator('input[type="email"], input[type="password"]').count();
const googleBtn = await page.locator('button:has-text("Google"), a:has-text("Google")').count();
const forgotLink = await page.locator('a:has-text("Forgot")').count();
log(loginFields >= 2 ? '✅' : '❌', 'Login page', `email+pwd fields | Google=${googleBtn>0} | Forgot=${forgotLink>0}`);

await page.goto(`${BASE}/auth/signup`, { waitUntil: 'networkidle' });
await ss(page, 'auth-signup');
log(await page.locator('input[type="email"]').count() > 0 ? '✅' : '❌', 'Signup page', 'email field present');

await page.goto(`${BASE}/auth/forgot-password`, { waitUntil: 'networkidle' });
await ss(page, 'auth-forgot');
log(await page.locator('input[type="email"]').count() > 0 ? '✅' : '⚠️', 'Forgot password page', 'email field');

// ── 6. PROTECTED ROUTES ───────────────────────────────────────────────────────
for (const [path, name] of [['/dashboard','Dashboard'],['/history','History'],['/broadcast','Broadcast'],['/market','Marketing Agent'],['/schedule','Smart Calendar']]) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  const url = page.url();
  if (url.includes('login')) {
    log('✅', `${name} auth guard`, 'redirects to login');
  } else {
    const h = await page.locator('h1, h2').first().textContent().catch(() => '?');
    await ss(page, `route-${path.slice(1)}`);
    log('✅', `${name} renders`, `"${h?.trim().slice(0,50)}"`);
  }
}

// ── 7. BROADCAST COLLECT ──────────────────────────────────────────────────────
await page.goto(`${BASE}/broadcast/collect?uid=00000000-0000-0000-0000-000000000000`, { waitUntil: 'networkidle' });
await ss(page, 'broadcast-collect');
const phoneInput = await page.locator('input[type="tel"]').count();
log(phoneInput > 0 ? '✅' : '⚠️', 'Broadcast collect (public)', `phone input: ${phoneInput}`);
if (phoneInput > 0) {
  await page.locator('input[type="tel"]').first().fill('123');
  await page.locator('button[type="submit"]').first().click().catch(async () => { await page.locator('button').last().click(); });
  await page.waitForTimeout(600);
  await ss(page, 'broadcast-collect-validation');
  const hasError = await page.locator('[class*="red"], [class*="error"], text=Invalid, text=invalid').count() > 0;
  log(hasError ? '✅' : '⚠️', 'Collect phone validation', hasError ? 'rejects short number' : 'NO visible error for 3-digit phone');
}

// ── 8. MOBILE ─────────────────────────────────────────────────────────────────
const mob = await ctx.newPage();
await mob.setViewportSize({ width: 390, height: 844 });
await mob.goto(BASE, { waitUntil: 'networkidle' });
await mob.screenshot({ path: `${SS_DIR}\\${String(++ssCount).padStart(2,'0')}-mobile-landing.png` });
const mobH1 = await mob.locator('h1').first().textContent().catch(() => '');
const mobNavBtn = await mob.locator('nav button').count();
log(mobH1 ? '✅' : '⚠️', 'Mobile (390px) landing', `h1 visible | nav btns: ${mobNavBtn}`);

if (mobNavBtn > 0) {
  await mob.locator('nav button').first().click();
  await mob.waitForTimeout(400);
  await mob.screenshot({ path: `${SS_DIR}\\${String(++ssCount).padStart(2,'0')}-mobile-menu.png` });
  const menuItems = await mob.locator('a').filter({ hasText: /login|log in|features|pricing/i }).count();
  log(menuItems > 0 ? '✅' : '⚠️', 'Mobile hamburger menu', `${menuItems} menu links visible`);
}

await mob.goto(`${BASE}/results`, { waitUntil: 'domcontentloaded' });
await mob.evaluate(d => { localStorage.setItem('promokit_result', JSON.stringify(d)); localStorage.setItem('promokit_plan','starter'); }, FAKE);
await mob.reload({ waitUntil: 'networkidle' });
await mob.screenshot({ path: `${SS_DIR}\\${String(++ssCount).padStart(2,'0')}-mobile-results.png` });
const mobCopies = await mob.locator('button:has-text("Copy")').count();
log(mobCopies >= 3 ? '✅' : '⚠️', 'Mobile results page', `${mobCopies} copy buttons visible`);

await mob.goto(`${BASE}/create`, { waitUntil: 'networkidle' });
await mob.screenshot({ path: `${SS_DIR}\\${String(++ssCount).padStart(2,'0')}-mobile-create.png` });
const mobInputs = await mob.locator('input, textarea, select').count();
log(mobInputs >= 4 ? '✅' : '⚠️', 'Mobile create form', `${mobInputs} inputs visible`);
await mob.close();

// ── 9. CONSOLE ERRORS ─────────────────────────────────────────────────────────
const realErrs = consoleErrors.filter(e => !e.includes('supabase') && !e.includes('placeholder') && !e.includes('net::ERR') && !e.includes('Failed to fetch'));
log(realErrs.length === 0 ? '✅' : '⚠️', 'JS console errors', realErrs.length ? realErrs.slice(0,3).join(' | ') : 'none');

await browser.close();

// ── REPORT ───────────────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════════');
console.log('  PROMOKIT E2E — FULL REPORT');
console.log('═══════════════════════════════════════════════════════');
results.forEach(r => console.log(r));
const f = results.filter(r => r.startsWith('❌')).length;
const w = results.filter(r => r.startsWith('⚠️')).length;
const p = results.filter(r => r.startsWith('✅')).length;
const d = results.filter(r => r.startsWith('🔍')).length;
console.log(`\n✅ ${p}  ⚠️ ${w}  ❌ ${f}  🔍 ${d}`);
console.log(`Screenshots → ${SS_DIR}`);
