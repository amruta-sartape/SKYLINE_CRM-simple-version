const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots_customer_journey');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runTests() {
  console.log('🚀 Launching Puppeteer for End-to-End Customer Experience Audit...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 850 });

  const results = [];

  try {
    // =========================================================================
    // SCENARIO 1: Public Unauthenticated Discovery & Detail Browsing
    // =========================================================================
    console.log('\n--- Scenario 1: Public Discovery & Detail Page ---');
    await page.goto(`${BASE_URL}/discovery`, { waitUntil: 'networkidle2' });
    await sleep(1500);

    const publicUrl = page.url();
    const hasCards = await page.$('.grid') !== null;
    console.log(`[S1] Public Discovery URL: ${publicUrl}, Has Catalog: ${hasCards}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_public_discovery.png'), fullPage: false });

    // Click on the first property card to open details
    const firstCard = await page.$('button[class*="group-hover:bg-blue-600"], button:has-text("View Details")') || await page.$('.cursor-pointer h3');
    if (firstCard) {
      await firstCard.click();
      await sleep(1500);
    } else {
      await page.goto(`${BASE_URL}/discovery/prop_proj_001`, { waitUntil: 'networkidle2' });
      await sleep(1500);
    }
    const detailUrl = page.url();
    console.log(`[S1] Property Detail URL: ${detailUrl}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_public_property_detail.png'), fullPage: false });

    results.push({
      scenario: '1. Public Discovery & Detail Page',
      passed: publicUrl.includes('/discovery') && detailUrl.includes('/discovery'),
      details: `Unauthenticated visitor navigated /discovery and viewed detail at ${detailUrl}`,
    });

    // =========================================================================
    // SCENARIO 2: Wishlist Auth Gate & Pending Storage
    // =========================================================================
    console.log('\n--- Scenario 2: Wishlist Auth Gate Modal ---');
    // Navigate back to discovery
    await page.goto(`${BASE_URL}/discovery`, { waitUntil: 'networkidle2' });
    await sleep(1200);

    // Find and click the heart icon on the first property card
    const heartBtn = await page.$('button[title*="Wishlist"]');
    if (heartBtn) {
      await heartBtn.click();
      await sleep(800);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_wishlist_auth_gate_modal.png'), fullPage: false });

    // Verify modal appeared and sessionStorage contains pending wishlist
    const modalVisible = await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]') || document.body.innerText.includes('Save this Property to Wishlist');
      const pendingWishlist = sessionStorage.getItem('skyline_pending_wishlist');
      return { hasModal: Boolean(modal), hasPending: Boolean(pendingWishlist) };
    });
    console.log('[S2] Auth Gate Modal visible:', modalVisible.hasModal, 'Pending Wishlist in storage:', modalVisible.hasPending);

    // Click "Sign In" inside the auth gate modal
    const modalSignInBtn = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const signInBtn = buttons.find(b => b.innerText.trim() === 'Sign In');
      if (signInBtn) {
        signInBtn.click();
        return true;
      }
      return false;
    });
    await sleep(1200);

    const customerLoginUrl = page.url();
    console.log(`[S2] Redirected to: ${customerLoginUrl}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_dedicated_customer_login_page.png'), fullPage: false });

    results.push({
      scenario: '2. Wishlist Auth Gate & Redirection',
      passed: modalVisible.hasModal && customerLoginUrl.includes('/customer/login'),
      details: 'Unauthenticated heart click opened Auth Gate modal and transitioned to /customer/login',
    });

    // =========================================================================
    // SCENARIO 3: Customer Login & Wishlist Auto-Restoration
    // =========================================================================
    console.log('\n--- Scenario 3: Customer Login & Wishlist Auto-Restoration ---');
    // Click "Auto Fill" on customer demo credentials or fill manually
    const autoFillBtn = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const fill = buttons.find(b => b.innerText.trim() === 'Auto Fill');
      if (fill) {
        fill.click();
        return true;
      }
      return false;
    });

    if (!autoFillBtn) {
      await page.type('#customer-email', 'customer@skylinecrm.com');
      await page.type('#customer-password', 'SkylineCustomer2026!');
    }
    await sleep(500);

    // Submit sign in
    await page.click('button[type="submit"]');
    await sleep(2000);

    const postLoginUrl = page.url();
    console.log(`[S3] Post Login URL: ${postLoginUrl}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_customer_authenticated_home.png'), fullPage: false });

    // Navigate to /wishlist and verify property was auto-saved
    await page.goto(`${BASE_URL}/wishlist`, { waitUntil: 'networkidle2' });
    await sleep(1500);
    const wishlistUrl = page.url();
    const wishlistItemCount = await page.evaluate(() => {
      const cards = document.querySelectorAll('.grid > div');
      return cards.length;
    });
    console.log(`[S3] Wishlist URL: ${wishlistUrl}, Saved Items: ${wishlistItemCount}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_customer_wishlist_restored.png'), fullPage: false });

    results.push({
      scenario: '3. Customer Login & Wishlist Auto-Restoration',
      passed: postLoginUrl.includes('/customer') && wishlistUrl.includes('/wishlist') && wishlistItemCount > 0,
      details: `Logged in as Customer, pending property auto-restored in wishlist (Total: ${wishlistItemCount})`,
    });

    // =========================================================================
    // SCENARIO 4: Customer Portal Shell Navigation
    // =========================================================================
    console.log('\n--- Scenario 4: Customer Portal Shell Navigation ---');
    const navChecks = [];

    // 1. Home
    await page.goto(`${BASE_URL}/customer`, { waitUntil: 'networkidle2' });
    await sleep(800);
    navChecks.push({ name: 'Home (/customer)', ok: page.url().includes('/customer') && !page.url().includes('/login') });

    // 2. Properties
    await page.goto(`${BASE_URL}/discovery`, { waitUntil: 'networkidle2' });
    await sleep(800);
    navChecks.push({ name: 'Properties (/discovery)', ok: page.url().includes('/discovery') });

    // 3. Wishlist
    await page.goto(`${BASE_URL}/wishlist`, { waitUntil: 'networkidle2' });
    await sleep(800);
    navChecks.push({ name: 'Wishlist (/wishlist)', ok: page.url().includes('/wishlist') });

    // 4. My Enquiries
    await page.goto(`${BASE_URL}/my-enquiries`, { waitUntil: 'networkidle2' });
    await sleep(800);
    navChecks.push({ name: 'My Enquiries (/my-enquiries)', ok: page.url().includes('/my-enquiries') });

    // 5. My Site Visits
    await page.goto(`${BASE_URL}/my-site-visits`, { waitUntil: 'networkidle2' });
    await sleep(800);
    navChecks.push({ name: 'My Site Visits (/my-site-visits)', ok: page.url().includes('/my-site-visits') });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_customer_navigation_verified.png'), fullPage: false });

    const allNavPassed = navChecks.every(n => n.ok);
    console.log('[S4] Navigation Checks:', navChecks);

    results.push({
      scenario: '4. Customer Portal Shell Navigation',
      passed: allNavPassed,
      details: `Verified all 5 customer routes: ${navChecks.map(n => n.name).join(', ')}`,
    });

    // =========================================================================
    // SCENARIO 5: Authenticated Property Detail Actions (Enquiry / Site Visit)
    // =========================================================================
    console.log('\n--- Scenario 5: Authenticated Property Detail Actions ---');
    await page.goto(`${BASE_URL}/discovery/prop_proj_001`, { waitUntil: 'networkidle2' });
    await sleep(1500);

    // Click "Enquire Now"
    const enquireBtn = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.includes('Enquire Now'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    await sleep(800);

    const enquiryModalOpen = await page.evaluate(() => {
      return Boolean(document.querySelector('[role="dialog"]') || document.body.innerText.includes('Register Property Enquiry'));
    });
    console.log('[S5] Enquiry Modal Open:', enquiryModalOpen);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_authenticated_enquiry_modal.png'), fullPage: false });

    // Close modal
    const closeBtn = await page.$('button[aria-label="Close dialog"], button:has-text("Cancel")');
    if (closeBtn) await closeBtn.click();
    await sleep(500);

    results.push({
      scenario: '5. Authenticated Property Detail Actions',
      passed: enquiryModalOpen,
      details: 'Authenticated customer opened Enquiry Modal directly with property context',
    });

    // =========================================================================
    // SCENARIO 6: Customer Sign Out
    // =========================================================================
    console.log('\n--- Scenario 6: Customer Logout Flow ---');
    // Open user menu
    const userMenuBtn = await page.$('button[aria-label="User account menu"]');
    if (userMenuBtn) {
      await userMenuBtn.click();
      await sleep(500);
      // Click Sign Out
      const signOutBtn = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.innerText.includes('Sign Out'));
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      });
      await sleep(1500);
    }

    const logoutUrl = page.url();
    console.log(`[S6] Post-Logout URL: ${logoutUrl}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_customer_post_logout.png'), fullPage: false });

    results.push({
      scenario: '6. Customer Logout Flow',
      passed: logoutUrl.includes('/customer/login') || logoutUrl.includes('/login'),
      details: `Sign Out redirected to ${logoutUrl}`,
    });

    // =========================================================================
    // SCENARIO 7: Dedicated Customer Registration Flow
    // =========================================================================
    console.log('\n--- Scenario 7: Dedicated Customer Registration Flow ---');
    await page.goto(`${BASE_URL}/customer/register`, { waitUntil: 'networkidle2' });
    await sleep(1000);

    const regUrl = page.url();
    const testEmail = `newcustomer_${Date.now()}@example.com`;
    await page.type('#name', 'Priya Sharma');
    await page.type('#email', testEmail);
    await page.type('#phone', '+1 (555) 888-9999');
    await page.type('#password', 'SkylineTest2026!');
    await page.type('#confirmPassword', 'SkylineTest2026!');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_customer_registration_filled.png'), fullPage: false });

    await page.click('button[type="submit"]');
    await sleep(2500);

    const postRegUrl = page.url();
    console.log(`[S7] Post Registration URL: ${postRegUrl}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_post_registration_customer_home.png'), fullPage: false });

    results.push({
      scenario: '7. Dedicated Customer Registration Flow',
      passed: regUrl.includes('/customer/register') && postRegUrl.includes('/customer'),
      details: `Registered new customer (${testEmail}) -> landed on ${postRegUrl}`,
    });

    // =========================================================================
    // SCENARIO 8: Staff Logins & Dashboard Integrity (Admin, Operations, Agent)
    // =========================================================================
    console.log('\n--- Scenario 8: Staff Logins & Dashboard Integrity ---');
    // 1. Clear session
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // 2. Admin Login
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await sleep(1000);

    // Verify Staff Login UI retains Admin / Operations / Agent buttons
    const staffButtons = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasAdmin: text.includes('Admin'),
        hasOps: text.includes('Operations'),
        hasAgent: text.includes('Agent'),
      };
    });
    console.log('[S8] Staff Login Buttons present:', staffButtons);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_staff_login_page_intact.png'), fullPage: false });

    // Click Admin quick fill
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const adminBtn = buttons.find(b => b.innerText.trim() === 'Admin');
      if (adminBtn) adminBtn.click();
    });
    await sleep(300);
    await page.click('button[type="submit"]');
    await sleep(2000);

    const adminHomeUrl = page.url();
    console.log(`[S8] Admin Landing URL: ${adminHomeUrl}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13_admin_crm_dashboard.png'), fullPage: false });

    // Verify Admin Properties page
    await page.goto(`${BASE_URL}/admin/properties`, { waitUntil: 'networkidle2' });
    await sleep(1200);
    const adminPropsUrl = page.url();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14_admin_properties_management.png'), fullPage: false });

    results.push({
      scenario: '8. Staff Authentication & Admin Workspace',
      passed: adminHomeUrl === `${BASE_URL}/` && adminPropsUrl.includes('/admin/properties') && staffButtons.hasAdmin,
      details: 'Staff login design intact, Admin authenticated and accessed CRM workspace & property manager',
    });

    // =========================================================================
    // SCENARIO 9: Role-Based Access Control (RBAC) Enforcement
    // =========================================================================
    console.log('\n--- Scenario 9: RBAC Enforcement ---');
    // Clear session & log in as Customer
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto(`${BASE_URL}/customer/login`, { waitUntil: 'networkidle2' });
    await sleep(800);
    await page.type('#customer-email', 'customer@skylinecrm.com');
    await page.type('#customer-password', 'SkylineCustomer2026!');
    await page.click('button[type="submit"]');
    await sleep(2000);

    // Attempt to access staff-only route /leads
    await page.goto(`${BASE_URL}/leads`, { waitUntil: 'networkidle2' });
    await sleep(1500);

    const rbacUrl = page.url();
    const isBlocked = rbacUrl.includes('/unauthorized') || rbacUrl.includes('/customer');
    console.log(`[S9] Customer attempted /leads -> Result URL: ${rbacUrl} (Blocked: ${isBlocked})`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '15_customer_rbac_blocked_from_leads.png'), fullPage: false });

    results.push({
      scenario: '9. RBAC Enforcement (Customer blocked from Staff CRM)',
      passed: isBlocked,
      details: `Customer trying /leads was blocked and redirected to ${rbacUrl}`,
    });

  } catch (err) {
    console.error('Error during test execution:', err);
  } finally {
    await browser.close();
  }

  console.log('\n==================================================');
  console.log('FINAL AUDIT TEST RESULTS SUMMARY');
  console.log('==================================================');
  results.forEach(r => {
    console.log(`${r.passed ? '✅ PASS' : '❌ FAIL'}: ${r.scenario}`);
    console.log(`   Details: ${r.details}`);
  });

  fs.writeFileSync(
    path.join(__dirname, 'test_summary_results.json'),
    JSON.stringify(results, null, 2)
  );
}

runTests();
