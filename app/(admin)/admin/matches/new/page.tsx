import MatchForm from '@/components/admin/MatchForm'
import { Button } from '@/components/ui/button'
import { getOrganizationsAction } from '@/lib/actions/organization.action'
import { TeamType } from '@/types/TeamType'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewMatchPage() {
  const { data: orgs } = await getOrganizationsAction()
  const teams = (orgs || []).map((org: TeamType) => ({
    id: org.id,
    name: org.name,
    value: org.id,
    avatar: org.avatar || '',
  }))
  return (
    <div className='w-full px-4 mx-auto py-8 animate-fade-in duration-500'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold'>New Match</h1>
        <Link href='/admin/matches'>
          <Button className='rounded-none'>
            <ArrowLeft className='w-4 h-4' />
            Back to matches
          </Button>
        </Link>
      </div>
      <MatchForm teams={teams} />
    </div>
  )
}
