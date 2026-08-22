export interface TemplateNode {
  type: string;
  label: string;
  config: Record<string, any>;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  useCases: string[];
  steps: TemplateNode[];
  sampleHeaders: string[];
}

export const TEMPLATE_CATEGORIES = [
  "All",
  "Data Quality",
  "HR & People",
  "Finance",
  "Sales & CRM",
  "E-Commerce",
  "Analytics",
];

export const TEMPLATES: Template[] = [
  {
    id: "dedupe-customer-list",
    name: "Deduplicate customer list by email",
    description: "Remove duplicate customer records, keeping one row per unique email address. Drops rows with missing emails first.",
    category: "Data Quality",
    tags: ["dedupe", "email", "customers"],
    difficulty: "Beginner",
    useCases: ["CRM cleanup", "Email campaign prep", "Before any customer import"],
    steps: [
      { type: "source", label: "Source", config: { mode: "upload" } },
      { type: "nulls", label: "Handle Nulls", config: { column: "email", strategy: "drop_row" } },
      { type: "dedupe", label: "Deduplicate", config: {} },
      { type: "sorter", label: "Sorter", config: { column: "email", direction: "asc" } },
      { type: "target", label: "Target", config: { mode: "preview" } },
    ],
    sampleHeaders: ["id", "name", "email", "phone", "created_at"],
  },
  {
    id: "hr-salary-cleanup",
    name: "HR salary data cleanup",
    description: "Clean up an exported HR sheet — drop incomplete records, standardize department names, add a sequence ID, and sort by salary descending.",
    category: "HR & People",
    tags: ["hr", "salary", "cleanup"],
    difficulty: "Intermediate",
    useCases: ["Payroll prep", "HR reporting", "Before loading into HRIS"],
    steps: [
      { type: "source", label: "Source", config: { mode: "upload" } },
      { type: "nulls", label: "Handle Nulls", config: { column: "salary", strategy: "drop_row" } },
      { type: "nulls", label: "Handle Nulls", config: { column: "department", strategy: "fill_na" } },
      { type: "filter", label: "Filter", config: { column: "salary", op: "gt", value: "0" } },
      { type: "sequence", label: "Sequence Generator", config: { outputColumn: "employee_id", startAt: 1001, step: 1 } },
      { type: "sorter", label: "Sorter", config: { column: "salary", direction: "desc" } },
      { type: "target", label: "Target", config: { mode: "preview" } },
    ],
    sampleHeaders: ["name", "department", "salary", "hire_date", "manager"],
  },
  {
    id: "sales-pipeline-report",
    name: "Sales pipeline report",
    description: "Prepare a sales pipeline report — filter to open deals only, rank by deal value, and add a sequence number for the leaderboard.",
    category: "Sales & CRM",
    tags: ["sales", "crm", "deals", "ranking"],
    difficulty: "Intermediate",
    useCases: ["Weekly sales review", "CRM data export", "Sales leaderboard"],
    steps: [
      { type: "source", label: "Source", config: { mode: "upload" } },
      { type: "filter", label: "Filter", config: { column: "stage", op: "neq", value: "Closed Lost" } },
      { type: "filter", label: "Filter", config: { column: "deal_value", op: "gt", value: "0" } },
      { type: "nulls", label: "Handle Nulls", config: { column: "deal_value", strategy: "fill_zero" } },
      { type: "rank", label: "Rank", config: { column: "deal_value", outputColumn: "deal_rank", direction: "desc" } },
      { type: "sorter", label: "Sorter", config: { column: "deal_value", direction: "desc" } },
      { type: "target", label: "Target", config: { mode: "preview" } },
    ],
    sampleHeaders: ["deal_name", "owner", "stage", "deal_value", "close_date", "account"],
  },
  {
    id: "ecommerce-order-summary",
    name: "E-commerce order summary by customer",
    description: "Aggregate orders to get total spend per customer — filter to completed orders, group by customer, sum the order values.",
    category: "E-Commerce",
    tags: ["orders", "aggregation", "customers", "shopify"],
    difficulty: "Intermediate",
    useCases: ["Customer LTV calculation", "Shopify export analysis", "Before loading to Postgres"],
    steps: [
      { type: "source", label: "Source", config: { mode: "upload" } },
      { type: "filter", label: "Filter", config: { column: "status", op: "eq", value: "completed" } },
      { type: "nulls", label: "Handle Nulls", config: { column: "customer_email", strategy: "drop_row" } },
      { type: "aggregator", label: "Aggregator", config: { groupBy: "customer_email", targetColumn: "order_total", fn: "sum" } },
      { type: "rank", label: "Rank", config: { column: "order_total", outputColumn: "customer_rank", direction: "desc" } },
      { type: "sorter", label: "Sorter", config: { column: "order_total", direction: "desc" } },
      { type: "target", label: "Target", config: { mode: "preview" } },
    ],
    sampleHeaders: ["order_id", "customer_email", "status", "order_total", "created_at", "product"],
  },
  {
    id: "finance-expense-report",
    name: "Finance expense report by category",
    description: "Summarize expense data by category — filter out pending items, group by category, sum the amounts, and rank by spend.",
    category: "Finance",
    tags: ["finance", "expenses", "aggregation"],
    difficulty: "Beginner",
    useCases: ["Monthly expense review", "Budget reporting", "Accounting data prep"],
    steps: [
      { type: "source", label: "Source", config: { mode: "upload" } },
      { type: "filter", label: "Filter", config: { column: "status", op: "neq", value: "pending" } },
      { type: "nulls", label: "Handle Nulls", config: { column: "amount", strategy: "fill_zero" } },
      { type: "aggregator", label: "Aggregator", config: { groupBy: "category", targetColumn: "amount", fn: "sum" } },
      { type: "sorter", label: "Sorter", config: { column: "amount", direction: "desc" } },
      { type: "target", label: "Target", config: { mode: "preview" } },
    ],
    sampleHeaders: ["date", "category", "amount", "status", "submitted_by", "description"],
  },
  {
    id: "product-inventory-cleanup",
    name: "Product inventory cleanup",
    description: "Clean up an inventory export — remove out-of-stock items, filter to active products, rename columns to match your DB schema, and add a sequence ID.",
    category: "E-Commerce",
    tags: ["inventory", "products", "rename", "sequence"],
    difficulty: "Intermediate",
    useCases: ["Before Shopify import", "Inventory DB load", "Product feed preparation"],
    steps: [
      { type: "source", label: "Source", config: { mode: "upload" } },
      { type: "filter", label: "Filter", config: { column: "status", op: "eq", value: "active" } },
      { type: "filter", label: "Filter", config: { column: "stock_quantity", op: "gt", value: "0" } },
      { type: "nulls", label: "Handle Nulls", config: { column: "price", strategy: "drop_row" } },
      { type: "rename", label: "Rename", config: { from: "stock_quantity", to: "qty_available" } },
      { type: "sequence", label: "Sequence Generator", config: { outputColumn: "product_seq_id", startAt: 1, step: 1 } },
      { type: "target", label: "Target", config: { mode: "preview" } },
    ],
    sampleHeaders: ["product_id", "name", "price", "stock_quantity", "status", "category"],
  },
  {
    id: "analytics-event-aggregation",
    name: "Web analytics event aggregation",
    description: "Aggregate raw event logs by page — filter to pageview events only, group by page URL, count total views, and rank the most visited pages.",
    category: "Analytics",
    tags: ["analytics", "events", "aggregation", "pageviews"],
    difficulty: "Intermediate",
    useCases: ["Web analytics reporting", "Content performance", "GA export processing"],
    steps: [
      { type: "source", label: "Source", config: { mode: "upload" } },
      { type: "filter", label: "Filter", config: { column: "event_type", op: "eq", value: "pageview" } },
      { type: "nulls", label: "Handle Nulls", config: { column: "page_url", strategy: "drop_row" } },
      { type: "aggregator", label: "Aggregator", config: { groupBy: "page_url", targetColumn: "session_id", fn: "count" } },
      { type: "rename", label: "Rename", config: { from: "session_id", to: "total_views" } },
      { type: "rank", label: "Rank", config: { column: "total_views", outputColumn: "page_rank", direction: "desc" } },
      { type: "sorter", label: "Sorter", config: { column: "total_views", direction: "desc" } },
      { type: "target", label: "Target", config: { mode: "preview" } },
    ],
    sampleHeaders: ["event_id", "event_type", "page_url", "session_id", "user_id", "timestamp"],
  },
  {
    id: "employee-onboarding-scd",
    name: "Employee change detection (SCD)",
    description: "Compare today's employee export against a snapshot to detect who joined, who changed department, and who left — using Update Strategy.",
    category: "HR & People",
    tags: ["scd", "change detection", "hr", "advanced"],
    difficulty: "Advanced",
    useCases: ["HRIS sync", "Payroll change detection", "Audit trail generation"],
    steps: [
      { type: "source", label: "Source", config: { mode: "upload" } },
      { type: "nulls", label: "Handle Nulls", config: { column: "employee_id", strategy: "drop_row" } },
      { type: "dedupe", label: "Deduplicate", config: {} },
      { type: "updateStrategy", label: "Update Strategy", config: { keyColumn: "employee_id", compareColumns: ["department", "salary", "title"], insertValue: "INSERT", updateValue: "UPDATE", deleteValue: "DELETE" } },
      { type: "filter", label: "Filter", config: { column: "_scd_action", op: "neq", value: "NOCHANGE" } },
      { type: "target", label: "Target", config: { mode: "preview" } },
    ],
    sampleHeaders: ["employee_id", "name", "department", "salary", "title", "hire_date"],
  },
];