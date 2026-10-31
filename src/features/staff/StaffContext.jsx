import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/context/AuthContext.jsx'
import * as employeesApi from './employeesService.js'
import * as shiftsApi from './shiftsService.js'
import { INITIAL_ROLE_DEFAULTS } from './staffData.js'

const StaffContext = createContext(null)
export function StaffProvider({ children }) {
  const { user } = useAuth()
  const [employees, setEmployees] = useState([])
  const [roleDefaults, setRoleDefaults] = useState(INITIAL_ROLE_DEFAULTS)
  const [roles, setRoles] = useState([])
  const [rolesError, setRolesError] = useState('')
  const [activeShift, setActiveShift] = useState(null)
  const [activeShifts, setActiveShifts] = useState([])
  const [history, setHistory] = useState([])
  const [employeesLoading, setEmployeesLoading] = useState(false)
  const [employeeDetailLoading, setEmployeeDetailLoading] = useState(false)
  const [employeesError, setEmployeesError] = useState('')
  const [shiftsLoading, setShiftsLoading] = useState(false)
  const [shiftsError, setShiftsError] = useState('')
  const [saving, setSaving] = useState(false)
  const employeeRequest = useRef(0)
  const shiftRequest = useRef(0)
  const lastEmployeeQuery = useRef('')
  const employeeLoadingNow = useRef(false)
  const shiftMutationInFlight = useRef(false)
  const initializedUser = useRef(null)

  const refreshEmployees = useCallback(async (filters = {}, { force = false } = {}) => {
    const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, value]) => value != null && String(value).trim() !== ''))
    const key = JSON.stringify(cleanFilters)
    if (!force && lastEmployeeQuery.current === key && employeeLoadingNow.current) return
    const changedQuery = lastEmployeeQuery.current !== key
    lastEmployeeQuery.current = key
    employeeLoadingNow.current = true
    if (changedQuery) setEmployees([])
    const requestId = ++employeeRequest.current
    setEmployeesLoading(true); setEmployeesError('')
    try {
      const rows = await employeesApi.getEmployees(cleanFilters)
      if (requestId === employeeRequest.current) setEmployees(rows)
      return rows
    } catch (error) {
      if (requestId === employeeRequest.current) { setEmployees([]); setEmployeesError(error.message || 'Could not load employees.') }
      return null
    } finally {
      if (requestId === employeeRequest.current) { setEmployeesLoading(false); employeeLoadingNow.current = false }
    }
  }, [])

  const fetchEmployee = useCallback(async (id) => {
    setEmployeeDetailLoading(true)
    try {
      const employee = await employeesApi.getEmployeeById(id)
      setEmployees((current) => current.some((item) => item.id === employee.id)
        ? current.map((item) => item.id === employee.id ? employee : item) : [...current, employee])
      return employee
    } catch (error) { setEmployeesError(error.message || 'Could not load this employee.'); return null }
    finally { setEmployeeDetailLoading(false) }
  }, [])

  const createEmployee = useCallback(async (data) => {
    if (saving) return null
    setSaving(true)
    try {
      const created = await employeesApi.createEmployee(data)
      setEmployees((current) => [created, ...current.filter((item) => item.id !== created.id)])
      setEmployeesError('')
      return created
    } catch (error) { setEmployeesError(error.message || 'Could not create employee.'); return null }
    finally { setSaving(false) }
  }, [saving])

  const updateEmployee = useCallback(async (id, data) => {
    if (saving) return null
    setSaving(true)
    try {
      const updated = await employeesApi.updateEmployee(id, data)
      setEmployees((current) => current.map((item) => item.id === id ? updated : item))
      setEmployeesError('')
      return updated
    } catch (error) { setEmployeesError(error.message || 'Could not update employee.'); return null }
    finally { setSaving(false) }
  }, [saving])

  const setEmployeeStatus = useCallback(async (id, status) => {
    const employee = employees.find((item) => item.id === id)
    if (!employee) return null
    return updateEmployee(id, { ...employee, status, branches: employee.branches, hiredAt: employee.hiredAt })
  }, [employees, updateEmployee])

  const updateEmployeeBranches = useCallback(async (id, branchIds) => {
    let employee = employees.find((item) => item.id === id)
    if (!employee) employee = await employeesApi.getEmployeeById(id).catch(() => null)
    if (!employee) return null
    setEmployees((current) => current.some((item) => item.id === id) ? current : [...current, employee])
    return updateEmployee(id, { ...employee, branches: branchIds })
  }, [employees, updateEmployee])

  const refreshShifts = useCallback(async (branchId, filters = {}) => {
    const requestId = ++shiftRequest.current
    setActiveShift(null); setActiveShifts([]); setHistory([])
    setShiftsLoading(true); setShiftsError('')
    try {
      const [current, list, active] = await Promise.all([
        shiftsApi.getCurrentShift(branchId),
        shiftsApi.getShifts(filters),
        shiftsApi.getShifts({ branchId, status: 'active' }),
      ])
      if (requestId === shiftRequest.current) {
        setActiveShift(current)
        setHistory(list)
        setActiveShifts(active)
      }
      return { current, list, active }
    } catch (error) {
      if (requestId === shiftRequest.current) setShiftsError(error.message || 'Could not load shifts.')
      return null
    } finally {
      if (requestId === shiftRequest.current) setShiftsLoading(false)
    }
  }, [])

  const startShift = useCallback(async (data) => {
    if (saving || shiftMutationInFlight.current) return null
    shiftMutationInFlight.current = true
    setSaving(true)
    try {
      const started = await shiftsApi.startShift(data)
      setActiveShift(started)
      await refreshShifts(data.branchId)
      return started
    } catch (error) { setShiftsError(error.message || 'Could not start shift.'); return null }
    finally { shiftMutationInFlight.current = false; setSaving(false) }
  }, [saving, refreshShifts])

  const endShift = useCallback(async ({ shift, countedCash, note }) => {
    if (saving || shiftMutationInFlight.current || !shift?.id) return null
    shiftMutationInFlight.current = true
    setSaving(true)
    try {
      const result = await shiftsApi.endShift(shift.id, { countedCash, note })
      await refreshShifts(shift.branchId)
      return result ?? { success: true }
    } catch (error) { setShiftsError(error.message || 'Could not end shift.'); return null }
    finally { shiftMutationInFlight.current = false; setSaving(false) }
  }, [saving, refreshShifts])

  const loadRoles = useCallback(async () => {
    try { setRoles(await employeesApi.getEmployeeRoles()); setRolesError('') }
    catch (error) { setRolesError(error.message || 'Could not load employee roles.') }
  }, [])

  // Role defaults are intentionally local: Swagger documents GET roles only, no write endpoint.
  const saveRoleDefaults = useCallback((next) => setRoleDefaults(next), [])

  useEffect(() => {
    if (!user) {
      initializedUser.current = null
      setEmployees([]); setHistory([]); setActiveShift(null); setActiveShifts([])
      lastEmployeeQuery.current = ''
      return
    }
    const userKey = String(user.id || user.email || 'signed-in')
    if (initializedUser.current === userKey) return
    initializedUser.current = userKey
    refreshEmployees({}, { force: true })
    loadRoles()
  }, [user, refreshEmployees, loadRoles])

  const value = useMemo(() => ({
    employees, roleDefaults, roles, activeShift, activeShifts, otherShifts: activeShifts.filter((s) => s.id !== activeShift?.id),
    history, employeesLoading, employeeDetailLoading, employeesError, rolesError, shiftsLoading, shiftsError, saving,
    refreshEmployees, fetchEmployee, createEmployee, updateEmployee, setEmployeeStatus, updateEmployeeBranches,
    refreshShifts, startShift, endShift, saveRoleDefaults,
  }), [employees, roleDefaults, roles, activeShift, activeShifts, history, employeesLoading, employeeDetailLoading, employeesError, rolesError, shiftsLoading, shiftsError, saving, refreshEmployees, fetchEmployee, createEmployee, updateEmployee, setEmployeeStatus, updateEmployeeBranches, refreshShifts, startShift, endShift, saveRoleDefaults])
  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>
}
export function useStaff() {
  const context = useContext(StaffContext)
  if (!context) throw new Error('useStaff must be used inside <StaffProvider>')
  return context
}
export const isOnShift = (employee, activeShift) => Boolean(activeShift && String(activeShift.employeeId) === String(employee.id))
