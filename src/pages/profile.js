import React, { Component } from 'react'
import Router from 'next/router'
import join from 'url-join'
import { getSession } from 'next-auth/react'
import getConfig from 'next/config'
import Section from '../components/section'
import SectionHeader from '../components/section-header'
import Table from '../components/table'
import { getTeams } from '../lib/teams-api'
import { getMyOrgs } from '../lib/org-api'
import { assoc, flatten, propEq, find } from 'ramda'

const { publicRuntimeConfig } = getConfig()
const URL = publicRuntimeConfig.APP_URL

export default class Profile extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isModalOpen: false,
      loading: true,
      teams: [],
      error: undefined,
    }
  }

  openCreateModal() {
    this.setState({
      isModalOpen: true,
    })
  }

  async componentDidMount() {
    const session = await getSession()
    let teams = await getTeams({ osmId: session?.user_id })
    let orgs = await getMyOrgs({ osmId: session?.user_id })
    this.setState({
      session,
      teams,
      orgs,
      loading: false,
    })
  }

  renderTeams() {
    const { teams } = this.state
    if (!teams) return null

    if (teams.length === 0) {
      return <p className='inner page'>No teams</p>
    }

    return (
      <Table
        rows={teams}
        columns={[{ key: 'id' }, { key: 'name' }, { key: 'hashtag' }]}
        onRowClick={(row, index) => {
          Router.push(
            join(URL, `/team?id=${row.id}`),
            join(URL, `/teams/${row.id}`)
          )
        }}
      />
    )
  }

  renderOrganizations() {
    const { orgs } = this.state
    if (!orgs) return null

    if (orgs.length === 0) {
      return <p className='inner page'>No orgs</p>
    }

    const memberOrgs = orgs.memberOrgs.map(assoc('role', 'member'))
    const managerOrgs = orgs.managerOrgs.map(assoc('role', 'manager'))
    const ownerOrgs = orgs.ownerOrgs.map(assoc('role', 'owner'))

    let allOrgs = ownerOrgs
    managerOrgs.forEach((org) => {
      if (!find(propEq('id', org.id))(allOrgs)) {
        allOrgs.push(org)
      }
    })
    memberOrgs.forEach((org) => {
      if (!find(propEq('id', org.id))(allOrgs)) {
        allOrgs.push(org)
      }
    })

    return (
      <Table
        rows={allOrgs}
        columns={[{ key: 'id' }, { key: 'name' }, { key: 'role' }]}
        onRowClick={(row, index) => {
          Router.push(
            join(URL, `/organizations?id=${row.id}`),
            join(URL, `/organizations/${row.id}`)
          )
        }}
      />
    )
  }

  render() {
    if (this.state.loading) return <div className='inner page'>Loading...</div>
    if (this.state.error)
      return <div className='inner page'> {this.state.error.message} </div>

    const { orgs } = this.state
    const hasOrgs = flatten(Object.values(orgs)).length > 0

    return (
      <div className='inner page'>
        <div className='page__heading'>
          <h1>Teams & Organizations</h1>
        </div>
        {hasOrgs ? (
          <Section>
            <SectionHeader>Your Organizations</SectionHeader>
            {this.renderOrganizations()}
          </Section>
        ) : (
          ''
        )}
        <Section>
          <SectionHeader>Your Teams</SectionHeader>
          {this.renderTeams()}
        </Section>
      </div>
    )
  }
}
