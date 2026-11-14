import { notFound } from 'next/navigation'
import Insights from '@/components/admin/Insights'
import { VIEWS } from '@/components/admin/nav'
import { loadInsights } from '../data'

export default async function InsightsView({ params, searchParams }: {
  params: Promise<{ view: string }>
  searchParams: Promise<{ range?: string; device?: string }>
}) {
  const { view } = await params
  if (!Object.hasOwn(VIEWS, view) || view === 'overview') notFound()
  const r = await loadInsights(await searchParams)
  return <Insights view={view as keyof typeof VIEWS} {...r} />
}
