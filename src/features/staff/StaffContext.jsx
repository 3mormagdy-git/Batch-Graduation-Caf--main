import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  BRANCHES, CURRENT_EMPLOYEE_ID, INITIAL_ACTIVE_SHIFT, INITIAL_EMPLOYEES, INITIAL_OTHER_SHIFTS,
  INITIAL_ROLE_DEFAULTS, INITIAL_SHIFT_HISTORY, differenceOf, expectedInDrawer, formatClock, formatDate, initialsOf,
} from './staffData.js'

// In-memory state shared by every /staff page. There is no backend yet; swap these actions
// for API calls later. State resets on a full page reload.
const StaffContext = createContext(null)

const TONES = ['pink', 'sand', 'mint', 'amber']

export function StaffProvider({ children }) {
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES)
  const [roleDefaults, setRoleDefaults] = useState(INITIAL_ROLE_DEFAULTS)
  const [activeShift, setActiveShift] = useState(INITIAL_ACTIVE_SHIFT)
  const [otherShifts] = useState(INITIAL_OTHER_SHIFTS)
  const [history, setHistory] = useState(INITIAL_SHIFT_HISTORY)

  const addEmployee = useCallback((data) => {
    const employee = {
      ...data,
      id: `e_${Date.now()}`,
      initials: initialsOf(data.name),
      status: 'active',
      onShift: false,
      joined: formatDate(new Date()),
      tone: TONES[employees.length % TONES.length],
    }
    setEmployees((list) => [...list, employee])
    return employee
  }, [employees.length])

  const updateEmployee = useCallback((id, data) => {
    setEmployees((list) => list.map((employee) => (employee.id === id ? { ...employee, ...data } : employee)))
  }, [])

  const setEmployeeStatus = useCallback((id, status) => {
    setEmployees((list) => list.map((employee) => (employee.id === id ? { ...employee, status } : employee)))
  }, [])

  const saveRoleDefaults = useCallback((next) => setRoleDefaults(next), [])

  const startShift = useCallback(({ branch, register, openingFloat }) => {
    const now = new Date()
    setActiveShift({
      employeeId: CURRENT_EMPLOYEE_ID,
      branch,
      register,
      startedAt: now.getTime(),
      startedLabel: formatClock(now),
      periodLabel: `${formatDate(now)}, ${formatClock(now)}`,
      orders: 0,
      totalSales: 0,
      cashSales: 0,
      openingFloat,
    })
  }, [])

  // Closes the current shift, records it at the top of the history and returns the difference.
  const endShift = useCallback(({ counted, explanation }) => {
    const shift = activeShift
    const expected = expectedInDrawer(shift)
    const difference = differenceOf(expected, counted)
    const worker = employees.find((employee) => employee.id === shift.employeeId)
    setHistory((rows) => [{
      id: `h_${Date.now()}`,
      employee: worker?.name || 'Unknown',
      branch: shift.branch,
      period: shift.periodLabel,
      sales: shift.totalSales,
      expected,
      counted,
      difference,
      explanation,
    }, ...rows])
    setActiveShift(null)
    return difference
  }, [activeShift, employees])

  const value = useMemo(() => ({
    employees, roleDefaults, activeShift, otherShifts, history, branches: BRANCHES,
    addEmployee, updateEmployee, setEmployeeStatus, saveRoleDefaults, startShift, endShift,
  }), [employees, roleDefaults, activeShift, otherShifts, history, addEmployee, updateEmployee, setEmployeeStatus, saveRoleDefaults, startShift, endShift])

  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>
}

export function useStaff() {
  const context = useContext(StaffContext)
  if (!context) throw new Error('useStaff must be used inside <StaffProvider>')
  return context
}

// An employee is "on shift" if flagged so, or if they are the signed-in user with an open shift.
export const isOnShift = (employee, activeShift) => (
  employee.id === CURRENT_EMPLOYEE_ID ? Boolean(activeShift) : employee.onShift
)
