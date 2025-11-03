'use client'

import dynamic from 'next/dynamic'

const FloorPlanCanvas = dynamic(() => import('@/components/Canvas'), {
  ssr: false,
})

export default function ClientOnlyFloorPlan() {
  return <FloorPlanCanvas />
}
