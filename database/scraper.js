import https from 'https'
import util from 'util'
import stream from 'stream'

const get = util.promisify(https.get)
const pipeline = util.promisify(stream.pipeline)

export default function scrapeWOL (date) {
  return get(`https://wol.jw.org/en/wol/dt/r1/lp-e/${date.replace(/-/g, '/')}`)
    .then(res => {
      if (res.statusCode !== 200) throw new Error('Response was not ok')
      return pipeline(res)
    })
}
