/**
 * Copyright 2017 Intel Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ----------------------------------------------------------------------------
 */
'use strict'

const m = require('mithril')
const _ = require('lodash')

const api = require('../services/api')
const parsing = require('../services/parsing')
const layout = require('../components/layout')
const { Table, PagingButtons } = require('../components/tables')

const PAGE_SIZE = 50

/**
 * Displays updates to a property, and form for submitting new updates.
 */
const ProvenancePage = {
  oninit (vnode) {
    vnode.state.currentPage = 0
    vnode.state.tmp = {}

    const refresh = () => {
      api.get(`records/${vnode.attrs.recordId}/owners`)
        .then(provenance => {
          vnode.state.provenance = provenance
        })
        .then(() => { vnode.state.refreshId = setTimeout(refresh, 2000) })
    }

    refresh()
  },

  onbeforeremove (vnode) {
    clearTimeout(vnode.state.refreshId)
  },

  view (vnode) {
    const record = vnode.attrs.recordId

    const reporters = _.get(vnode.state, 'property.reporters', [])
    const isReporter = reporters.includes(api.getPublicKey())

    const provenance = _.get(vnode.state, 'provenance', [])
    const page = provenance.slice(vnode.state.currentPage * PAGE_SIZE,
                               (vnode.state.currentPage + 1) * PAGE_SIZE)

    return [
      layout.title(`Provenance of ${record}`),
      isReporter ? updateForm(vnode.state) : null,
      m('.container',
        layout.row([
          m('h5.mr-auto', 'Ownership History'),
          m(PagingButtons, {
            setPage: page => { vnode.state.currentPage = page },
            currentPage: vnode.state.currentPage,
            maxPage: provenance.length / PAGE_SIZE
          })
        ]),
        m(Table, {
          headers: ['Owner', 'Date and Time'],
          rows: page.map(owner => {
            return [
              owner.name,
              parsing.formatTimestamp(owner.timestamp)
            ]
          }),
          noRowsText: 'This load has never been owned'
        }))
    ]
  }
}

module.exports = ProvenancePage
