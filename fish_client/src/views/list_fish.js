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
const truncate = require('lodash/truncate')
const {Table, FilterGroup, PagingButtons} = require('../components/tables')
const api = require('../services/api')
const { formatTimestamp } = require('../services/parsing')
const {getPropertyValue, getLatestPropertyUpdateTime, getOldestPropertyUpdateTime, countPropertyUpdates} = require('../utils/records')

const PAGE_SIZE = 50
var _filter

const FishList = {
  oninit (vnode) {
    let publicKey = api.getPublicKey()
    vnode.state.records = []
    vnode.state.filteredRecords = []

    vnode.state.currentPage = 0

    const refresh = () => {
      api.get('records?recordType=load').then((records) => {
        vnode.state.records = records
        vnode.state.records.sort((a, b) => {
          return getLatestPropertyUpdateTime(b) - getLatestPropertyUpdateTime(a)
        })
        _filterRecords(vnode, publicKey, _filter)
      })
        .then(() => { vnode.state.refreshId = setTimeout(refresh, 5000) })
    }

    refresh()
  },

  onbeforeremove (vnode) {
    clearTimeout(vnode.state.refreshId)
  },

  view (vnode) {
    let publicKey = api.getPublicKey()
    return [
      m('.fish-table',
        m('.row.btn-row.mb-2', _controlButtons(vnode, publicKey)),
        m(Table, {
          headers: [
            'Serial Number',
            'Species',
            'Added',
            'Updated',
            'Updates'
          ],
          rows: vnode.state.filteredRecords.slice(
            vnode.state.currentPage * PAGE_SIZE,
            (vnode.state.currentPage + 1) * PAGE_SIZE)
                .map((rec) => [
                  m(`a[href=/loads/${rec.recordId}]`, {
                    oncreate: m.route.link
                  }, truncate(rec.recordId, { length: 32 })),
                  getPropertyValue(rec, 'species'),
                  // This is the "created" time, synthesized from properties
                  // added on the initial create
                  formatTimestamp(getOldestPropertyUpdateTime(rec)),
                  formatTimestamp(getLatestPropertyUpdateTime(rec)),
                  countPropertyUpdates(rec)
                ]),
          noRowsText: 'No records found'
        })
      )
    ]
  }
}

const _controlButtons = (vnode, publicKey) => {
  if (publicKey) {
    let setFilter = (filter) => {
      _filter = filter
      _filterRecords(vnode, publicKey, filter)
    }

    return [
      m('.col-sm-8',
        m(FilterGroup, {
          ariaLabel: 'Filter Based on Ownership',
          filters: {
            'All': () => { vnode.state.filteredRecords = vnode.state.records },
            'Owned': () => setFilter('owned'),
            'Custodian': () => setFilter('custodian'),
            'Reporting': () => setFilter('reporting')
          },
          initialFilter: 'All'
        })),
      m('.col-sm-4', _pagingButtons(vnode))
    ]
  } else {
    return [
      m('.col-sm-4.ml-auto', _pagingButtons(vnode))
    ]
  }
}

const _pagingButtons = (vnode) =>
  m(PagingButtons, {
    setPage: (page) => { vnode.state.currentPage = page },
    currentPage: vnode.state.currentPage,
    maxPage: Math.floor(vnode.state.filteredRecords.length / PAGE_SIZE)
  })

const _filterRecords = (vnode, publicKey, filter) => {
  if (publicKey) {
    let filterCondition
    switch(filter) {
      case 'owned':
        filterCondition = (record) => record.owner === publicKey
        break;
      case 'custodian':
        filterCondition = (record) => record.custodian === publicKey
        break;
      case 'reporting':
        filterCondition = (record) => record.properties.reduce(
          (owned, prop) => owned || prop.reporters.indexOf(publicKey) > -1, false)
        break;
    }
    if (filterCondition)
      vnode.state.filteredRecords = vnode.state.records.filter(filterCondition)
    else 
      vnode.state.filteredRecords = vnode.state.records
  }
}

module.exports = FishList
