import { getUsersAction } from '@/lib/actions/users.action'
import { columns } from './columns'
import DataTable from './DataTable'

export default async function UserTable() {
  const { data, error } = await getUsersAction()

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className='mx-auto py-1'>
      <DataTable columns={columns} data={data ? data : []} />
    </div>
  )
}
