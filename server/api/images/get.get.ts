import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const config = useRuntimeConfig()

export default eventHandler(async (event) => {
  const { path }: any = getQuery(event)

  const s3 = new S3Client({
    region: 'ru-central1',
    credentials: {
      accessKeyId: config.VK_ACCESS_KEY,
      secretAccessKey: config.VK_SECRET_KEY,
    },
    endpoint: 'https://hb.vkcs.cloud',
  })

  const params = {
    Bucket: 'ozonmpportal',
    Key: path.replace('ozonmpportal/', ''),
  }

  const getImage = async (params: any) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const command = new GetObjectCommand(params)
      const response = await s3.send(command)
      return response.Body
    }
    catch (err) {
      throw err
    }
  }

  const data = await getImage(params)

  return data

  // AWS.config.update({
  //   accessKeyId: config.VK_ACCESS_KEY,
  //   secretAccessKey: config.VK_SECRET_KEY,
  //   endpoint: 'https://hb.vkcs.cloud',
  // });

  // const s3 = new AWS.S3();
  // const bucket = 'ozonmpportal';

  // // Генерируем пресайндованную ссылку на объект
  // const getImageUrl = async (bucket: string, key: string) => {
  //   const params = {
  //     Bucket: bucket,
  //     Key: key,
  //     Expires: 3600, // Время жизни ссылки (в секундах)
  //   };

  //   try {
  //     const url = await s3.getSignedUrlPromise('getObject', params);
  //     return url;
  //   } catch (error) {
  //     console.error('Ошибка при генерации ссылки на изображение:', error);
  //     throw error;
  //   }
  // };

  // const imageUrl = await getImageUrl(bucket, path);

  // return imageUrl;
})
