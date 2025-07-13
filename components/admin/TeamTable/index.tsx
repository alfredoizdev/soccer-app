import { getOrganizationsAction } from '@/lib/actions/organization.action'
import { columns } from './columns'
import DataTableTeam from './DataTableTeam'

export default async function TeamTable() {
  const { data, error } = await getOrganizationsAction()

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className='container mx-auto py-10'>
      <DataTableTeam columns={columns} data={data ?? []} />
    </div>
  )
}
