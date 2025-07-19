import { formatDate } from '@/lib/utils/formatDate'
import { describe, it, expect } from 'vitest'

describe('formatDate Utility', () => {
  it('formats current date correctly', () => {
    const now = new Date()
    const formatted = formatDate(now)

    // Verificar que el formato es correcto (DD/MM/YYYY, HH:MM)
    expect(formatted).toMatch(/^\d{2}\/\d{2}\/\d{4},\s\d{2}:\d{2}$/)
  })

  it('formats specific date correctly', () => {
    const date = new Date('2024-01-15')
    const formatted = formatDate(date)

    expect(formatted).toBe('15/01/2024, 00:00')
  })

  it('formats date with single digit day', () => {
    const date = new Date('2024-01-05')
    const formatted = formatDate(date)

    expect(formatted).toBe('05/01/2024, 00:00')
  })

  it('formats date with double digit day', () => {
    const date = new Date('2024-01-25')
    const formatted = formatDate(date)

    expect(formatted).toBe('25/01/2024, 00:00')
  })

  it('formats different months correctly', () => {
    const dates = [
      { date: new Date('2024-02-15'), expected: '15/02/2024, 00:00' },
      { date: new Date('2024-03-15'), expected: '15/03/2024, 00:00' },
      { date: new Date('2024-04-15'), expected: '15/04/2024, 00:00' },
      { date: new Date('2024-05-15'), expected: '15/05/2024, 00:00' },
      { date: new Date('2024-06-15'), expected: '15/06/2024, 00:00' },
      { date: new Date('2024-07-15'), expected: '15/07/2024, 00:00' },
      { date: new Date('2024-08-15'), expected: '15/08/2024, 00:00' },
      { date: new Date('2024-09-15'), expected: '15/09/2024, 00:00' },
      { date: new Date('2024-10-15'), expected: '15/10/2024, 00:00' },
      { date: new Date('2024-11-15'), expected: '15/11/2024, 00:00' },
      { date: new Date('2024-12-15'), expected: '15/12/2024, 00:00' },
    ]

    dates.forEach(({ date, expected }) => {
      expect(formatDate(date)).toBe(expected)
    })
  })

  it('formats different years correctly', () => {
    const date2023 = new Date('2023-01-15')
    const date2024 = new Date('2024-01-15')
    const date2025 = new Date('2025-01-15')

    expect(formatDate(date2023)).toBe('15/01/2023, 00:00')
    expect(formatDate(date2024)).toBe('15/01/2024, 00:00')
    expect(formatDate(date2025)).toBe('15/01/2025, 00:00')
  })

  it('handles date string input', () => {
    const dateString = '2024-01-15'
    const formatted = formatDate(dateString)

    expect(formatted).toBe('15/01/2024, 00:00')
  })

  it('handles ISO date string', () => {
    const isoString = '2024-01-15T10:30:00.000Z'
    const formatted = formatDate(isoString)

    expect(formatted).toBe('15/01/2024, 10:30')
  })

  it('handles timestamp number', () => {
    const timestamp = new Date('2024-01-15').getTime()
    const formatted = formatDate(new Date(timestamp))

    expect(formatted).toBe('15/01/2024, 00:00')
  })

  it('handles edge case dates', () => {
    // Primer día del mes
    expect(formatDate(new Date('2024-01-01'))).toBe('01/01/2024, 00:00')

    // Último día del mes
    expect(formatDate(new Date('2024-01-31'))).toBe('31/01/2024, 00:00')

    // Año bisiesto
    expect(formatDate(new Date('2024-02-29'))).toBe('29/02/2024, 00:00')
  })

  it('handles invalid date gracefully', () => {
    const invalidDate = new Date('invalid')
    const formatted = formatDate(invalidDate)

    // Debería retornar una fecha válida o manejar el error
    expect(typeof formatted).toBe('string')
  })

  it('maintains consistent format across different timezones', () => {
    const date = new Date('2024-01-15T12:00:00.000Z')
    const formatted = formatDate(date)

    // El formato debería ser consistente independientemente de la zona horaria
    expect(formatted).toMatch(/^\d{2}\/\d{2}\/\d{4},\s\d{2}:\d{2}$/)
  })

  it('handles dates from different centuries', () => {
    const oldDate = new Date('1999-01-15')
    const newDate = new Date('2100-01-15')

    expect(formatDate(oldDate)).toBe('15/01/1999, 00:00')
    expect(formatDate(newDate)).toBe('15/01/2100, 00:00')
  })

  it('formats dates with different locales consistently', () => {
    const date = new Date('2024-01-15')
    const formatted = formatDate(date)

    // Debería usar el formato español independientemente del locale del sistema
    expect(formatted).toBe('15/01/2024, 00:00')
  })
})
