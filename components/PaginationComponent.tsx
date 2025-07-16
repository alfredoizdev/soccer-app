import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination'

export default function PaginationComponent({
  page,
  perPage,
  totalPages,
}: {
  page: number
  perPage: number
  totalPages: number
}) {
  return (
    <div className='mt-4 flex justify-end'>
      <Pagination className='justify-end w-auto mx-0'>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={`?page=${Number(page) - 1}&perPage=${perPage}`}
              aria-disabled={Number(page) <= 1}
              tabIndex={Number(page) <= 1 ? -1 : 0}
              className={
                Number(page) <= 1 ? 'pointer-events-none opacity-50' : ''
              }
            />
          </PaginationItem>
          {[...Array(totalPages)].map((_, i) => (
            <PaginationItem key={i + 1}>
              <PaginationLink
                href={`?page=${i + 1}&perPage=${perPage}`}
                isActive={Number(page) === i + 1}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href={
                Number(page) < totalPages
                  ? `?page=${Number(page) + 1}&perPage=${perPage}`
                  : `?page=${page}&perPage=${perPage}`
              }
              aria-disabled={Number(page) >= totalPages}
              tabIndex={Number(page) >= totalPages ? -1 : 0}
              className={
                Number(page) >= totalPages
                  ? 'pointer-events-none opacity-50'
                  : ''
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
