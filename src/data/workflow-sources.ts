/**
 * Maps each workflow to its canonical source (name + URL builder) and the
 * attributes it is responsible for extracting.
 *
 * Used by:
 *  - Edge function (to record which workflows a job ran)
 *  - HITL Review (to filter sourceRefs per attribute to only the selected workflows
 *    and to power the "click source → load page on LHS" interaction)
 */

export type WorkflowSourceId =
  | "company_data"
  | "registry_data"
  | "sec_data"
  | "stock_exchange";

export interface WorkflowSource {
  id: WorkflowSourceId;
  /** Workflow label as shown in the Run New Job modal (must match exactly) */
  label: string;
  /** Display name shown next to each attribute as a clickable source pill */
  sourceName: string;
  /** Attributes this workflow is the canonical source for */
  attributes: string[];
  /** Build the LHS iframe URL for a given company name */
  buildUrl: (companyName: string) => string;
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const workflowSources: WorkflowSource[] = [
  {
    id: "company_data",
    label: "Company Data Extraction",
    sourceName: "Company Website",
    attributes: [
      "Company Name", "Legal Name", "Address", "City", "State", "Zip Code",
      "Country", "Phone Number", "Email ID", "Website URL", "Website",
      "Industry / Sector", "Industry", "CEO / Founder", "LinkedIn URL", "Twitter URL",
      "HQ Location",
    ],
    buildUrl: (company) => `https://www.${slug(company)}.com`,
  },
  {
    id: "sec_data",
    label: "SEC Data",
    sourceName: "SEC EDGAR",
    attributes: [
      "CIK", "Ticker Symbol", "Revenue", "Net Income", "EBITDA",
      "Total Assets", "Liabilities", "Shares Outstanding", "SIC Code",
    ],
    buildUrl: (company) =>
      `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=${encodeURIComponent(company)}&type=&dateb=&owner=include&count=40`,
  },
  {
    id: "stock_exchange",
    label: "Stock Exchange Data",
    sourceName: "Nasdaq",
    attributes: [
      "Stock Price (Current)", "Stock Price (Open)", "Stock Price (Close)",
      "Market Capitalization", "Exchange Name", "Trading Status",
    ],
    buildUrl: (company) =>
      `https://www.nasdaq.com/market-activity/stocks/${slug(company)}`,
  },
  {
    id: "registry_data",
    label: "Registry Data Extraction",
    sourceName: "California SOS",
    attributes: [
      "Registration Number", "Incorporation Date", "Company Status", "Status",
      "Entity Type", "Jurisdiction", "LEI", "Office Address", "Ownership %",
      "Parent Name", "Ultimate Parent", "Subsidiary Name", "Hierarchy Level",
      "Coverage",
    ],
    buildUrl: (company) =>
      `https://bizfileonline.sos.ca.gov/search/business?SearchCriteria=${encodeURIComponent(company)}`,
  },
];

export const findWorkflowByLabel = (label: string): WorkflowSource | undefined =>
  workflowSources.find((w) => w.label.trim().toLowerCase() === label.trim().toLowerCase());

export const findWorkflowById = (id: string): WorkflowSource | undefined =>
  workflowSources.find((w) => w.id === id);

/**
 * Given an attribute name and the set of workflows that ran for the job,
 * return the source refs (name + URL) the user can click in the HITL review.
 *
 * Multi-workflow handling: if the attribute is claimed by more than one of the
 * selected workflows, all matching sources are returned. If none match, an
 * empty array is returned (the UI shows "No source available").
 */
export function buildSourceRefsForAttribute(
  attributeName: string,
  selectedWorkflowIds: string[],
  companyName: string,
): { name: string; url: string }[] {
  const refs: { name: string; url: string }[] = [];
  for (const id of selectedWorkflowIds) {
    const wf = findWorkflowById(id);
    if (!wf) continue;
    if (wf.attributes.includes(attributeName)) {
      refs.push({ name: wf.sourceName, url: wf.buildUrl(companyName) });
    }
  }
  return refs;
}

/** Resolve a list of workflow labels (from job.tier) to workflow source IDs. */
export function resolveWorkflowIdsFromLabels(labels: string[]): WorkflowSourceId[] {
  const ids: WorkflowSourceId[] = [];
  for (const label of labels) {
    const wf = findWorkflowByLabel(label);
    if (wf) ids.push(wf.id);
  }
  return ids;
}
