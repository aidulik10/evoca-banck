// Single source of truth: menus, routes, footer and section pages are all generated from this.
export const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export const sections = [
  { key: 'personal', title: 'Personal', groups: [
    { title: 'Loans', items: ['Consumer loans', 'Mortgage loans', 'Auto loans', 'Credit score', 'Loan terms'] },
    { title: 'Cards', items: ['Debit cards', 'Credit cards', 'Premium cards', 'Travel card', 'Gift cards', 'Virtual cards', 'Pension cards', 'Cashback rewards'] },
    { title: 'Deposits', items: ['Savings deposit', 'Online deposit', 'Child deposit', 'Deposit terms'] },
    { title: 'Accounts', items: ['Open an account', 'Metal accounts', 'Remote service', 'Safe boxes'] },
    { title: 'Transfers', items: ['Money transfers', 'Payment systems', 'Utility payments'] },
    { title: 'Investing', items: ['Bonds', 'Stocks', 'Repo deals', 'Invest app'] },
    { title: 'Digital', items: ['Mobile app', 'Online banking', 'Salary project', 'Promo codes'] },
  ] },
  { key: 'business', title: 'Business', groups: [
    { title: 'Lending', items: ['Business loans', 'SME lending', 'Leasing', 'Special offers'] },
    { title: 'Accounts', items: ['Business accounts', 'Metal accounts', 'Business deposit'] },
    { title: 'Markets', items: ['Business bonds', 'Business stocks', 'Business repo'] },
    { title: 'Trade finance', items: ['Guarantees', 'Factoring', 'Letters of credit', 'Collection'] },
    { title: 'Payments', items: ['POS terminal', 'Virtual POS', 'Mobile POS', 'Terminal tariffs', 'Terminal request'] },
    { title: 'Other', items: ['Business transfers', 'Safe boxes'] },
  ] },
  { key: 'about', title: 'About', groups: [
    { title: 'The bank', items: ['Our story', 'Structure', 'Shareholders', 'Management', 'Partners', 'Awards', 'Social responsibility', 'Financial group'] },
    { title: 'Tariffs', items: ['Loan tariffs', 'Fee tariffs', 'Deposit tariffs', 'Tariff archive'] },
    { title: 'Reports', items: ["Auditor's opinion", 'Financial statements', 'Investor presentation', 'Semi-annual report', 'Annual report'] },
    { title: 'Legal', items: ['Legal acts', 'Customer rights', 'Privacy policy', 'Residency criteria', 'Regulation', 'Financial mediator', 'Crime prevention'] },
  ] },
  { key: 'careers', title: 'Careers', groups: [
    { title: 'Life at Kestrel', items: ['Culture', 'Benefits', 'Career FAQ', 'How we hire'] },
    { title: 'Join us', items: ['Jobs', 'Internships', 'Bridge program'] },
  ] },
  { key: 'support', title: 'Support', groups: [
    { title: 'Help', items: ['FAQ', 'Contact', 'Branches and ATMs', 'Announcements', 'Booklets', 'Site map'] },
  ] },
  { key: 'news', title: 'News', groups: [
    { title: 'Latest', items: ['New branch opens downtown', 'Back-to-school cashback', 'Summer festival partner'] },
  ] },
  { key: 'blog', title: 'Blog', groups: [
    { title: 'Articles', items: ['How to read a loan schedule', 'Saving for the first home', 'Travel money checklist'] },
  ] },
]

export const allPages = sections.flatMap((s) =>
  s.groups.flatMap((g) => g.items.map((title) => ({
    section: s.key, sectionTitle: s.title, group: g.title, title, slug: slug(title), path: `/${s.key}/${slug(title)}`,
  })))
)
export const findPage = (section, sl) => allPages.find((p) => p.section === section && p.slug === sl)
