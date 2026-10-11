const STORAGE_KEY = 'pocket-finance-profile-v1';
const INVESTMENTS = [
  { id: 'cash', name: 'Savings / cash', defaults: [4, 4, 4, 4] },
  { id: 'rsu', name: 'RSUs', defaults: [10, 9, 8, 7] },
  { id: 'largeCap', name: 'Large cap', defaults: [10, 9, 8, 7], historicalAverage: 15.33, historicalLabel: 'Nifty 50 TR rolling 5-year mean, 1999–2024', historicalSource: 'https://www.niftyindices.com/docs/default-source/indices/nifty-50/nifty-50-whitepaper-2024.pdf?sfvrsn=1cd6e35_4' },
  { id: 'midCap', name: 'Mid cap', defaults: [11, 9, 8, 7], historicalAverage: 14.4, historicalLabel: 'Nifty Midcap 150 rolling 5-year mean, through Aug 2021', historicalSource: 'https://www.niftyindices.com/docs/default-source/indices/nifty-midcap-150/nifty-midcap-150-whitepaper_2021.pdf?sfvrsn=15d66e35_4' },
  { id: 'smallCap', name: 'Small cap', defaults: [12, 9, 8, 7] },
  { id: 'flexiCap', name: 'Flexi cap', defaults: [10, 9, 8, 7] },
  { id: 'nps', name: 'NPS', defaults: [8, 7.5, 7, 6.5] },
  { id: 'epf', name: 'EPF', defaults: [8.25, 7, 7, 7] },
  { id: 'ppf', name: 'PPF', defaults: [7.1, 7, 7, 7] },
  { id: 'fd', name: 'Fixed deposit', defaults: [6.5, 6, 6, 6] },
  { id: 'other', name: 'Other investments', defaults: [7, 7, 7, 7] }
];
const DEPENDENT_EXPENSES = {
  Child: [
    { id: 'primaryCare', label: 'Primary care (ages 0–5)', fromAge: 0, toAge: 5, defaultMonthly: 10000 },
    { id: 'primaryEducation', label: 'Primary education (ages 6–10)', fromAge: 6, toAge: 10, defaultMonthly: 15000 },
    { id: 'secondaryEducation', label: 'Secondary education (ages 11–17)', fromAge: 11, toAge: 17, defaultMonthly: 22000 },
    { id: 'bachelors', label: 'Bachelor’s degree (ages 18–21)', fromAge: 18, toAge: 21, defaultMonthly: 35000 },
    { id: 'masters', label: 'Master’s degree (ages 22–24)', fromAge: 22, toAge: 24, defaultMonthly: 40000 },
    { id: 'marriage', label: 'Marriage fund (monthly saving, age 25+)', fromAge: 25, toAge: 120, defaultMonthly: 0 }
  ],
  Parent: [
    { id: 'household', label: 'Living support' }, { id: 'medical', label: 'Medical expenses' },
    { id: 'insurance', label: 'Insurance and care' }, { id: 'transport', label: 'Transport' }, { id: 'other', label: 'Other costs' }
  ],
  Sibling: [
    { id: 'education', label: 'Education' }, { id: 'household', label: 'Living support' },
    { id: 'healthcare', label: 'Healthcare' }, { id: 'transport', label: 'Transport' }, { id: 'other', label: 'Other costs' }
  ],
  Other: [
    { id: 'household', label: 'Living support' }, { id: 'education', label: 'Education or training' },
    { id: 'healthcare', label: 'Healthcare' }, { id: 'transport', label: 'Transport' }, { id: 'other', label: 'Other costs' }
  ]
};
const DEPENDENT_RELATIONS = Object.keys(DEPENDENT_EXPENSES);
const HOUSEHOLD_EXPENSES = [
  { id: 'rent', label: 'Rent / mortgage' }, { id: 'maintenance', label: 'Building or society maintenance' }, { id: 'propertyTax', label: 'Property tax' },
  { id: 'electricity', label: 'Electricity' }, { id: 'water', label: 'Water and sewerage' }, { id: 'gas', label: 'Cooking gas' },
  { id: 'groceries', label: 'Groceries and household food' }, { id: 'dining', label: 'Restaurants and cafes' }, { id: 'delivery', label: 'Food delivery / takeaway' },
  { id: 'fuel', label: 'Fuel' }, { id: 'publicTransport', label: 'Public transport' }, { id: 'rideHailing', label: 'Taxi / ride-hailing' },
  { id: 'vehiclePayment', label: 'Vehicle lease / payment' }, { id: 'vehicleMaintenance', label: 'Vehicle service, repairs and parking' }, { id: 'tolls', label: 'Tolls and road charges' },
  { id: 'healthcare', label: 'Doctor, medicines and healthcare' }, { id: 'insurance', label: 'Health and life insurance' }, { id: 'internet', label: 'Internet / broadband' },
  { id: 'mobile', label: 'Mobile phone plans' }, { id: 'subscriptions', label: 'Streaming and digital subscriptions' }, { id: 'clothing', label: 'Clothing and footwear' },
  { id: 'personalCare', label: 'Personal care and grooming' }, { id: 'householdSupplies', label: 'Cleaning and household supplies' }, { id: 'domesticHelp', label: 'Domestic help / cleaning' },
  { id: 'childcare', label: 'Childcare and babysitting' }, { id: 'education', label: 'Education, books and courses' }, { id: 'pets', label: 'Pet food and care' },
  { id: 'travel', label: 'Travel and holidays (monthly average)' }, { id: 'gifts', label: 'Gifts and donations' }, { id: 'entertainment', label: 'Entertainment and recreation' },
  { id: 'other', label: 'Other regular expenses' }
];
const DEPENDENT_END_AGE = { Child: 25, Parent: 120, Sibling: 25, Other: 120 };
const MARITAL_STATUSES = ['Single', 'Married', 'Partnered', 'Divorced', 'Widowed'];
let currencyCode = 'INR';
let currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: currencyCode, maximumFractionDigits: 0 });
let currencySymbol = '₹';
const SETTINGS_KEY = 'pocket-finance-settings-v1';
let appSettings = { profileName: 'My finances', currency: 'INR', horizon: 20, theme: 'light' };
let financialChart;
let cashFlowSummaryChart;
let cashFlowMixChart;
let chartLoadStarted = false;

function loadAppSettings() {
  try { appSettings = { ...appSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') }; } catch (error) { console.warn('Display settings could not be read.', error); }
  if (!['INR', 'USD', 'EUR', 'GBP'].includes(appSettings.currency)) appSettings.currency = 'INR';
  if (![5, 10, 15, 20, 25].includes(Number(appSettings.horizon))) appSettings.horizon = 20;
  if (!['light', 'dark'].includes(appSettings.theme)) appSettings.theme = 'light';
  if (typeof appSettings.profileName !== 'string') appSettings.profileName = 'My finances';
  currencyCode = ['INR', 'USD', 'EUR', 'GBP'].includes(appSettings.currency) ? appSettings.currency : 'INR';
  const locale = currencyCode === 'INR' ? 'en-IN' : 'en-US';
  currency = new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode, maximumFractionDigits: 0 });
  currencySymbol = ({ INR: String.fromCharCode(8377), USD: '$', EUR: String.fromCharCode(8364), GBP: String.fromCharCode(163) })[currencyCode];
  document.querySelectorAll('.currency-input > span:first-child').forEach(symbol => { symbol.textContent = currencySymbol; });
  document.body.dataset.theme = appSettings.theme === 'dark' ? 'dark' : 'light';
}

function buildProfileTools() {
  const tools = document.createElement('div');
  tools.innerHTML = `<section class="panel risk-panel" id="risk-assessment"><div class="panel-heading"><div><p class="eyebrow">PORTFOLIO MIX</p><h2>Risk snapshot</h2></div><span class="horizon-badge">Allocation based</span></div><p class="panel-description">An indicative score based on the mix of balances entered; it does not assess personal risk tolerance.</p><div id="risk-summary" class="risk-summary"><p class="education-empty">Add investment balances to see a portfolio mix snapshot.</p></div></section>
    <details class="panel settings-panel" id="profile-settings"><summary><span><strong>Profile & display settings</strong><small>Manage this browser profile, currency, projection horizon, and color theme.</small></span><span class="settings-toggle">Edit settings</span></summary><div class="settings-grid"><label class="field"><span>Profile name</span><div class="input-wrap"><input id="profile-name" maxlength="40"></div></label><label class="field"><span>Currency format</span><div class="input-wrap"><select id="currency-setting"><option value="INR">Indian rupee (INR)</option><option value="USD">US dollar (USD)</option><option value="EUR">Euro (EUR)</option><option value="GBP">Pound sterling (GBP)</option></select></div><small class="settings-hint">Changes display only; amounts are not converted.</small></label><label class="field"><span>Projection horizon</span><div class="input-wrap"><select id="horizon-setting"><option value="5">5 years</option><option value="10">10 years</option><option value="15">15 years</option><option value="20">20 years</option><option value="25">25 years</option></select></div></label><label class="field"><span>Color theme</span><div class="input-wrap"><select id="theme-setting"><option value="light">Light</option><option value="dark">Dark</option></select></div></label></div><div class="profile-tools"><button type="button" id="export-profile" class="add-loan-button">Download profile backup</button><label class="add-loan-button import-profile">Import backup<input id="import-profile" type="file" accept="application/json,.json"></label><button type="button" id="reset-profile" class="remove-loan-button">Clear this profile</button></div><p id="settings-status" class="settings-status" role="status">Financial data is stored in this browser unless you download a backup.</p></details>`;
  document.querySelector('.content-grid').after(...tools.children);
  document.getElementById('profile-name').value = appSettings.profileName;
  document.getElementById('currency-setting').value = appSettings.currency;
  document.getElementById('horizon-setting').value = String(appSettings.horizon);
  document.getElementById('theme-setting').value = appSettings.theme;
  const saveSettings = () => {
    appSettings = { profileName: document.getElementById('profile-name').value.trim() || 'My finances', currency: document.getElementById('currency-setting').value, horizon: Number(document.getElementById('horizon-setting').value), theme: document.getElementById('theme-setting').value };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(appSettings));
    loadAppSettings();
    document.querySelector('.sidebar-footer strong').textContent = appSettings.profileName;
    document.querySelector('.sidebar-footer .avatar').textContent = appSettings.profileName.slice(0, 1).toUpperCase();
    renderDashboard(loadUserData());
    setText('settings-status', 'Settings saved on this device.');
  };
  ['profile-name', 'currency-setting', 'horizon-setting', 'theme-setting'].forEach(id => document.getElementById(id).addEventListener('change', saveSettings));
  document.getElementById('export-profile').addEventListener('click', () => {
    const profile = loadUserData();
    if (!profile) { setText('settings-status', 'Save your financial profile before downloading a backup.'); return; }
    const backup = { format: 'pocket-finance-backup-v1', profile, settings: appSettings };
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'pocket-finance-backup.json'; link.click(); URL.revokeObjectURL(url);
  });
  document.getElementById('import-profile').addEventListener('change', async event => {
    try {
      const backup = JSON.parse(await event.target.files[0].text());
      if (backup.format !== 'pocket-finance-backup-v1' || !backup.profile || !backup.profile.investments) throw new Error('This file is not a valid Pocket backup.');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(backup.profile));
      if (backup.settings) localStorage.setItem(SETTINGS_KEY, JSON.stringify(backup.settings));
      location.reload();
    } catch (error) { setText('settings-status', error.message || 'Could not import this backup.'); }
  });
  document.getElementById('reset-profile').addEventListener('click', () => {
    if (!confirm('Clear the financial data and display settings saved in this browser? Download a backup first if you may need it.')) return;
    localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(SETTINGS_KEY); location.reload();
  });
}

function dependentMonthlyCostAtAge(dependent, age = Number(dependent.age) || 0) {
  const categories = DEPENDENT_EXPENSES[dependent.relation] || DEPENDENT_EXPENSES.Other;
  if (dependent.relation === 'Child') {
    const stage = categories.find(category => age >= category.fromAge && age <= category.toAge) || categories[0];
    const stageCost = Number(dependent.expenseDetails?.[stage.id]) || 0;
    const marriageSaving = stage.id === 'marriage' ? 0 : Number(dependent.expenseDetails?.marriage) || 0;
    return stageCost + marriageSaving;
  }
  return categories.reduce((sum, category) => sum + (Number(dependent.expenseDetails?.[category.id]) || 0), 0);
}

function loadUserData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== 'object') return null;
    const data = { age: '', maritalStatus: 'Single', spouseAge: null, inflation: '', retirementAge: 60, retirementReduction: 70, retirementEndAge: 90, dependents: [], salary: '', expenses: '', rsuAnnual: 0, investments: {}, loans: [], ...saved };
    data.expenseDetails = data.expenseDetails && typeof data.expenseDetails === 'object'
      ? Object.fromEntries(HOUSEHOLD_EXPENSES.map(item => [item.id, Number(data.expenseDetails[item.id]) || 0]))
      : Object.fromEntries(HOUSEHOLD_EXPENSES.map(item => [item.id, item.id === 'other' ? Number(data.expenses) || 0 : 0]));
    data.expenses = HOUSEHOLD_EXPENSES.reduce((sum, item) => sum + data.expenseDetails[item.id], 0);
    if (!MARITAL_STATUSES.includes(data.maritalStatus)) data.maritalStatus = 'Single';
    data.spouseAge = Number.isFinite(Number(data.spouseAge)) && data.spouseAge !== null && data.spouseAge !== '' ? Number(data.spouseAge) : null;
    if (!Array.isArray(data.dependents)) data.dependents = [];
    data.dependents = data.dependents.map(dependent => {
      const normalized = typeof dependent === 'number' ? { age: dependent } : dependent;
      const legacySpouse = normalized.relation === 'Spouse / partner';
      const relation = legacySpouse ? 'Other' : DEPENDENT_RELATIONS.includes(normalized.relation) ? normalized.relation : 'Child';
      const legacyExpenseDetails = normalized.expenseDetails && typeof normalized.expenseDetails === 'object' ? normalized.expenseDetails : {};
      const wasLegacyChildCosts = relation === 'Child' && !DEPENDENT_EXPENSES.Child.some(category => Object.hasOwn(legacyExpenseDetails, category.id));
      const endAge = Number(normalized.endAge ?? DEPENDENT_END_AGE[relation]);
      const categories = DEPENDENT_EXPENSES[relation];
      const expenseDetails = legacySpouse
        ? { other: Number(normalized.monthlyCost) || Object.values(normalized.expenseDetails || {}).reduce((sum, value) => sum + (Number(value) || 0), 0) }
        : relation === 'Child'
          ? Object.fromEntries(categories.map(category => [category.id,
            wasLegacyChildCosts
              ? category.id === (categories.find(item => (Number(normalized.age) || 0) >= item.fromAge && (Number(normalized.age) || 0) <= item.toAge) || categories[0]).id
                ? Number(normalized.monthlyCost) || Object.values(legacyExpenseDetails).reduce((sum, value) => sum + (Number(value) || 0), 0)
                : category.defaultMonthly
              : Number(legacyExpenseDetails[category.id] ?? category.defaultMonthly) || 0]))
          : normalized.expenseDetails && typeof normalized.expenseDetails === 'object'
            ? normalized.expenseDetails
            : { [categories[categories.length - 1].id]: Number(normalized.monthlyCost) || 0 };
      const monthlyCost = dependentMonthlyCostAtAge({ relation, age: normalized.age, expenseDetails });
      return {
        monthlyCost: 0, educationTargetAge: 18, educationCostToday: 0,
        educationFund: 0, educationMonthly: 0, educationReturn: 7, educationInflation: 8,
        ...normalized, relation, endAge: wasLegacyChildCosts && endAge === 18 ? 25 : endAge, expenseDetails, monthlyCost
      };
    });
    if (!Array.isArray(data.loans)) data.loans = [];
    if (!data.loans.length && Number(saved.debt) > 0) data.loans.push({ type: 'Other', balance: Number(saved.debt), emi: 0, rate: 0, months: 0 });
    if (!Object.keys(data.investments || {}).length) {
      data.investments = Object.fromEntries(INVESTMENTS.map(item => [item.id, { balance: 0, monthly: 0, returns: [...item.defaults] }]));
      data.investments.cash.balance = Number(saved.savings) || 0;
      data.investments.other.balance = Number(saved.investments) || 0;
      data.salary = Number(saved.income) || 0;
      // Previous version stored gross expenses without investments/EMIs.
    }
    data.investments = Object.fromEntries(INVESTMENTS.map(item => {
      const investment = data.investments[item.id] || {};
      return [item.id, {
        balance: Number(investment.balance) || 0,
        monthly: Number(investment.monthly) || 0,
        returns: [0, 1, 2, 3].map(index => Number(investment.returns?.[index] ?? item.defaults[index]))
      }];
    }));
    return data;
  } catch (error) {
    console.warn('Saved finance data could not be read.', error);
    return null;
  }
}

function readForm() {
  const investments = {};
  for (const category of INVESTMENTS) {
    const row = document.querySelector(`[data-investment="${category.id}"]`);
    investments[category.id] = {
      balance: Number(row.querySelector('[data-field="balance"]').value),
      monthly: Number(row.querySelector('[data-field="monthly"]').value),
      returns: [1, 2, 3, 4].map(period => Number(row.querySelector(`[data-return="${period}"]`).value))
    };
  }
  const loans = [...document.querySelectorAll('.loan-card')].map(card => ({
    type: card.querySelector('[data-loan="type"]').value,
    balance: Number(card.querySelector('[data-loan="balance"]').value),
    emi: Number(card.querySelector('[data-loan="emi"]').value),
    rate: Number(card.querySelector('[data-loan="rate"]').value),
    months: Number(card.querySelector('[data-loan="months"]').value),
    startDate: card.querySelector('[data-loan="startDate"]').value
  }));
  return {
    age: Number(document.getElementById('age').value),
    maritalStatus: document.getElementById('marital-status').value,
    spouseAge: ['Married', 'Partnered'].includes(document.getElementById('marital-status').value) ? Number(document.getElementById('spouse-age').value) : null,
    inflation: Number(document.getElementById('inflation').value),
    retirementAge: Number(document.getElementById('retirement-age').value),
    retirementReduction: Number(document.getElementById('retirement-reduction').value),
    retirementEndAge: Number(document.getElementById('retirement-end-age').value),
    dependents: [...document.querySelectorAll('.dependent-card')].map(row => {
      const expenseDetails = Object.fromEntries([...row.querySelectorAll('[data-dependent-expense]')].map(input => [input.dataset.dependentExpense, Number(input.value) || 0]));
      const relation = row.querySelector('[data-dependent="relation"]').value;
      const age = Number(row.querySelector('[data-dependent="age"]').value);
      const dependentCosts = { relation, age, expenseDetails };
      return {
        relation,
        age,
        monthlyCost: dependentMonthlyCostAtAge(dependentCosts),
        expenseDetails,
        endAge: Number(row.querySelector('[data-dependent="endAge"]').value),
        educationTargetAge: Number(row.querySelector('[data-dependent="targetAge"]').value),
        educationCostToday: Number(row.querySelector('[data-dependent="goalCost"]').value),
        educationFund: Number(row.querySelector('[data-dependent="fund"]').value),
        educationMonthly: Number(row.querySelector('[data-dependent="educationMonthly"]').value),
        educationReturn: Number(row.querySelector('[data-dependent="return"]').value),
        educationInflation: Number(row.querySelector('[data-dependent="educationInflation"]').value)
      };
    }),
    salary: Number(document.getElementById('income').value),
    expenses: HOUSEHOLD_EXPENSES.reduce((sum, item) => sum + (Number(document.querySelector(`[data-household-expense="${item.id}"]`).value) || 0), 0),
    expenseDetails: Object.fromEntries(HOUSEHOLD_EXPENSES.map(item => [item.id, Number(document.querySelector(`[data-household-expense="${item.id}"]`).value) || 0])),
    rsuAnnual: Number(document.getElementById('rsu-income').value),
    investments, loans
  };
}

function buildExpenseFields(data) {
  const grid = document.getElementById('expense-category-grid');
  grid.innerHTML = HOUSEHOLD_EXPENSES.map(item => `<label class="field"><span>${item.label}</span><div class="input-wrap currency-input"><span>${currencySymbol}</span><input type="number" min="0" step="500" value="${Number(data?.expenseDetails?.[item.id]) || 0}" data-household-expense="${item.id}" aria-label="${item.label} per month"></div></label>`).join('');
  grid.addEventListener('input', () => {
    const total = HOUSEHOLD_EXPENSES.reduce((sum, item) => sum + (Number(grid.querySelector(`[data-household-expense="${item.id}"]`).value) || 0), 0);
    document.getElementById('expenses').value = total;
    setText('expense-total', currency.format(total));
  });
  grid.dispatchEvent(new Event('input'));
}

function calculateFinances(data) {
  if (!data) return null;
  const investmentAssets = INVESTMENTS.reduce((sum, item) => sum + (data.investments[item.id]?.balance || 0), 0);
  const educationAssets = data.dependents.reduce((sum, dependent) => sum + dependent.educationFund, 0);
  const assetTotal = investmentAssets + educationAssets;
  const rsuMonthlyVest = data.rsuAnnual / 12;
  const educationMonthly = data.dependents.reduce((sum, dependent) => sum + (dependent.educationTargetAge > dependent.age ? dependent.educationMonthly : 0), 0);
  const monthlyInvestments = INVESTMENTS.reduce((sum, item) => sum + (data.investments[item.id]?.monthly || 0), 0) + rsuMonthlyVest + educationMonthly;
  const debt = data.loans.reduce((sum, loan) => sum + loan.balance, 0);
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const monthlyEmis = data.loans.reduce((sum, loan) => sum + (loan.startDate && loan.startDate > todayKey ? 0 : loan.emi), 0);
  const monthlyIncome = data.salary + data.rsuAnnual / 12;
  const dependentMonthlyCost = data.dependents.reduce((sum, dependent) => sum + (dependent.age < dependent.endAge ? dependentMonthlyCostAtAge(dependent) : 0), 0);
  const surplus = monthlyIncome - data.expenses - dependentMonthlyCost - monthlyEmis - monthlyInvestments;
  const cash = data.investments.cash?.balance || 0;
  return {
    assets: assetTotal, debt, monthlyEmis, monthlyInvestments, dependentMonthlyCost,
    netWorth: assetTotal - debt, surplus,
    savingsRate: monthlyIncome > 0 ? ((monthlyIncome - data.expenses - dependentMonthlyCost - monthlyEmis) / monthlyIncome) * 100 : 0,
    emergencyMonths: data.expenses + dependentMonthlyCost > 0 ? cash / (data.expenses + dependentMonthlyCost) : 0,
    emergencyTarget: (data.expenses + dependentMonthlyCost) * 6
  };
}

function emiForProjectionMonth(data, monthOffset) {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + monthOffset, now.getDate());
  const targetKey = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
  return data.loans.reduce((total, loan) => {
    if (!loan.startDate || loan.startDate <= todayDateKey()) {
      return monthOffset <= loan.months ? total + loan.emi : total;
    }
    if (targetKey < loan.startDate) return total;
    const start = new Date(`${loan.startDate}T00:00:00`);
    const elapsed = Math.max(0, (target.getFullYear() - start.getFullYear()) * 12 + target.getMonth() - start.getMonth());
    return elapsed < loan.months ? total + loan.emi : total;
  }, 0);
}

function todayDateKey() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function calculateLoanEmi(principal, annualRate, tenureMonths) {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / tenureMonths;
  const growth = (1 + monthlyRate) ** tenureMonths;
  return principal * monthlyRate * growth / (growth - 1);
}

function updateLoanEmi(card) {
  const principal = Number(card.querySelector('[data-loan="balance"]').value) || 0;
  const annualRate = Number(card.querySelector('[data-loan="rate"]').value) || 0;
  const tenure = Number(card.querySelector('[data-loan="months"]').value) || 0;
  const emi = calculateLoanEmi(principal, annualRate, tenure);
  card.querySelector('[data-loan="emi"]').value = emi.toFixed(0);
}

function projection(data, horizon = 20) {
  const summary = calculateFinances(data);
  const balances = Object.fromEntries(INVESTMENTS.map(item => [item.id, data.investments[item.id].balance]));
  const educationBalances = data.dependents.map(dependent => dependent.educationFund);
  const periodCount = Math.ceil(horizon / 5);
  const labels = ['Today'];
  const nominal = [summary.assets];
  const real = [summary.assets];
  const contributions = [0];
  const educationWithdrawals = [0];
  const blendRates = [];
  const yearly = { labels: ['Today'], nominal: [summary.assets], real: [summary.assets], contributions: [0], educationWithdrawals: [0], blendRates: [] };
  let totalContributions = 0;
  let totalEducationWithdrawals = 0;
  for (let period = 0; period < periodCount; period += 1) {
    const monthsInPeriod = Math.min(60, horizon * 12 - period * 60);
    let periodWeighted = 0;
    let periodWeight = 0;
    for (const item of INVESTMENTS) {
      const categoryMonthly = data.investments[item.id].monthly + (item.id === 'rsu' ? data.rsuAnnual / 12 : 0);
      const weight = balances[item.id] + categoryMonthly * monthsInPeriod;
      periodWeighted += weight * data.investments[item.id].returns[Math.min(3, period)];
      periodWeight += weight;
    }
    data.dependents.forEach((dependent, index) => {
      const monthsUntilGoal = Math.max(0, Math.round((dependent.educationTargetAge - dependent.age) * 12));
      const contributionMonths = Math.max(0, Math.min(monthsInPeriod, monthsUntilGoal - period * 60));
      const weight = educationBalances[index] + dependent.educationMonthly * contributionMonths;
      periodWeighted += weight * dependent.educationReturn;
      periodWeight += weight;
    });
    blendRates.push(periodWeight ? periodWeighted / periodWeight : 0);
    let periodContributions = 0;
    let periodEducationWithdrawals = 0;
    for (let month = 0; month < monthsInPeriod; month += 1) {
      const contributionsBeforeMonth = periodContributions;
      const withdrawalsBeforeMonth = periodEducationWithdrawals;
      const monthOffset = period * 60 + month + 1;
      const dependentCost = data.dependents.reduce((sum, dependent) => {
        const ageAtMonth = dependent.age + monthOffset / 12;
        return ageAtMonth < dependent.endAge
          ? sum + dependentMonthlyCostAtAge(dependent, ageAtMonth) * (1 + data.inflation / 100) ** (monthOffset / 12)
          : sum;
      }, 0);
      const monthlyIncome = data.salary + data.rsuAnnual / 12;
      const scheduledEmis = emiForProjectionMonth(data, monthOffset);
      const availableForInvesting = monthlyIncome - data.expenses - dependentCost - scheduledEmis;
      const plannedEducation = data.dependents.reduce((sum, dependent) => sum + (monthOffset <= Math.max(0, Math.round((dependent.educationTargetAge - dependent.age) * 12)) ? dependent.educationMonthly : 0), 0);
      const plannedMonthlyInvestments = INVESTMENTS.reduce((sum, item) => sum + data.investments[item.id].monthly, 0) + data.rsuAnnual / 12 + plannedEducation;
      const investmentFactor = plannedMonthlyInvestments > 0
        ? Math.min(1, Math.max(0, availableForInvesting) / plannedMonthlyInvestments)
        : 0;
      for (const item of INVESTMENTS) {
        const investment = data.investments[item.id];
        const rate = investment.returns[Math.min(3, period)] / 100;
        const categoryMonthly = investment.monthly + (item.id === 'rsu' ? data.rsuAnnual / 12 : 0);
        const invested = categoryMonthly * investmentFactor;
        balances[item.id] = balances[item.id] * (1 + rate) ** (1 / 12) + invested;
        periodContributions += invested;
      }
      data.dependents.forEach((dependent, index) => {
        const monthsUntilGoal = Math.max(0, Math.round((dependent.educationTargetAge - dependent.age) * 12));
        const educationMonthlyRate = dependent.educationReturn / 100 / 12;
        const targetMonth = monthsUntilGoal === 0 ? 1 : monthsUntilGoal;
        const educationContribution = monthOffset <= monthsUntilGoal ? dependent.educationMonthly * investmentFactor : 0;
        educationBalances[index] = educationBalances[index] * (1 + educationMonthlyRate) + educationContribution;
        periodContributions += educationContribution;
        if (monthOffset === targetMonth && dependent.educationCostToday > 0) {
          const goalCost = dependent.educationCostToday * (1 + dependent.educationInflation / 100) ** (monthsUntilGoal / 12);
          const goalWithdrawal = Math.min(educationBalances[index], goalCost);
          educationBalances[index] -= goalWithdrawal;
          periodEducationWithdrawals += goalWithdrawal;
        }
      });
      if (availableForInvesting > 0) {
        const cashContribution = Math.max(0, availableForInvesting - plannedMonthlyInvestments * investmentFactor);
        balances.cash += cashContribution;
        periodContributions += cashContribution;
      } else {
        let shortfall = -availableForInvesting;
        for (const item of [INVESTMENTS[0], ...INVESTMENTS.slice(1)]) {
          const withdrawal = Math.min(balances[item.id], shortfall);
          balances[item.id] -= withdrawal;
          shortfall -= withdrawal;
          if (shortfall <= 0) break;
        }
        educationBalances.forEach((balance, index) => {
          if (shortfall <= 0) return;
          const withdrawal = Math.min(balance, shortfall);
          educationBalances[index] -= withdrawal;
          shortfall -= withdrawal;
        });
      }
      totalContributions += periodContributions - contributionsBeforeMonth;
      totalEducationWithdrawals += periodEducationWithdrawals - withdrawalsBeforeMonth;
      if (monthOffset % 12 === 0 || monthOffset === horizon * 12) {
        const annualValue = Object.values(balances).reduce((sum, balance) => sum + balance, 0) + educationBalances.reduce((sum, balance) => sum + balance, 0);
        const year = Math.ceil(monthOffset / 12);
        yearly.labels.push(`Year ${year}`);
        yearly.nominal.push(Math.round(annualValue));
        yearly.real.push(Math.round(annualValue / ((1 + data.inflation / 100) ** year)));
        yearly.contributions.push(Math.round(totalContributions));
        yearly.educationWithdrawals.push(Math.round(totalEducationWithdrawals));
        yearly.blendRates.push(blendRates[period]);
      }
    }
    const value = Object.values(balances).reduce((sum, balance) => sum + balance, 0) + educationBalances.reduce((sum, balance) => sum + balance, 0);
    const year = Math.min(horizon, (period + 1) * 5);
    labels.push(`Year ${year}`);
    nominal.push(Math.round(value));
    real.push(Math.round(value / ((1 + data.inflation / 100) ** year)));
    contributions.push(Math.round(contributions.at(-1) + periodContributions));
    educationWithdrawals.push(Math.round(educationWithdrawals.at(-1) + periodEducationWithdrawals));
  }
  return { labels, nominal, real, blendRates, contributions, educationWithdrawals, yearly };
}

function setText(id, value) { document.getElementById(id).textContent = value; }

function educationForecast(dependent) {
  const years = Math.max(0, dependent.educationTargetAge - dependent.age);
  const months = Math.round(years * 12);
  const targetCost = dependent.educationCostToday * (1 + dependent.educationInflation / 100) ** years;
  const monthlyRate = dependent.educationReturn / 100 / 12;
  const growth = (1 + monthlyRate) ** months;
  const annuityFactor = months === 0 ? 0 : monthlyRate === 0
    ? months
    : (growth - 1) / monthlyRate;
  const projectedFund = dependent.educationFund * growth + dependent.educationMonthly * annuityFactor;
  const amountToFund = Math.max(0, targetCost - dependent.educationFund * growth);
  const requiredMonthly = annuityFactor > 0 ? amountToFund / annuityFactor : 0;
  return {
    years, targetCost, projectedFund,
    shortfall: Math.max(0, targetCost - projectedFund),
    requiredMonthly,
    additionalMonthly: Math.max(0, requiredMonthly - dependent.educationMonthly)
  };
}

function retirementForecast(data) {
  const years = Math.max(0, data.retirementAge - data.age);
  const spouseIncludedForPlan = ['Married', 'Partnered'].includes(data.maritalStatus) && data.spouseAge != null;
  const spouseAtRetirement = spouseIncludedForPlan ? data.spouseAge + years : null;
  const selfAtRetirement = data.age + years;
  const retirementYears = Math.max(1, data.retirementEndAge - selfAtRetirement, spouseAtRetirement == null ? 0 : data.retirementEndAge - spouseAtRetirement);
  const inflation = data.inflation / 100;
  const retirementReduction = data.retirementReduction / 100;
  const assets = Object.fromEntries(INVESTMENTS.map(item => [item.id, data.investments[item.id].balance]));
  const months = years * 12;
  for (let month = 1; month <= months; month += 1) {
    const period = Math.min(3, Math.floor((month - 1) / 60));
    const monthOffset = month;
    const dependentCost = data.dependents.reduce((sum, dependent) => {
      const ageAtMonth = dependent.age + monthOffset / 12;
      return ageAtMonth < dependent.endAge ? sum + dependentMonthlyCostAtAge(dependent, ageAtMonth) * (1 + inflation) ** (monthOffset / 12) : sum;
    }, 0);
    const monthlyIncome = data.salary + data.rsuAnnual / 12;
    const available = monthlyIncome - data.expenses * (1 + inflation) ** (monthOffset / 12) - dependentCost - emiForProjectionMonth(data, monthOffset);
    const educationMonthly = data.dependents.reduce((sum, dependent) => monthOffset <= Math.max(0, Math.round((dependent.educationTargetAge - dependent.age) * 12)) ? sum + dependent.educationMonthly : sum, 0);
    const generalMonthly = INVESTMENTS.reduce((sum, item) => sum + data.investments[item.id].monthly, 0) + data.rsuAnnual / 12;
    const totalPlanned = generalMonthly + educationMonthly;
    const factor = totalPlanned > 0 ? Math.min(1, Math.max(0, available) / totalPlanned) : 0;
    for (const item of INVESTMENTS) {
      const rate = data.investments[item.id].returns[Math.min(3, period)] / 100;
      const monthly = data.investments[item.id].monthly + (item.id === 'rsu' ? data.rsuAnnual / 12 : 0);
      assets[item.id] = assets[item.id] * (1 + rate) ** (1 / 12) + monthly * factor;
    }
    if (available > 0) assets.cash += Math.max(0, available - totalPlanned * factor);
  }
  const projectedCorpus = Object.values(assets).reduce((sum, value) => sum + value, 0);
  const adultAgeFactor = age => age < 65 ? 1 : age < 75 ? 1.1 : age < 85 ? 1.25 : age < 95 ? 1.4 : 1.55;
  const realRetirementReturn = 0.02;
  const nominalRetirementReturn = (1 + inflation) * (1 + realRetirementReturn) - 1;
  const annualCosts = [];
  for (let year = 0; year < retirementYears; year += 1) {
    const selfAge = selfAtRetirement + year;
    const spouseAge = spouseAtRetirement == null ? null : spouseAtRetirement + year;
    const spouseIncluded = spouseAge != null && ['Married', 'Partnered'].includes(data.maritalStatus);
    const adultAgeCostFactor = spouseIncluded
      ? (adultAgeFactor(selfAge) + adultAgeFactor(spouseAge) * 0.7) / 1.7
      : adultAgeFactor(selfAge);
    const continuingDependentCosts = data.dependents.reduce((sum, dependent) => {
      const dependentAge = dependent.age + years + year;
      return dependentAge < dependent.endAge ? sum + dependentMonthlyCostAtAge(dependent, dependentAge) : sum;
    }, 0);
    const todayMonthlyCost = data.expenses * retirementReduction * adultAgeCostFactor + continuingDependentCosts;
    const futureMonthlyCost = todayMonthlyCost * (1 + inflation) ** (years + year);
    annualCosts.push(futureMonthlyCost * 12);
  }
  const spendingAtRetirement = annualCosts[0] || 0;
  const targetCorpus = annualCosts.reduce((sum, annualCost, year) => sum + annualCost / (1 + nominalRetirementReturn) ** year, 0);
  const shortfall = Math.max(0, targetCorpus - projectedCorpus);
  return { years, retirementYears, projectedCorpus, targetCorpus, shortfall, spendingAtRetirement, retirementReduction, realRetirementReturn };
}

function renderRetirementPlan(data) {
  const container = document.getElementById('retirement-summary');
  if (!data || !data.age || data.expenses === undefined) {
    container.innerHTML = '<p class="education-empty">Add your age, monthly household expenses, and retirement assumptions to see an estimate.</p>';
    return;
  }
  const result = retirementForecast(data);
  const outcome = result.shortfall > 0
    ? `Estimated gap: ${currency.format(result.shortfall)} at retirement.`
    : 'Projected investments meet this spending target.';
  container.innerHTML = `<div class="retirement-metrics"><div><small>Years to retirement</small><strong>${result.years}</strong></div><div><small>Projected investments</small><strong>${currency.format(result.projectedCorpus)}</strong></div><div><small>Estimated fund target</small><strong>${currency.format(result.targetCorpus)}</strong></div><div><small>First-year spending</small><strong>${currency.format(result.spendingAtRetirement)}</strong></div></div><p class="retirement-outcome ${result.shortfall <= 0 ? 'on-track' : ''}">${outcome}</p><p class="retirement-note">Estimates ${Math.round(result.retirementReduction * 100)}% of current adult household spending, adds age-based healthcare costs, includes dependent costs only while each dependent is under their cost-through age, and plans for ${result.retirementYears} years. Assumes a 2% real return during retirement.</p>`;
}

function renderEducationPlans(data) {
  const list = document.getElementById('education-summary-list');
  if (!data.dependents.length) {
    list.innerHTML = '<p class="education-empty">Add a dependent and education estimate in Personal details to see a plan.</p>';
    return;
  }
  list.replaceChildren();
  data.dependents.forEach((dependent, index) => {
    const forecast = educationForecast(dependent);
    const card = document.createElement('article');
    card.className = 'education-summary-card';
    if (dependent.educationCostToday <= 0) {
      card.innerHTML = `<div class="education-summary-heading"><strong>Dependent ${index + 1}</strong><span>Age ${dependent.age}</span></div><p class="education-empty">Add an education cost estimate in Personal details to calculate this goal.</p>`;
      list.append(card);
      return;
    }
    const targetStatus = forecast.years === 0
      ? `Target age reached. Current fund gap: ${currency.format(forecast.shortfall)}.`
      : forecast.shortfall > 0
        ? `Plan to add about ${currency.format(forecast.additionalMonthly)} per month to close the projected gap.`
        : 'On track using the entered return and inflation assumptions.';
    card.innerHTML = `<div class="education-summary-heading"><strong>Dependent ${index + 1}</strong><span>Age ${dependent.age} · target age ${dependent.educationTargetAge}</span></div>
      <div class="education-metrics"><div><small>Estimated target cost</small><strong>${currency.format(forecast.targetCost)}</strong></div><div><small>Projected fund</small><strong>${currency.format(forecast.projectedFund)}</strong></div><div><small>Monthly saving needed</small><strong>${currency.format(forecast.requiredMonthly)}</strong></div><div><small>Current monthly saving</small><strong>${currency.format(dependent.educationMonthly)}</strong></div></div>
      <div class="education-gap ${forecast.shortfall <= 0 ? 'on-track' : ''}"><span>${forecast.shortfall > 0 ? `Projected shortfall: ${currency.format(forecast.shortfall)}` : 'Projected goal covered'}</span><p>${targetStatus}</p><small>Assumes the entered monthly saving continues and the return and inflation assumptions hold.</small></div>`;
    list.append(card);
  });
}

function renderRiskSnapshot(data) {
  const container = document.getElementById('risk-summary');
  const riskRatings = { cash: 1, rsu: 9, largeCap: 7, midCap: 8, smallCap: 9, flexiCap: 7, nps: 5, epf: 2, ppf: 2, fd: 2, other: 5 };
  const rows = INVESTMENTS.map(item => ({ name: item.name, balance: data.investments[item.id].balance, risk: riskRatings[item.id] }));
  const total = rows.reduce((sum, item) => sum + item.balance, 0);
  if (!total) {
    container.innerHTML = '<p class="education-empty">Add investment balances to see a portfolio mix snapshot.</p>';
    return;
  }
  const score = rows.reduce((sum, item) => sum + item.risk * item.balance, 0) / total;
  const largest = rows.reduce((a, b) => a.balance > b.balance ? a : b);
  const label = score < 3 ? 'Lower volatility mix' : score < 5 ? 'Moderate mix' : score < 7 ? 'Growth oriented mix' : 'Higher volatility mix';
  const concentration = largest.balance / total;
  container.innerHTML = `<div class="risk-score"><strong>${score.toFixed(1)}<small> / 10</small></strong><span>${label}</span></div><div class="risk-track" aria-label="Indicative risk score ${score.toFixed(1)} out of 10"><span style="width:${Math.min(100, score * 10)}%"></span></div><div class="risk-details"><span>Largest category</span><strong>${largest.name} · ${(concentration * 100).toFixed(0)}% of entered balances</strong></div><p class="retirement-note">This simple weighted score uses fixed category risk ratings. It is not a suitability assessment or a measure of future loss.</p>`;
}

function buildInvestmentTable(saved = {}) {
  const wrap = document.getElementById('investment-table-wrap');
  const table = document.createElement('table');
  table.className = 'investment-table';
  table.innerHTML = `<thead><tr><th>Category</th><th>Current balance</th><th>Monthly investment</th><th>Years 1–5</th><th>Years 6–10</th><th>Years 11–15</th><th>Years 16–20</th></tr></thead>`;
  const body = table.createTBody();
  for (const category of INVESTMENTS) {
    const values = saved[category.id] || { balance: 0, monthly: 0, returns: category.defaults };
    const row = body.insertRow();
    row.dataset.investment = category.id;
    const reference = category.historicalAverage
      ? `<small class="historical-reference">5y rolling mean ${category.historicalAverage}% <a href="${category.historicalSource}" target="_blank" rel="noreferrer" aria-label="Source for ${category.name} historical reference">source</a></small>`
      : '<small class="historical-reference">Editable planning assumption</small>';
    row.innerHTML = `<th scope="row">${category.name}${reference}</th>
      <td><label class="sr-only">${category.name} current balance</label><input data-field="balance" type="number" min="0" step="1000" value="${Number(values.balance) || 0}" aria-label="${category.name} current balance"></td>
      <td><label class="sr-only">${category.name} monthly investment</label><input data-field="monthly" type="number" min="0" step="500" value="${Number(values.monthly) || 0}" aria-label="${category.name} monthly investment"></td>
      ${[1, 2, 3, 4].map(index => `<td><label class="sr-only">${category.name} annual return in years ${(index - 1) * 5 + 1} to ${index * 5}</label><div class="return-input"><input data-return="${index}" type="number" min="-100" max="100" step="0.1" value="${Number(values.returns?.[index - 1] ?? category.defaults[index - 1])}" aria-label="${category.name} return period ${index}"><span>%</span></div></td>`).join('')}`;
  }
  wrap.replaceChildren(table);
}

function updateDependentExpenseFields(card) {
  const currentValues = Object.fromEntries([...card.querySelectorAll('[data-dependent-expense]')].map(input => [input.dataset.dependentExpense, Number(input.value) || 0]));
  card._expenseDetails = { ...card._expenseDetails, ...currentValues };
  const relation = card.querySelector('[data-dependent="relation"]').value;
  const categories = DEPENDENT_EXPENSES[relation] || DEPENDENT_EXPENSES.Other;
  categories.forEach(category => {
    if (card._expenseDetails[category.id] === undefined) card._expenseDetails[category.id] = category.defaultMonthly || 0;
  });
  const fields = card.querySelector('.dependent-expense-grid');
  fields.innerHTML = categories.map(category => `<label class="field"><span>${category.label} / month</span><div class="input-wrap currency-input"><span>${currencySymbol}</span><input type="number" min="0" step="500" data-dependent-expense="${category.id}" value="${Number(card._expenseDetails[category.id] ?? category.defaultMonthly) || 0}" aria-label="${category.label} monthly cost"></div></label>`).join('');
  fields.querySelectorAll('[data-dependent-expense]').forEach(input => input.addEventListener('input', () => {
    card._expenseDetails[input.dataset.dependentExpense] = Number(input.value) || 0;
    const age = Number(card.querySelector('[data-dependent="age"]').value) || 0;
    card.querySelector('[data-dependent="cost-total"]').textContent = currency.format(dependentMonthlyCostAtAge({ relation, age, expenseDetails: card._expenseDetails }));
  }));
  const age = Number(card.querySelector('[data-dependent="age"]').value) || 0;
  const total = dependentMonthlyCostAtAge({ relation, age, expenseDetails: card._expenseDetails });
  card.querySelector('[data-dependent="cost-total"]').textContent = currency.format(total);
}

function makeDependent(dependent = {}) {
  if (typeof dependent === 'number') dependent = { age: dependent };
  const row = document.createElement('div');
  row.className = 'dependent-card';
  const val = (key, fallback = 0) => Number(dependent[key] ?? fallback);
  row._expenseDetails = { ...(dependent.relation === 'Child' ? Object.fromEntries(DEPENDENT_EXPENSES.Child.map(category => [category.id, category.defaultMonthly])) : {}), ...(dependent.expenseDetails || {}) };
  row.innerHTML = `<div class="dependent-card-heading"><strong class="dependent-title">Dependent</strong><button type="button" class="remove-loan-button">Remove</button></div>
    <label class="field"><span>Age</span><div class="input-wrap"><input type="number" data-dependent="age" min="0" max="120" step="1" placeholder="e.g. 8" value="${Number(dependent.age) || ''}" required><span>years</span></div></label>
    <label class="field"><span>Relationship</span><div class="input-wrap"><select data-dependent="relation" aria-label="Dependent relationship">${DEPENDENT_RELATIONS.map(relation => `<option value="${relation}">${relation}</option>`).join('')}</select></div></label>
    <label class="field"><span>Cost continues until age</span><div class="input-wrap"><input type="number" data-dependent="endAge" min="0" max="120" step="1" value="${val('endAge', DEPENDENT_END_AGE[dependent.relation] || 18)}" required><span>years</span></div></label>
    <div class="dependent-education-heading dependent-expense-heading">Monthly costs by life stage <small>Child totals use the stage matching their age and add the marriage fund saving. Editable starting estimates in ₹/month.</small></div>
    <div class="dependent-expense-grid"></div>
    <div class="dependent-expense-total"><span>Current stage cost / month</span><strong data-dependent="cost-total">${currency.format(0)}</strong></div>
    <div class="dependent-education-heading">Education goal <small>Costs in today's rupees; use a dedicated fund not listed in general investments</small></div>
    <label class="field"><span>Target age</span><div class="input-wrap"><input type="number" data-dependent="targetAge" min="0" max="120" step="1" value="${val('educationTargetAge', 18)}" required><span>years</span></div></label>
    <label class="field"><span>Total education cost today</span><div class="input-wrap currency-input"><span>${currencySymbol}</span><input type="number" data-dependent="goalCost" min="0" step="10000" value="${val('educationCostToday')}" required></div></label>
    <label class="field"><span>Current education fund</span><div class="input-wrap currency-input"><span>${currencySymbol}</span><input type="number" data-dependent="fund" min="0" step="1000" value="${val('educationFund')}" required></div></label>
    <label class="field"><span>Monthly education saving</span><div class="input-wrap currency-input"><span>${currencySymbol}</span><input type="number" data-dependent="educationMonthly" min="0" step="500" value="${val('educationMonthly')}" required></div></label>
    <label class="field"><span>Education return assumption</span><div class="input-wrap"><input type="number" data-dependent="return" min="-50" max="100" step="0.1" value="${val('educationReturn', 7)}" required><span>% / year</span></div></label>
    <label class="field"><span>Education cost inflation</span><div class="input-wrap"><input type="number" data-dependent="educationInflation" min="0" max="50" step="0.1" value="${val('educationInflation', 8)}" required><span>% / year</span></div></label>`;
  row.querySelector('[data-dependent="relation"]').value = DEPENDENT_RELATIONS.includes(dependent.relation) ? dependent.relation : 'Child';
  let previousRelation = row.querySelector('[data-dependent="relation"]').value;
  row.querySelector('[data-dependent="relation"]').addEventListener('change', event => {
    const endAgeInput = row.querySelector('[data-dependent="endAge"]');
    if (Number(endAgeInput.value) === DEPENDENT_END_AGE[previousRelation]) endAgeInput.value = DEPENDENT_END_AGE[event.target.value];
    previousRelation = event.target.value;
    updateDependentExpenseFields(row);
    updateDependents();
  });
  row.querySelector('[data-dependent="age"]').addEventListener('input', () => updateDependentExpenseFields(row));
  updateDependentExpenseFields(row);
  row.querySelector('button').addEventListener('click', () => { row.remove(); updateDependents(); });
  document.getElementById('dependent-list').append(row);
  updateDependents();
}

function updateDependents() {
  const list = document.getElementById('dependent-list');
  const rows = list.querySelectorAll('.dependent-card');
  let empty = list.querySelector('.empty-loans');
  if (!rows.length && !empty) {
    empty = document.createElement('p'); empty.className = 'empty-loans'; empty.textContent = 'No dependents added.'; list.append(empty);
  } else if (rows.length && empty) empty.remove();
  rows.forEach((row, index) => { row.querySelector('.dependent-title').textContent = `Dependent ${index + 1} · ${row.querySelector('[data-dependent="relation"]').value}`; });
}

function makeLoanCard(loan = {}) {
  const card = document.createElement('fieldset');
  card.className = 'loan-card';
  card.innerHTML = `<legend class="sr-only">Loan details</legend><div class="loan-card-top"><strong class="loan-card-title">Loan details</strong><button type="button" class="remove-loan-button">Remove</button></div>
    <div class="form-grid loan-fields"><label class="field"><span>Loan type</span><select data-loan="type"><option>Home loan</option><option>Personal loan</option><option>Education loan</option><option>Vehicle loan</option><option>Credit card</option><option>Other</option></select></label>
    <label class="field"><span>Outstanding balance</span><div class="input-wrap currency-input"><span>${currencySymbol}</span><input data-loan="balance" type="number" min="0" step="1000" required></div></label>
    <label class="field"><span>Annual rate of interest (ROI)</span><div class="input-wrap"><input data-loan="rate" type="number" min="0" max="100" step="0.1" required><span>% / year</span></div></label>
    <label class="field"><span>Tenure</span><div class="input-wrap"><input data-loan="months" type="number" min="1" max="600" step="1" required><span>months</span></div></label>
    <label class="field"><span>Calculated monthly EMI</span><div class="input-wrap currency-input calculated-emi"><span>${currencySymbol}</span><input data-loan="emi" type="number" min="0" readonly aria-readonly="true" required></div></label>
    <label class="field"><span>EMI start date</span><div class="input-wrap"><input data-loan="startDate" type="date" required></div></label></div>
    <p class="loan-calc-note">EMI is calculated with a monthly reducing-balance formula.</p>`;
  card.querySelector('[data-loan="type"]').value = loan.type || 'Home loan';
  for (const key of ['balance', 'rate', 'months']) if (loan[key] !== undefined) card.querySelector(`[data-loan="${key}"]`).value = loan[key];
  card.querySelector('[data-loan="startDate"]').value = loan.startDate || todayDateKey();
  ['balance', 'rate', 'months'].forEach(key => card.querySelector(`[data-loan="${key}"]`).addEventListener('input', () => updateLoanEmi(card)));
  updateLoanEmi(card);
  card.querySelector('button').addEventListener('click', () => { card.remove(); updateLoanLabels(); });
  document.getElementById('loan-list').append(card);
  updateLoanLabels();
}

function updateLoanLabels() {
  const list = document.getElementById('loan-list');
  const cards = [...list.querySelectorAll('.loan-card')];
  const empty = list.querySelector('.empty-loans');
  if (!cards.length && !empty) { const p = document.createElement('p'); p.className = 'empty-loans'; p.textContent = 'No loans added. Add a loan to include its balance and EMI in your snapshot.'; list.append(p); }
  else if (cards.length && empty) empty.remove();
  cards.forEach((card, index) => { card.querySelector('.loan-card-title').textContent = `Loan ${index + 1}`; });
}

function renderProjectionTable(values) {
  const container = document.getElementById('projection-table');
  const yearly = values.yearly;
  const details = document.createElement('details');
  details.className = 'projection-table-details';
  const summary = document.createElement('summary');
  summary.textContent = `Year-by-year calculations (${yearly.labels.length - 1} years)`;
  details.append(summary);
  const table = document.createElement('table');
  table.className = 'projection-table';
  table.innerHTML = '<caption>Projection calculations by year</caption><thead><tr><th scope="col">Year</th><th scope="col">Blended return</th><th scope="col">Contributions to date</th><th scope="col">Education withdrawals</th><th scope="col">Projected value</th><th scope="col">Value in today’s money</th></tr></thead>';
  const body = document.createElement('tbody');
  yearly.labels.forEach((label, index) => {
    const row = document.createElement('tr');
    const cells = [label, index ? `${yearly.blendRates[index - 1].toFixed(1)}%` : '—', currency.format(yearly.contributions[index]), currency.format(yearly.educationWithdrawals[index]), currency.format(yearly.nominal[index]), currency.format(yearly.real[index])];
    cells.forEach((value, cellIndex) => {
      const cell = document.createElement(cellIndex === 0 ? 'th' : 'td');
      if (cellIndex === 0) cell.scope = 'row';
      cell.textContent = value;
      row.append(cell);
    });
    body.append(row);
  });
  table.append(body);
  details.append(table);
  container.replaceChildren(details);
}

function renderCashFlowCharts(data, summary) {
  if (!window.Chart) return;
  const income = data.salary + data.rsuAnnual / 12;
  const expenses = data.expenses;
  const dependentCosts = summary.dependentMonthlyCost;
  const emis = summary.monthlyEmis;
  const investments = summary.monthlyInvestments;
  const surplus = Math.max(0, summary.surplus);
  const deficit = Math.max(0, -summary.surplus);
  const labels = ['Living expenses', 'Dependent costs', 'Loan EMIs', 'Investments', 'Surplus', 'Shortfall'];
  const values = [expenses, dependentCosts, emis, investments, surplus, deficit];
  if (cashFlowSummaryChart) cashFlowSummaryChart.destroy();
  if (cashFlowMixChart) cashFlowMixChart.destroy();
  const commonLegend = { display: true, position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 7, padding: 12, color: '#7f867e', font: { family: 'DM Sans', size: 9 } } };
  cashFlowSummaryChart = new Chart(document.getElementById('cashflow-summary-chart'), {
    type: 'bar',
    data: { labels: ['Monthly amount'], datasets: [
      { label: 'Income', data: [income], backgroundColor: '#2e8059', stack: 'income' },
      ...labels.map((label, index) => ({ label, data: [values[index]], backgroundColor: ['#9eac98', '#bb9d6c', '#9e7c72', '#7191ae', '#82b58a', '#c76e62'][index], stack: 'outflow' }))
    ] },
    options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: commonLegend, tooltip: { callbacks: { label: context => `${context.dataset.label}: ${currency.format(context.raw)}` } } }, scales: { x: { beginAtZero: true, stacked: true, ticks: { callback: value => `${currencySymbol}${Math.round(value / 1000)}k`, color: '#989e96', font: { size: 9 } }, grid: { color: '#f0f2ed' }, border: { display: false } }, y: { stacked: true, grid: { display: false }, ticks: { display: false }, border: { display: false } } } }
  });
  cashFlowMixChart = new Chart(document.getElementById('cashflow-mix-chart'), {
    type: 'doughnut',
    data: { labels, datasets: [{ data: values, backgroundColor: ['#9eac98', '#bb9d6c', '#9e7c72', '#7191ae', '#82b58a', '#c76e62'], borderWidth: 2, borderColor: '#fff' }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '64%', plugins: { legend: commonLegend, tooltip: { callbacks: { label: context => `${context.label}: ${currency.format(context.raw)}` } } } }
  });
}

function renderChart(data) {
  if (!data) return;
  const horizon = Number(appSettings.horizon) || 20;
  const values = projection(data, horizon);
  renderProjectionTable(values);
  setText('projection-total', currency.format(values.nominal.at(-1)));
  const rates = values.blendRates.map((rate, index) => `Y${index * 5 + 1}–${index * 5 + 5}: ${rate.toFixed(1)}%`).join(' · ');
  setText('blend-return-summary', `Blended annual assumptions: ${rates}`);
  const canvas = document.getElementById('financial-chart');
  document.querySelector('.chart-panel h2').textContent = `${horizon}-year investment projection`;
  document.querySelector('.chart-summary .assumption').textContent = `Nominal value at year ${horizon}`;
  document.querySelector('.chart-panel .horizon-badge').textContent = `${Math.ceil(horizon / 5)} × 5-year periods`;
  if (!window.Chart) {
    if (!chartLoadStarted) {
      chartLoadStarted = true;
      const loadChart = () => {
        if (document.querySelector('script[data-lazy-chart]')) return;
        const script = document.createElement('script');
        script.dataset.lazyChart = 'true';
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => renderChart(loadUserData());
        script.onerror = () => setText('blend-return-summary', 'Chart library could not load; projection values are still available above.');
        document.head.append(script);
      };
      if (!('IntersectionObserver' in window)) loadChart();
      else {
        const observer = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        observer.disconnect();
        loadChart();
        }, { rootMargin: '200px' });
        observer.observe(canvas);
        const cashFlowCanvas = document.getElementById('cashflow-summary-chart');
        if (cashFlowCanvas) observer.observe(cashFlowCanvas);
      }
    }
    return;
  }
  renderCashFlowCharts(data, calculateFinances(data));
  if (financialChart) financialChart.destroy();
  financialChart = new Chart(canvas, { type: 'line', data: { labels: values.labels, datasets: [
    { label: 'Projected value', data: values.nominal, borderColor: '#2e8059', backgroundColor: 'rgba(46,128,89,.10)', fill: true, tension: .25, pointRadius: 3, borderWidth: 2 },
    { label: 'In today\'s money', data: values.real, borderColor: '#b5cdbb', fill: false, tension: .25, pointRadius: 2, borderDash: [4, 4], borderWidth: 1.5 }
  ] }, options: { responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: 'index' }, plugins: { legend: { display: true, position: 'bottom', align: 'start', labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 6, boxHeight: 6, padding: 16, color: '#7f867e', font: { family: 'DM Sans', size: 9 } } }, tooltip: { callbacks: { label: context => `${context.dataset.label}: ${currency.format(context.raw)}` } } }, scales: { x: { grid: { display: false }, ticks: { color: '#989e96', font: { family: 'DM Sans', size: 9 } }, border: { display: false } }, y: { beginAtZero: true, grid: { color: '#f0f2ed' }, ticks: { maxTicksLimit: 4, color: '#989e96', font: { family: 'DM Sans', size: 9 }, callback: value => value >= 1000000 ? `${currencySymbol}${(value / 1000000).toFixed(1)}M` : `${currencySymbol}${Math.round(value / 1000)}k` }, border: { display: false } } } } });
}

function renderDashboard(data) {
  const summary = calculateFinances(data);
  if (!summary) return;
  setText('net-worth', currency.format(summary.netWorth));
  setText('monthly-surplus', currency.format(summary.surplus));
  setText('savings-rate', `${Math.round(summary.savingsRate)}%`);
  setText('assets-total', currency.format(summary.assets));
  setText('debt-total', currency.format(summary.debt));
  setText('dependent-cost-total', currency.format(summary.dependentMonthlyCost));
  setText('emi-total', currency.format(summary.monthlyEmis));
  setText('breakdown-net-worth', currency.format(summary.netWorth));
  if (summary.emergencyTarget > 0) {
    setText('emergency-fund', `${summary.emergencyMonths.toFixed(1)} months`);
    setText('emergency-caption', `of ${currency.format(summary.emergencyTarget)} six-month target`);
    document.getElementById('emergency-progress').style.width = `${Math.min(100, (data.investments.cash.balance / summary.emergencyTarget) * 100)}%`;
  }
  if (summary.surplus < 0) { setText('insight-title', 'Monthly outgoings exceed income'); setText('insight-copy', `Expenses, EMIs, and planned investments are ${currency.format(-summary.surplus)} above income.`); }
  else { setText('insight-title', summary.emergencyMonths < 3 ? 'Build your safety cushion' : 'A solid cash cushion'); setText('insight-copy', `Savings cover about ${summary.emergencyMonths.toFixed(1)} months of expenses.`); }
  renderChart(data);
  renderRiskSnapshot(data);
  renderRetirementPlan(data);
  renderEducationPlans(data);
}

function showTab(tab) {
  const personal = tab === 'personal';
  document.getElementById('panel-personal').hidden = !personal;
  document.getElementById('panel-income').hidden = personal;
  document.getElementById('tab-personal').classList.toggle('active', personal);
  document.getElementById('tab-income').classList.toggle('active', !personal);
  document.getElementById('tab-personal').setAttribute('aria-selected', String(personal));
  document.getElementById('tab-income').setAttribute('aria-selected', String(!personal));
  document.getElementById('save-status').textContent = 'Your information is stored only in this browser.';
}

function updateSpouseAgeField() {
  const partnered = ['Married', 'Partnered'].includes(document.getElementById('marital-status').value);
  const field = document.getElementById('spouse-age-field');
  const input = document.getElementById('spouse-age');
  field.hidden = !partnered;
  input.required = partnered;
}

function validateTab(panel) {
  const invalid = [...panel.querySelectorAll('input, select')].find(input => !input.disabled && !input.checkValidity());
  if (invalid) { invalid.reportValidity(); invalid.focus(); return false; }
  return true;
}

function saveUserData(event) {
  event.preventDefault();
  if (!validateTab(document.getElementById('panel-personal'))) { showTab('personal'); return; }
  if (!validateTab(document.getElementById('panel-income'))) return;
  const data = readForm();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    renderDashboard(data);
    setText('save-status', 'Saved. Your snapshot is stored in this browser.');
  } catch (error) { console.error('Could not save financial data.', error); setText('save-status', 'Could not save. Check your browser storage settings.'); }
}

function populateForm(data) {
  if (!data) return;
  for (const [key, id] of Object.entries({ age: 'age', maritalStatus: 'marital-status', spouseAge: 'spouse-age', inflation: 'inflation', retirementAge: 'retirement-age', retirementReduction: 'retirement-reduction', retirementEndAge: 'retirement-end-age', salary: 'income', expenses: 'expenses', rsuAnnual: 'rsu-income' })) {
    if (data[key] !== undefined && data[key] !== '') document.getElementById(id).value = data[key];
  }
  data.dependents.forEach(dependent => makeDependent(dependent));
  buildInvestmentTable(data.investments);
  data.loans.forEach(loan => makeLoanCard(loan));
}

document.addEventListener('DOMContentLoaded', () => {
  loadAppSettings();
  buildProfileTools();
  document.querySelector('.sidebar-footer strong').textContent = appSettings.profileName;
  document.querySelector('.sidebar-footer .avatar').textContent = appSettings.profileName.slice(0, 1).toUpperCase();
  const data = loadUserData();
  buildExpenseFields(data);
  buildInvestmentTable(data?.investments || {});
  populateForm(data);
  updateSpouseAgeField();
  renderDashboard(data);
  document.getElementById('tab-personal').addEventListener('click', () => showTab('personal'));
  document.getElementById('tab-income').addEventListener('click', () => {
    if (validateTab(document.getElementById('panel-personal'))) showTab('income');
  });
  document.querySelector('.next-tab').addEventListener('click', () => {
    if (validateTab(document.getElementById('panel-personal'))) showTab('income');
  });
  document.querySelector('.back-tab').addEventListener('click', () => showTab('personal'));
  document.getElementById('add-dependent').addEventListener('click', () => makeDependent());
  document.getElementById('marital-status').addEventListener('change', updateSpouseAgeField);
  document.getElementById('add-loan').addEventListener('click', () => makeLoanCard());
  document.getElementById('apply-historical-references').addEventListener('click', () => {
    for (const category of INVESTMENTS.filter(item => item.historicalAverage !== undefined)) {
      const row = document.querySelector(`[data-investment="${category.id}"]`);
      [1, 2, 3, 4].forEach(period => { row.querySelector(`[data-return="${period}"]`).value = category.historicalAverage; });
    }
    setText('benchmark-status', 'Applied available NSE rolling five-year averages to Large cap and Mid cap.');
  });
  const retirementAge = document.getElementById('retirement-age');
  const retirementEndAge = document.getElementById('retirement-end-age');
  const validateRetirementAges = () => retirementEndAge.setCustomValidity(
    Number(retirementEndAge.value) <= Number(retirementAge.value)
      ? 'Plan-through age must be greater than retirement age.'
      : ''
  );
  retirementAge.addEventListener('input', validateRetirementAges);
  retirementEndAge.addEventListener('input', validateRetirementAges);
  validateRetirementAges();
  document.getElementById('financial-form').addEventListener('submit', saveUserData);
});
