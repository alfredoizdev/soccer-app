import DataTable from './DataTable'
import { UserType } from '@/types/UserType'

interface UserTableProps {
  data: UserType[]
}

export default function UserTable({ data }: UserTableProps) {
  return (
    <div className='sm:w-full overflow-x-auto'>
      <DataTable data={data ? data : []} />
    </div>
  )
}
