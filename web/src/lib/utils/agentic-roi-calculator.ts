/**
 * Agentic ROI Calculation Engine
 * 
 * Calculates "Manual Tax" (operational overhead) and capacity reclaimed
 * by implementing AI agents using conservative, research-backed assumptions.
 */

export interface AgenticROIInputs {
	peopleImpacted: number;
	annualSalary: number;
	repetitiveTasks: number; // 0-40%
	focusLoss: number; // 0-40%
	manualResearch: number; // 0-40%
	manualHandoffs: number; // 0-40%
}

export interface AgenticROIResults {
	// Baseline metrics
	totalCapacityHours: number;
	hourlyRate: number;
	
	// Manual tax calculations
	manualTaxPercentage: number;
	hoursPerPersonPerWeek: number;
	totalTeamHoursPerWeek: number;
	
	// Reclamation metrics
	timeReclaimedAnnual: number; // hours
	valueReclaimedAnnual: number; // dollars
	valueReclaimedMonthly: number; // dollars
	paybackDays: number;
	
	// Distribution for visualization
	currentDistribution: {
		overhead: number;
		highValue: number;
	};
	futureDistribution: {
		remainingOverhead: number;
		reclaimed: number;
		highValue: number;
	};
}

// Constants
const PRODUCTIVE_CAPACITY_HOURS = 1850; // hours per person per year
const HOURLY_RATE_DIVISOR = 2000; // standard annual hours for salary calculation
const AGENTIC_EFFICIENCY = 0.40; // 40% of manual friction can be reclaimed
const HOURS_PER_WEEK = 40;
const WORK_WEEKS_PER_YEAR = 48;
const WORKING_DAYS_PER_YEAR = 240;
const TRAINING_COST = 1495; // fixed cost

/**
 * Calculate hourly rate from annual salary
 * Simple division by 2,000 hours (vs the existing calculator's 1.35x multiplier approach)
 */
export function calculateHourlyRate(annualSalary: number): number {
	return annualSalary / HOURLY_RATE_DIVISOR;
}

/**
 * Calculate total manual tax percentage from individual friction sources
 */
export function calculateManualTaxPercentage(
	repetitiveTasks: number,
	focusLoss: number,
	manualResearch: number,
	manualHandoffs: number
): number {
	return repetitiveTasks + focusLoss + manualResearch + manualHandoffs;
}

/**
 * Calculate hours per person per week consumed by manual tax
 */
export function calculateHoursPerPersonPerWeek(manualTaxPercentage: number): number {
	return (manualTaxPercentage / 100) * HOURS_PER_WEEK;
}

/**
 * Calculate total team hours per week consumed by overhead
 */
export function calculateTotalTeamHours(
	peopleImpacted: number,
	hoursPerPersonPerWeek: number
): number {
	return peopleImpacted * hoursPerPersonPerWeek;
}

/**
 * Calculate annual hours reclaimed through agentic efficiency
 */
export function calculateReclaimedHours(
	peopleImpacted: number,
	manualTaxPercentage: number
): number {
	const hoursPerPersonPerWeek = calculateHoursPerPersonPerWeek(manualTaxPercentage);
	const weeklyReclaimedPerPerson = hoursPerPersonPerWeek * AGENTIC_EFFICIENCY;
	return peopleImpacted * weeklyReclaimedPerPerson * WORK_WEEKS_PER_YEAR;
}

/**
 * Calculate annual dollar value of reclaimed time
 */
export function calculateReclaimedValue(
	reclaimedHours: number,
	hourlyRate: number
): number {
	return reclaimedHours * hourlyRate;
}

/**
 * Calculate payback period in days
 */
export function calculatePaybackDays(annualValue: number): number {
	if (annualValue <= 0) return Infinity;
	const dailyValue = annualValue / WORKING_DAYS_PER_YEAR;
	return TRAINING_COST / dailyValue;
}

/**
 * Calculate distribution percentages for visualization bars
 */
export function calculateDistribution(manualTaxPercentage: number): {
	current: { overhead: number; highValue: number };
	future: { remainingOverhead: number; reclaimed: number; highValue: number };
} {
	const overhead = manualTaxPercentage;
	const highValue = 100 - manualTaxPercentage;
	
	// Future distribution: 60% of manual tax remains, 40% is reclaimed
	const remainingOverhead = overhead * (1 - AGENTIC_EFFICIENCY);
	const reclaimed = overhead * AGENTIC_EFFICIENCY;
	
	return {
		current: {
			overhead,
			highValue
		},
		future: {
			remainingOverhead,
			reclaimed,
			highValue
		}
	};
}

/**
 * Main calculation function
 * Takes all inputs and returns comprehensive results
 */
export function calculateAgenticROI(inputs: AgenticROIInputs): AgenticROIResults {
	const hourlyRate = calculateHourlyRate(inputs.annualSalary);
	const totalCapacityHours = inputs.peopleImpacted * PRODUCTIVE_CAPACITY_HOURS;
	
	const manualTaxPercentage = calculateManualTaxPercentage(
		inputs.repetitiveTasks,
		inputs.focusLoss,
		inputs.manualResearch,
		inputs.manualHandoffs
	);
	
	const hoursPerPersonPerWeek = calculateHoursPerPersonPerWeek(manualTaxPercentage);
	const totalTeamHoursPerWeek = calculateTotalTeamHours(
		inputs.peopleImpacted,
		hoursPerPersonPerWeek
	);
	
	const timeReclaimedAnnual = calculateReclaimedHours(
		inputs.peopleImpacted,
		manualTaxPercentage
	);
	
	const valueReclaimedAnnual = calculateReclaimedValue(timeReclaimedAnnual, hourlyRate);
	const valueReclaimedMonthly = valueReclaimedAnnual / 12;
	const paybackDays = calculatePaybackDays(valueReclaimedAnnual);
	
	const distributions = calculateDistribution(manualTaxPercentage);
	
	return {
		totalCapacityHours,
		hourlyRate,
		manualTaxPercentage,
		hoursPerPersonPerWeek,
		totalTeamHoursPerWeek,
		timeReclaimedAnnual,
		valueReclaimedAnnual,
		valueReclaimedMonthly,
		paybackDays,
		currentDistribution: distributions.current,
		futureDistribution: distributions.future
	};
}

/**
 * Format currency values
 */
export function formatCurrency(value: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(value);
}

/**
 * Format hours with appropriate precision
 */
export function formatHours(hours: number): string {
	return new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 1
	}).format(hours);
}

/**
 * Format payback period in days
 */
export function formatPaybackDays(days: number): string {
	if (!isFinite(days)) return 'N/A';
	return `${Math.round(days)} days`;
}
