import { columns } from './columns'
import DataTable from './DataTable'
import { UserType } from '@/types/UserType'

interface UserTableProps {
  data: UserType[]
}

export default function UserTable({ data }: UserTableProps) {
  return (
    <div className='mx-auto py-1'>
      <DataTable columns={columns} data={data ? data : []} />
    </div>
  )
}
