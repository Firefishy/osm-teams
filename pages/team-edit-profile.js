import React, { Component } from 'react'
import { assoc, isEmpty } from 'ramda'
import Popup from 'reactjs-popup'

import ProfileAttributeForm from '../components/profile-attribute-form'
import Button from '../components/button'
import Table from '../components/table'
import { addTeamMemberAttributes, getTeamMemberAttributes, modifyMemberAttribute } from '../lib/profiles-api'
import theme from '../styles/theme'

export default class TeamEditProfile extends Component {
  static async getInitialProps ({ query }) {
    if (query) {
      return {
        id: query.id
      }
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      isAdding: false,
      isModifying: false,
      rowToModify: {},
      loading: true,
      error: undefined
    }

    this.renderActions = this.renderActions.bind(this)
  }

  async componentDidMount () {
    this.getTeamMemberAttributes()
  }

  renderActions (row, index, columns) {
    return (
      <Popup
        trigger={<span>⚙️</span>}
        position='left top'
        on='click'
        closeOnDocumentClick
        contentStyle={{ padding: '10px', border: 'none' }}
      >
        <ul>
          <li
            onClick={async () => {
              this.setState({
                isModifying: true,
                isAdding: false,
                rowToModify: assoc(
                  'required',
                  row.required === 'true' ? ['required'] : [],
                  row
                )
              })
            }}
          >
            Modify
          </li>
        </ul>
        <style jsx>
          {`
            ul {
              list-style: none;
              padding: 0;
              margin: 0;
            }

            li {
              padding-left: 0.5rem;
            }

            li:hover {
              color: ${theme.colors.secondaryColor};
            }
          `}
        </style>
      </Popup>
    )
  }

  async getTeamMemberAttributes () {
    const { id } = this.props
    try {
      let memberAttributes = await getTeamMemberAttributes(id)
      this.setState({
        teamId: id,
        memberAttributes,
        loading: false
      })
    } catch (e) {
      console.error(e)
      this.setState({
        error: e,
        teamId: null,
        memberAttributes: [],
        loading: false
      })
    }
  }

  render () {
    const { memberAttributes, teamId } = this.state
    const columns = [
      { key: 'name' },
      { key: 'description' },
      { key: 'visibility' },
      { key: 'required' },
      { key: 'actions' }
    ]

    let rows = []
    if (memberAttributes) {
      rows = memberAttributes.map((attribute) => {
        let newAttribute = assoc('actions', this.renderActions, attribute)
        newAttribute.required = attribute.required.toString()
        return newAttribute
      })
    }

    const CancelButton = <Button onClick={
      () => this.setState({
        isModifying: false,
        isAdding: false
      })
    }>Cancel</Button>

    return (
      <article className='inner page'>
        <section>
          <h2>Current Attributes</h2>
          <p>Members of your team will be able to add these attributes to their profile.</p>
          {
            memberAttributes && isEmpty(memberAttributes)
              ? "You haven't added any attributes yet!"
              : <Table rows={rows} columns={columns} />
          }
        </section>
        <section>
          {
            this.state.isModifying
              ? <>
                <h2>Modify attribute</h2>
                <ProfileAttributeForm
                  initialValues={this.state.rowToModify}
                  onSubmit={async (attribute) => {
                    await modifyMemberAttribute(attribute.id, attribute)
                    this.setState({ isModifying: false })
                    return this.getTeamMemberAttributes()
                  }}
                />
                {CancelButton}
                </>
              : ''
          }
          {
            this.state.isAdding
              ? <>
                <h2>Add an attribute</h2>
                <p>Add an attribute to your team member's profile</p>
                <ProfileAttributeForm
                  onSubmit={async (attributes) => {
                    await addTeamMemberAttributes(teamId, attributes)
                    this.setState({ isAdding: false })
                    return this.getTeamMemberAttributes()
                  }}
                />
                {CancelButton}
              </>
              : (!this.state.isModifying && <Button onClick={
                () => this.setState({
                  isAdding: true,
                  isModifying: false
                })
              }>Add attribute</Button>)
          }
        </section>
      </article>
    )
  }
}
