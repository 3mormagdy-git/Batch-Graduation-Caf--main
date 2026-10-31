import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/context/AuthContext.jsx'
import { useStaff } from '@/features/staff/StaffContext.jsx'
import * as service from './branchesService.js'
import Toast from './components/Toast.jsx'

// Single source of truth for branches, the active branch and per-branch menu availability.
// Branch CRUD goes through branchesService; menu availability and active branch remain local-only. Employees are NOT copied
// here: assignment changes go to StaffContext so employee.branches stays canonical.
const BranchContext = createContext(null)

export function BranchProvider({ children }) {
  const { user } = useAuth()
  const { employees, updateEmployeeBranches } = useStaff()
  const [branches, setBranches] = useState([])
  const [availability, setAvailability] = useState({})
  const [activeBranchId, setActiveBranchId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [toast, setToast] = useState(null)
  const timer = useRef(null)
  const loadingNow = useRef(false)
  const signedIn = Boolean(user)

  // Loads the list from the API (once signed in). Failures are shown, never replaced by mock data.
  const loadBranches = useCallback(async (silent = false) => {
    if (loadingNow.current) return
    loadingNow.current = true
    if (silent) setRefreshing(true); else setLoading(true)
    try {
      const list = await service.getBranches()
      setBranches(list)
      setAvailability(await service.getMenuAvailability(list))
      const remembered = await service.getActiveBranchId()
      setActiveBranchId((current) => [current, remembered].find((id) => list.some((b) => b.id === id)) ?? list[0]?.id ?? null)
      setLoadError(null)
    } catch (error) {
      setLoadError(error.message || 'Could not load branches.')
    } finally {
      loadingNow.current = false
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (signedIn) loadBranches()
    else { setBranches([]); setActiveBranchId(null); setLoadError(null); setLoading(true) }
  }, [signedIn, loadBranches])

  useEffect(() => () => clearTimeout(timer.current), [])

  const notify = useCallback((message, type = 'success') => {
    clearTimeout(timer.current)
    setToast({ message, type, id: Date.now() })
    timer.current = setTimeout(() => setToast(null), 3200)
  }, [])

  const upsert = (branch) => setBranches((list) => (list.some((item) => item.id === branch.id)
    ? list.map((item) => (item.id === branch.id ? branch : item)) : [...list, branch]))
  // Runs a service call, reports failures as a toast and returns null so callers can stop.
  const run = useCallback(async (action, failure) => {
    try { return await action() } catch (error) { notify(error.message || failure, 'error'); return null }
  }, [notify])
  const current = (id) => branches.find((branch) => branch.id === id)

  // Re-fetches one branch from the API. Resolves to the branch, or null (error is returned in `error`).
  const refreshBranch = useCallback(async (id) => {
    try {
      const branch = await service.getBranchById(id)
      upsert(branch)
      return { branch }
    } catch (error) { return { branch: null, error } }
  }, [])

  const createBranch = useCallback(async (data) => {
    const branch = await run(() => service.createBranch(data), 'Could not create the branch.')
    if (!branch) return null
    upsert(branch)
    setAvailability(await service.getMenuAvailability([branch, ...branches]))
    return branch
  }, [run, branches])

  const updateBranch = useCallback(async (id, data) => {
    const base = current(id)
    if (!base) return null
    const merged = { ...base, ...data, settings: { ...base.settings, ...data.settings } }
    const branch = await run(() => service.updateBranch(id, merged), 'Could not save the branch.')
    if (branch) upsert(branch)
    return branch
  }, [run, branches])

  const setBranchStatus = useCallback(async (id, open) => {
    const base = current(id)
    if (!base) return null
    const branch = await run(() => service.updateBranchStatus(id, open, base), 'Could not change the status.')
    if (branch) { upsert(branch); notify(`${branch.name} is now ${open ? 'open' : 'closed'}.`) }
    return branch
  }, [run, notify, branches])

  const saveSettings = useCallback(async (id, settings) => {
    const base = current(id)
    if (!base) return null
    const branch = await run(() => service.updateBranchSettings(id, settings, base), 'Could not save the settings.')
    if (branch) { upsert(branch); notify('Settings saved.') }
    return branch
  }, [run, notify, branches])

  const assignEmployees = useCallback(async (branchId, employeeIds) => {
    const fresh = employeeIds.filter((id) => employees.some((e) => e.id === id && !e.branches.includes(branchId)))
    if (!fresh.length) return false
    const updated = await Promise.all(fresh.map((id) => {
      const employee = employees.find((item) => item.id === id)
      return updateEmployeeBranches(id, [...employee.branches, branchId])
    }))
    if (updated.some((item) => !item)) {
      notify('Some employee assignments could not be saved. Refresh the staff list and retry.', 'error')
      return false
    }
    notify(fresh.length === 1 ? 'Employee assigned.' : `${fresh.length} employees assigned.`)
    return true
  }, [employees, updateEmployeeBranches, notify])

  const unassignEmployee = useCallback(async (branchId, employeeId) => {
    const employee = employees.find((e) => e.id === employeeId)
    if (!employee || !employee.branches.includes(branchId)) return false
    if (employee.branches.length <= 1) {
      notify(`${employee.name} must stay assigned to at least one branch.`, 'error')
      return false
    }
    const updated = await updateEmployeeBranches(employeeId, employee.branches.filter((id) => id !== branchId))
    if (!updated) {
      notify('Could not unassign the employee.', 'error')
      return false
    }
    notify(`${employee.name} unassigned.`)
    return true
  }, [employees, updateEmployeeBranches, notify])

  const setMenuAvailability = useCallback(async (branchId, sku, available) => {
    setAvailability((current) => ({ ...current, [branchId]: { ...current[branchId], [sku]: available } })) // instant
    const done = await run(() => service.updateMenuAvailability(branchId, sku, available), 'Could not update availability.')
    if (!done) setAvailability(await service.getMenuAvailability())
  }, [run])

  const switchBranch = useCallback(async (branchId) => {
    const id = await run(() => service.switchBranch(branchId), 'Could not switch branch.')
    if (!id) return
    setActiveBranchId(id)
    notify(`Switched to ${branches.find((b) => b.id === id)?.name}.`)
  }, [run, notify, branches])

  const value = useMemo(() => ({
    branches, loading, loadError, refreshing, availability, activeBranchId, loadBranches, refreshBranch,
    activeBranch: branches.find((branch) => branch.id === activeBranchId) || null,
    getBranch: (id) => branches.find((branch) => branch.id === id) || null,
    createBranch, updateBranch, setBranchStatus, saveSettings, assignEmployees, unassignEmployee,
    setMenuAvailability, switchBranch, notify,
  }), [branches, loading, loadError, refreshing, loadBranches, refreshBranch, availability, activeBranchId, createBranch, updateBranch, setBranchStatus, saveSettings, assignEmployees, unassignEmployee, setMenuAvailability, switchBranch, notify])

  return (
    <BranchContext.Provider value={value}>
      {children}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </BranchContext.Provider>
  )
}

export function useBranches() {
  const context = useContext(BranchContext)
  if (!context) throw new Error('useBranches must be used inside <BranchProvider>')
  return context
}

export const staffCount = (employees, branchId) => employees.filter((employee) => employee.branches.includes(branchId)).length
