const TIME = /^([01]\d|2[0-3]):[0-5]\d$/
const CODE = /^[A-Z0-9]{2,6}$/

export const EMPTY_DETAILS = { name: '', code: '', area: '', phone: '', address: '', manager: '', opens: '08:00', closes: '23:00' }

export function validateDetails(values, branches, selfId) {
  const errors = {}
  if (!values.name.trim()) errors.name = 'Branch name is required.'
  else if (branches.some((b) => b.id !== selfId && b.name.toLowerCase() === values.name.trim().toLowerCase())) errors.name = 'A branch with this name already exists.'
  const code = values.code.trim().toUpperCase()
  if (!code) errors.code = 'Short code is required.'
  else if (!CODE.test(code)) errors.code = 'Use 2–6 letters or digits.'
  else if (branches.some((b) => b.id !== selfId && b.code.toUpperCase() === code)) errors.code = 'This code is already used by another branch.'
  if (!values.area.trim()) errors.area = 'Area / city is required.'
  if (!values.phone.trim()) errors.phone = 'Phone number is required.'
  else if (!/^[+\d][\d\s()-]*$/.test(values.phone.trim()) || values.phone.replace(/\D/g, '').length < 6) errors.phone = 'Enter a valid phone number.'
  if (!values.address.trim()) errors.address = 'Street address is required.'
  if (!TIME.test(values.opens)) errors.opens = 'Enter a valid opening time.'
  if (!TIME.test(values.closes)) errors.closes = 'Enter a valid closing time.'
  if (!errors.opens && !errors.closes && values.closes <= values.opens) errors.closes = 'Closing time must be after opening time.'
  return errors
}

// Settings are edited as strings in the form; toSettings() converts them once they validate.
export function validateSettings(values) {
  const errors = {}
  if (!/^[A-Za-z]{3}$/.test(values.currency.trim())) errors.currency = 'Use a 3-letter currency code (e.g. EGP).'
  const percent = (key, label) => {
    const raw = String(values[key]).trim()
    const number = Number(raw)
    if (raw === '' || Number.isNaN(number)) errors[key] = `${label} must be a number.`
    else if (number < 0 || number > 100) errors[key] = `${label} must be between 0 and 100.`
  }
  percent('vat', 'VAT')
  percent('serviceCharge', 'Service charge')
  if (values.acceptDelivery) {
    const raw = String(values.deliveryFee).trim()
    const number = Number(raw)
    if (raw === '' || Number.isNaN(number)) errors.deliveryFee = 'Delivery fee must be a number.'
    else if (number < 0) errors.deliveryFee = 'Delivery fee cannot be negative.'
  }
  if (values.receiptFooter.length > 80) errors.receiptFooter = 'Keep the footer within 80 characters.'
  return errors
}

export const toSettings = (values) => ({
  currency: values.currency.trim().toUpperCase(),
  vat: Number(values.vat),
  serviceCharge: Number(values.serviceCharge),
  acceptDelivery: values.acceptDelivery,
  deliveryFee: values.acceptDelivery ? Number(values.deliveryFee) : 0,
  receiptFooter: values.receiptFooter.trim(),
})
export const fromSettings = (settings) => ({ ...settings, vat: String(settings.vat), serviceCharge: String(settings.serviceCharge), deliveryFee: String(settings.deliveryFee) })
export const toDetails = (values) => ({ ...values, name: values.name.trim(), code: values.code.trim().toUpperCase(), area: values.area.trim(), phone: values.phone.trim(), address: values.address.trim() })
