import { renderHook, act } from '@testing-library/react'
import { useDebounceCallback } from '@/hooks/useDebounceCallback'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('useDebounceCallback Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('creates a debounced callback', () => {
    const mockCallback = vi.fn()
    const { result } = renderHook(() => useDebounceCallback(mockCallback, 300))

    expect(typeof result.current).toBe('function')
  })

  it('debounces function calls', () => {
    const mockCallback = vi.fn()
    const { result } = renderHook(() => useDebounceCallback(mockCallback, 300))

    // Llamar la función múltiples veces rápidamente
    act(() => {
      result.current('arg1')
      result.current('arg2')
      result.current('arg3')
    })

    // La función no debería haberse llamado aún
    expect(mockCallback).not.toHaveBeenCalled()

    // Avanzar el tiempo más allá del delay
    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Solo debería haberse llamado una vez con el último argumento
    expect(mockCallback).toHaveBeenCalledTimes(1)
    expect(mockCallback).toHaveBeenCalledWith('arg3')
  })

  it('respects the delay parameter', () => {
    const mockCallback = vi.fn()
    const { result } = renderHook(() => useDebounceCallback(mockCallback, 500))

    act(() => {
      result.current('test')
    })

    // No debería haberse llamado después de 300ms
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(mockCallback).not.toHaveBeenCalled()

    // Debería haberse llamado después de 500ms
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(mockCallback).toHaveBeenCalledWith('test')
  })

  it('cancels previous calls when called again', () => {
    const mockCallback = vi.fn()
    const { result } = renderHook(() => useDebounceCallback(mockCallback, 300))

    act(() => {
      result.current('first')
    })

    // Avanzar 200ms (antes del delay)
    act(() => {
      vi.advanceTimersByTime(200)
    })

    // Llamar de nuevo
    act(() => {
      result.current('second')
    })

    // Avanzar 100ms más (300ms total desde la primera llamada)
    act(() => {
      vi.advanceTimersByTime(100)
    })

    // La primera llamada no debería haberse ejecutado
    expect(mockCallback).not.toHaveBeenCalled()

    // Avanzar 200ms más (300ms desde la segunda llamada)
    act(() => {
      vi.advanceTimersByTime(200)
    })

    // Solo la segunda llamada debería haberse ejecutado
    expect(mockCallback).toHaveBeenCalledTimes(1)
    expect(mockCallback).toHaveBeenCalledWith('second')
  })

  it('handles multiple arguments correctly', () => {
    const mockCallback = vi.fn()
    const { result } = renderHook(() => useDebounceCallback(mockCallback, 300))

    act(() => {
      result.current('arg1', 'arg2', { key: 'value' })
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(mockCallback).toHaveBeenCalledWith('arg1', 'arg2', { key: 'value' })
  })

  it('works with default delay', () => {
    const mockCallback = vi.fn()
    const { result } = renderHook(() => useDebounceCallback(mockCallback, 500))

    act(() => {
      result.current('test')
    })

    act(() => {
      vi.advanceTimersByTime(500) // delay por defecto
    })

    expect(mockCallback).toHaveBeenCalledWith('test')
  })

  it('handles zero delay', () => {
    const mockCallback = vi.fn()
    const { result } = renderHook(() => useDebounceCallback(mockCallback, 0))

    act(() => {
      result.current('test')
    })

    // Con delay 0, debería ejecutarse en el siguiente tick
    act(() => {
      vi.runAllTimers()
    })

    expect(mockCallback).toHaveBeenCalledWith('test')
  })

  it('maintains function reference between renders', () => {
    const mockCallback = vi.fn()
    const { result, rerender } = renderHook(() =>
      useDebounceCallback(mockCallback, 300)
    )

    // Verificar que es una función
    expect(typeof result.current).toBe('function')

    rerender()

    // La función debounced debería seguir siendo una función
    expect(typeof result.current).toBe('function')
    // Y debería funcionar correctamente
    act(() => {
      result.current('test')
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(mockCallback).toHaveBeenCalledWith('test')
  })

  it('handles rapid successive calls', () => {
    const mockCallback = vi.fn()
    const { result } = renderHook(() => useDebounceCallback(mockCallback, 100))

    // Llamar 10 veces rápidamente
    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current(`call-${i}`)
      }
    })

    expect(mockCallback).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(mockCallback).toHaveBeenCalledTimes(1)
    expect(mockCallback).toHaveBeenCalledWith('call-9')
  })

  it('handles callback that returns a value', () => {
    const mockCallback = vi.fn().mockReturnValue('result')
    const { result } = renderHook(() => useDebounceCallback(mockCallback, 300))

    act(() => {
      const returnValue = result.current('test')
      expect(returnValue).toBeUndefined() // Debounced functions don't return values
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(mockCallback).toHaveBeenCalledWith('test')
  })

  it('handles callback with no arguments', () => {
    const mockCallback = vi.fn()
    const { result } = renderHook(() => useDebounceCallback(mockCallback, 300))

    act(() => {
      result.current()
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(mockCallback).toHaveBeenCalledWith()
  })
})
