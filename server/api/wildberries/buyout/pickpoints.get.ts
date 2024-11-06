import fs from 'node:fs'
import {
  createPickpointsFile,
  removeExtraPickpoints,
} from '~/server/utils/pickpoints'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)

  if (!user)
    return sendRedirect(event, '/auth', 302)

  if (fs.existsSync('pvz/wildberriesPoints.json')) {
    const cached = fs.readFileSync('pvz/wildberriesPoints.json', 'utf8')
    const parsed = JSON.parse(cached)
    const now = new Date()
    const diff = now.getTime() - new Date(parsed.updated).getTime()
    if (diff < 1000 * 60 * 60) {
      return sendStream(
        event,
        fs.createReadStream('pvz/wildberriesPoints.json'),
      )
    }
  }

  if (fs.existsSync('pvz/wildberriesPoints.json')) {
    removeExtraPickpoints()
    return sendStream(event, fs.createReadStream('pvz/wildberriesPoints.json'))
  }
  else {
    await createPickpointsFile()
    return sendStream(event, fs.createReadStream('pvz/wildberriesPoints.json'))
  }
})
