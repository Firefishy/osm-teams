import T from 'prop-types'
import Table from '../table'
import Router from 'next/router'
import join from 'url-join'
import { useFetchList } from '../../hooks/use-fetch-list'
import { useState } from 'react'

function TeamsTable({ orgId }) {
  const [page, setPage] = useState(0)
  const pageSize = 10

  const { result, isLoading, error, fetch } = useFetchList(
    `/organizations/${orgId}/teams?page=${page}&limit=${pageSize}`
  )

  const columns = [{ key: 'name' }, { key: 'id' }, { key: 'members' }]

  return (
    <Table
      rows={result}
      columns={columns}
      emptyPlaceHolder={
        isLoading ? 'Loading...' : 'This organization has no teams.'
      }
      onRowClick={(row) => {
        Router.push(
          join(URL, `/team?id=${row.id}`),
          join(URL, `/teams/${row.id}`)
        )
      }}
    />
  )
}

TeamsTable.propTypes = {
  orgId: T.number.isRequired,
}

export default TeamsTable
