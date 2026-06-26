export interface IncomeItem {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'weekly' | 'one-time';
  category: 'allowance' | 'job' | 'stipend' | 'scholarship' | 'other';
}

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'weekly' | 'daily' | 'one-time';
  category: 'fees' | 'rent' | 'food' | 'transport' | 'gear' | 'social' | 'books' | 'other';
}

export interface AcademicConfig {
  termMonths: number; // e.g. 8 months for typical academic year, or 12
  currency: string;
  initialSavings: number;
  targetSavingsGoal?: number;
}

export interface BudgetProfile {
  academic: AcademicConfig;
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
}

export interface AIAdviceRequest {
  profile: BudgetProfile;
  question?: string;
}

export interface AIAdviceResponse {
  summary: string;
  recommendations: Array<{
    title: string;
    description: string;
    estimatedSavings: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  studentHacks: string[];
}
