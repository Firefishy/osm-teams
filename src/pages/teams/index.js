import React, { Component } from 'react'
import dynamic from 'next/dynamic'
import Router from 'next/router'
import Section from '../../components/section'
import Table from '../../components/tables/table'
import theme from '../../styles/theme'
import join from 'url-join'
import { pick, map } from 'ramda'
import { getTeams } from '../../lib/teams-api'
import logger from '../../lib/logger'

const Map = dynamic(import('../../components/list-map'), {
  ssr: false,
})

const URL = process.env.APP_URL

export default class TeamList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      error: undefined,
      teams: [],
      searchOnMapMove: false,
      mapBounds: undefined,
    }
  }

  async getTeams() {
    try {
      const { mapBounds, searchOnMapMove } = this.state
      const searchParams = searchOnMapMove ? { bbox: mapBounds } : {}
      const teams = await getTeams(searchParams)
      this.setState({
        teams,
        loading: false,
      })
    } catch (e) {
      logger.error(e)
      this.setState({
        error: e,
        teams: [],
        loading: false,
      })
    }
  }

  async componentDidMount() {
    this.getTeams()
  }

  renderTeams() {
    const { teams } = this.state
    if (!teams) return null

    if (teams.length === 0) {
      return <p>No teams created</p>
    }

    return (
      <Table
        rows={teams}
        columns={[{ key: 'name' }, { key: 'id' }, { key: 'hashtag' }]}
        onRowClick={(row) => {
          Router.push(
            join(URL, `/team?id=${row.id}`),
            join(URL, `/teams/${row.id}`)
          )
        }}
      />
    )
  }

  /**
   * Bounds is a WESN box, refresh teams
   */
  onMapBoundsChange(bounds) {
    if (this.state.searchOnMapMove) {
      this.setState(
        {
          mapBounds: bounds,
        },
        () => this.getTeams()
      )
    } else {
      this.setState({ mapBounds: bounds })
    }
  }

  renderMap() {
    const { teams } = this.state
    if (!teams) return null

    const teamLocations = map(pick(['location', 'id']), teams)
    const locations = teamLocations.filter(({ location }) => !!location) // reject nulls
    const centers = map(
      ({ location, id }) => ({
        id,
        center: JSON.parse(location).coordinates.reverse(),
      }),
      locations
    )

    return (
      <Map
        markers={centers}
        style={{ height: '300px' }}
        onBoundsChange={this.onMapBoundsChange.bind(this)}
      />
    )
  }

  setSearchOnMapMove(e) {
    this.setState(
      {
        searchOnMapMove: e.target.checked,
      },
      () => this.getTeams()
    )
  }

  render() {
    const { searchOnMapMove } = this.state
    return (
      <div className='inner page'>
        <h2>Teams</h2>
        {this.renderMap()}
        <fieldset>
          <input
            name='map-bounds-filter'
            id='map-bounds-filter'
            type='checkbox'
            checked={searchOnMapMove}
            onChange={(e) => this.setSearchOnMapMove(e)}
          />
          <label for='map-bounds-filter'>Filter teams by map</label>
        </fieldset>
        <Section>{this.renderTeams()}</Section>
        <style jsx>
          {`
            fieldset {
              display: inline-block;
              padding: 0.5rem;
              background: white;
              border-color: ${theme.colors.primaryColor};
              border-color: #384a9e;
              position: relative;
              top: -4rem;
              left: 1rem;
              z-index: 1000;
            }
            fieldset input,
            fieldset label {
              cursor: pointer;
            }

            fieldset input[type='checkbox'] {
              margin-right: 0.5rem;
            }
          `}
        </style>
      </div>
    )
  }
}
