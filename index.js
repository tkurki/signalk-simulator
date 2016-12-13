/*
 * Copyright 2016 Teppo Kurki <teppo.kurki@iki.fi>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const debug = require('debug')('signalk:deltasimulator')

const signalkSchema = require('signalk-schema')


const relevantKeys = Object.keys(signalkSchema.metadata)
  .filter(s => s.indexOf('/vessels/*') >= 0)
  .map(s => s.replace('/vessels/*', '').replace(/\//g, '.').replace(/RegExp/g, '*').substring(1))


module.exports = function(app) {
  var plugin = {}
  var intervals = []

  plugin.start = function(props) {
    debug("Starting")
    props.deltas.forEach(deltaSpec => {
      intervals.push(setInterval(function() {
        app.signalk.addDelta({
          context: "vessels.urn:mrn:signalk:uuid:c0d79334-4e25-4245-8892-54e8ccc8021d",
          updates: [{
            source: {
              label: "sim",
              src: deltaSpec.src,
              pgn: deltaSpec.pgn
            },
            values: [{
              path: deltaSpec.path,
              value: deltaSpec.min
          }]
        }]
        })
      }, deltaSpec.interval * 1000))
    })
    debug("Started")
  };

  plugin.stop = function() {
    debug("Stopping")
    intervals.forEach(interval => {
      clearInterval(interval)
    })
    intervals = []
    debug("Stopped")
  };

  plugin.id = "deltasimulator"
  plugin.name = "Delta Simulator"
  plugin.description = "Plugin that produces simulated Signal K deltas according to configuration"

  plugin.schema = {
    properties: {
      deltas: {
        type: "array",
        items: {
          type: "object",
          properties: {
            path: {
              title: "Signal K Path",
              type: "string",
              default: "",
              "enum": relevantKeys
            },
            src: {
              type: "string",
              title: "src",
              default: "12"
            },
            pgn: {
              type: "string",
              title: "Pgn",
              default: "111111"
            },
            min: {
              type: "number",
              title: "Minimum",
              default: "0"
            },
            max: {
              type: "number",
              title: "Maximum",
              default: 10
            },
            interval: {
              type: "number",
              title: "Interval in seconds",
              default: 60
            },
            pattern: {
              type: "string",
              enum: ["fixed", "random", "sawtooth"]
            }
          }
        }
      }
    }
  }




  return plugin
}
