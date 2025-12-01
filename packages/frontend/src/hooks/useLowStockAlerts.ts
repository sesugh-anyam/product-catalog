import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'
import { toaster } from '@/components/ui/toaster'
import { LowStockItem } from '@product-catalog/shared'

interface UseLowStockAlertsOptions {
  enabled?: boolean
  checkInterval?: number
}

export const useLowStockAlerts = ({ 
  enabled = true, 
  checkInterval = 60000 // 1 minute
}: UseLowStockAlertsOptions = {}) => {
  const { token } = useAuthStore()
  const previousCountRef = useRef<number>(0)

  const { data: lowStockData } = useQuery({
    queryKey: ['low-stock-alerts'],
    queryFn: () => apiClient.getLowStockItems(token!),
    enabled: !!token && enabled,
    refetchInterval: checkInterval,
  })

  const lowStockItems: LowStockItem[] = lowStockData?.data || []
  const currentCount = lowStockItems.length

  useEffect(() => {
    if (previousCountRef.current === 0) {
      previousCountRef.current = currentCount
      return
    }

    if (currentCount > previousCountRef.current) {
      const newItems = currentCount - previousCountRef.current
      toaster.create({
        title: 'Low Stock Alert',
        description: `${newItems} new product${newItems > 1 ? 's' : ''} running low on stock`,
        type: 'warning',
        duration: 5000,
        action: {
          label: 'View Inventory',
          onClick: () => {
            window.location.href = '/inventory'
          }
        }
      })
    }

    if (currentCount < previousCountRef.current && previousCountRef.current > 0) {
      const resolvedItems = previousCountRef.current - currentCount
      toaster.create({
        title: 'Stock Updated',
        description: `${resolvedItems} product${resolvedItems > 1 ? 's' : ''} restocked successfully`,
        type: 'success',
        duration: 3000,
      })
    }

    previousCountRef.current = currentCount
  }, [currentCount])

  return {
    lowStockItems,
    lowStockCount: currentCount,
    hasLowStock: currentCount > 0,
  }
}
