interface PayrollResult {
  gross_salary: number
  basic_salary: number
  hra: number
  special_allowance: number
  pf_employee: number
  pf_employer: number
  esi_employee: number
  esi_employer: number
  professional_tax: number
  tds: number
  lop_deduction: number
  total_deductions: number
  net_salary: number
  lop_days: number
  days_present: number
  working_days: number
}

function calculateKarnatakaPT(grossMonthly: number): number {
  if (grossMonthly <= 15000) return 0
  if (grossMonthly <= 25000) return 150
  if (grossMonthly <= 35000) return 175
  return 200
}

function calculatePF(basicSalary: number): { employee: number; employer: number } {
  // PF is capped at ₹15,000 basic for calculation
  const effectiveBasic = Math.min(basicSalary, 15000)
  const employee = Math.round(effectiveBasic * 0.12)
  const employer = Math.round(effectiveBasic * 0.12)
  return { employee, employer }
}

function calculateESI(grossSalary: number): { employee: number; employer: number } {
  // ESI applies ONLY if grossSalary <= 21000
  if (grossSalary > 21000) {
    return { employee: 0, employer: 0 }
  }
  
  const employee = Math.round(grossSalary * 0.0075) // 0.75%
  const employer = Math.round(grossSalary * 0.0325) // 3.25%
  return { employee, employer }
}

function calculateTDS(grossMonthlyForTDS: number): number {
  // Simplified TDS: if grossMonthly > 50000 → 10% of amount above 50000
  if (grossMonthlyForTDS <= 50000) return 0
  return Math.round((grossMonthlyForTDS - 50000) * 0.10)
}

function calculatePayroll(
  employee: {
    gross_salary: number
    basic_salary: number
    hra: number
    special_allowance: number
  },
  workingDays: number,
  daysPresent: number
): PayrollResult {
  const lopDays = workingDays - daysPresent
  const lopDeductionPerDay = employee.gross_salary / workingDays
  const lopDeduction = Math.round(lopDays * lopDeductionPerDay)
  
  const effectiveGross = employee.gross_salary - lopDeduction
  const effectiveBasic = employee.basic_salary - Math.round(lopDays * (employee.basic_salary / workingDays))
  
  const pf = calculatePF(effectiveBasic)
  const esi = calculateESI(effectiveGross)
  const pt = calculateKarnatakaPT(effectiveGross)
  const tds = calculateTDS(effectiveGross)
  
  const totalDeductions = pf.employee + esi.employee + pt + tds + lopDeduction
  const netSalary = Math.round(effectiveGross - totalDeductions)
  
  return {
    gross_salary: employee.gross_salary,
    basic_salary: employee.basic_salary,
    hra: employee.hra,
    special_allowance: employee.special_allowance,
    pf_employee: pf.employee,
    pf_employer: pf.employer,
    esi_employee: esi.employee,
    esi_employer: esi.employer,
    professional_tax: pt,
    tds,
    lop_deduction: lopDeduction,
    total_deductions: totalDeductions,
    net_salary: netSalary,
    lop_days: lopDays,
    days_present: daysPresent,
    working_days: workingDays
  }
}

export { calculatePayroll, calculateKarnatakaPT, calculatePF, calculateESI, calculateTDS, PayrollResult }
