import T from 'prop-types'
import Table from './table'
import { useFetchList } from '../../hooks/use-fetch-list'
import { useState } from 'react'
import Pagination from '../pagination'

function UsersTable({ type, orgId, onRowClick }) {
  const [page, setPage] = useState(1)

  let apiBasePath
  let emptyMessage

  switch (type) {
    case 'org-members':
      apiBasePath = `/organizations/${orgId}/members`
      emptyMessage = 'No members yet.'
      break
    case 'org-staff':
      apiBasePath = `/organizations/${orgId}/staff`
      emptyMessage = 'No staff found.'
      break
    default:
      break
  }

  const {
    result: { data, pagination },
    isLoading,
  } = useFetchList(`${apiBasePath}?page=${page}`)

  const columns = [{ key: 'name' }, { key: 'id', label: 'OSM ID' }]

  return (
    <>
      <Table
        data-cy={`${type}-table`}
        rows={data}
        columns={columns}
        emptyPlaceHolder={isLoading ? 'Loading...' : emptyMessage}
        onRowClick={onRowClick}
      />
      {pagination?.total > 0 && (
        <Pagination
          data-cy={`${type}-table-pagination`}
          pagination={pagination}
          setPage={setPage}
        />
      )}
    </>
  )
}

UsersTable.propTypes = {
  type: T.oneOf(['org-members', 'org-staff']).isRequired,
  orgId: T.number,
}

export default UsersTable
