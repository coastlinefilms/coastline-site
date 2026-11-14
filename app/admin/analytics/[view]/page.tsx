import { notFound } from 'next/navigation'
import Insights, { VIEWS } from '@/components/admin/Insights'
import { loadInsights } from '../data'

export default async function InsightsView({ params, searchParams }: {
  params: Promise<{ view: string }>
  searchParams: Promise<{ range?: string; device?: string }>
}) {
  const { view } = await params
  if (!(view in VIEWS) || view === 'overview') notFound()
  const r = await loadInsights(await searchParams)
  return <Insights view={view as keyof typeof VIEWS} {...r} />
}
