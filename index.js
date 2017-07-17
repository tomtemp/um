const express = require('express')
const app = express()
const rp = require('request-promise')
const fs = require('fs')
const polygon = require('@turf/helpers').polygon
const point = require('@turf/helpers').point
const inside = require('@turf/inside')

require('dotenv').config()

console.log('loading service areas...')
const areasString = fs.readFileSync('./service-areas.json', { encoding: 'utf8' })
const areasJSON = JSON.parse(areasString)
const polygons = areasJSON.features.map((area) => {
  return polygon([area.geometry.coordinates[0]], { name: area.properties.Name });
})
console.log('service areas loaded!')

app.get('/service-area', function (req, res) {
  const search = req.query.search
  var options = {
    uri: `https://maps.googleapis.com/maps/api/geocode/json?address=${search}&key=${process.env.GOOGLE_API_KEY}`,
    qs: {
      search
    },
    json: true
  }
  
  rp(options)
    .then((resp) => {
      if (!resp.results.length) {
        return res.send({
          status: 'NOT_FOUND',
          search
        })
      }

      const result = resp.results[0]
      const lng = result.geometry.location.lng
      const lat = result.geometry.location.lat
      const pointObj = point([ lng, lat ])
      const match = polygons.find((polygon) => {
        return inside(pointObj, polygon)
      })

      if (match) {
        const addressMapping = {
          street_number: 'addressNumber',
          route: 'addressStreet',
          postal_town: 'city',
          postal_code: 'postcode'
        }
        const addressParts = result.address_components.reduce((acc, curr) => {
          const type = curr.types.find(type => addressMapping[type])
          if (type) {
            acc[addressMapping[type]] = curr.long_name
          }
          return acc
        }, {})

        return res.send({
          status: 'OK',  
          search,
          location: Object.assign(
            {},
            addressParts,
            {
              lat,
              lng,
              serviceArea: match.properties.name
            }
          )
        })
      }

      return res.send({
        status: 'NOT_FOUND',
        search
      })
    })
})

app.listen(3000, function () {
  console.log('um listening on port 3000!')
})