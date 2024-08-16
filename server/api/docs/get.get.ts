import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { Paragraph, patchDocument, PatchType } from 'docx'
import fs from 'node:fs'
import path from 'node:path'

export default eventHandler(async (event) => {
  const user: any = await User.findOne({
    uuid: 'c5fdc5d6-a8b0-4986-a829-e721f8e54deb',
  })

  const doc = await patchDocument(
    fs.readFileSync('server/docs/templates/oferta.docx'),
    {
      patches: {
        orgNameForEditing: {
          type: PatchType.DOCUMENT,
          children: [new Paragraph({ text: user.orgName })],
        },
        OGRNForEditing: {
          type: PatchType.DOCUMENT,
          children: [new Paragraph({ text: user.orgOgrn })],
        },
        INNForEditing: {
          type: PatchType.DOCUMENT,
          children: [new Paragraph({ text: user.orgInn })],
        },
        YurAddressForEditing: {
          type: PatchType.DOCUMENT,
          children: [
            new Paragraph({
              text: user.bankInfo
                ? user.bankInfo.city + ',' + user.bankInfo.address
                : '',
            }),
          ],
        },
        EmailForEditing: {
          type: PatchType.DOCUMENT,
          children: [new Paragraph({ text: user.email })],
        },
      },
    }
  )
  fs.writeFileSync('server/docs/signedOferta.docx', doc)

  const filePath = path.join('server', 'docs', 'signedOferta.docx')

  const fileStream = fs.createReadStream(filePath)
  console.log('fileStream', fileStream)

  event.res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
  event.res.setHeader(
    'Content-Disposition',
    'attachment; filename="signedOferta.docx"'
  )

  return sendStream(event, fileStream)
})
