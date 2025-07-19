'use client'

import { useEffect, useRef } from 'react'
import { useGlobalStore } from '@/lib/stores/globalStore'

export default function GlobalStoreInitializer() {
  const {
    usersLoaded,
    playersLoaded,
    organizationsLoaded,
    loadUsers,
    loadPlayers,
    loadOrganizations,
  } = useGlobalStore()

  const initialized = useRef(false)

  useEffect(() => {
    // Solo inicializar una vez
    if (initialized.current) return
    initialized.current = true

    // Cargar datos solo si no están cargados
    const initializeData = async () => {
      const promises = []

      if (!usersLoaded) {
        promises.push(loadUsers())
      }
      if (!playersLoaded) {
        promises.push(loadPlayers())
      }
      if (!organizationsLoaded) {
        promises.push(loadOrganizations())
      }

      if (promises.length > 0) {
        await Promise.all(promises)
      }
    }

    initializeData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Sin dependencias para que solo se ejecute una vez

  return null
}
