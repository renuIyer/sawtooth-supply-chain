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

const Dashboard = {
  view (vnode) {
    return [
      m('.header.text-center.mb-4',
        m('h4', 'Welcome To'),
        m('h1.mb-3', 'Zion'),
        m('h5',
          m('em',
            'Providing Load Tracking Solutions'
           ))),
      m('.blurb',
        m('p',
          m('em', 'Zion'),
          ' enables the users at any stage to ensure that the wood/log they purchase ',
          'is ethically sourced and properly transported.'),
        m('p',          
          'Built over blockchain technology, it provides a simplified means of ',
          'tracking the provenance of loads from forest owner to customer ',
          'while maintaining a timstamped history detailing how the load was stored, ',
          'handled and transported.'
          ),                   
          
        m('p',
          'To use ',
          m('em', 'Zion'),
          ', create an account using the link in the navbar above. ',
          'Once logged in, you will be able to add new loads to ',
          'the blockchain and track them with data like weight and ',
          'location. You will be able to authorize other participants on the ',
          'blockchain to track this data as well, or even transfer ',
          'ownership or possession of the loads entirely.')
          ),
          m('.header.text-center.mb-4',
          m('em',
            'Powered by ',
            m('strong', 'Hyperledger Sawtooth')))
         ]
  }
}

module.exports = Dashboard
