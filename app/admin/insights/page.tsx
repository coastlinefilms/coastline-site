import Insights from '@/components/admin/Insights'
import { loadInsights } from './data'

export default async function SiteOverview({ searchParams }: { searchParams: Promise<{ range?: string; device?: string }> }) {
  const r = await loadInsights(await searchParams)
  return <Insights view="overview" {...r} />
}
