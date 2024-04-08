import AWS from 'aws-sdk'
import * as fs from 'fs'
const config = useRuntimeConfig()

export default eventHandler(async (event) => {
  const { path }: any = getQuery(event)
  console.log(path)

  const bucket = 'ozonmpportal'
  AWS.config.update({
    accessKeyId: config.VK_ACCESS_KEY,
    secretAccessKey: config.VK_SECRET_KEY,
    endpoint: 'https://hb.vkcs.cloud',
  })

  const params: AWS.S3.GetObjectRequest = {
    Bucket: 'ozonmpportal',
    Key: path.replace('ozonmpportal/', ''),
  }

  const getImage = (params: AWS.S3.GetObjectRequest) => {
    return new Promise((resolve, reject) => {
      s3.getObject(params, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data.Body)
        }
      })
    })
  }

  const s3 = new AWS.S3()

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
