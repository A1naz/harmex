import { HttpsProxyAgent } from 'https-proxy-agent'

const c = [
  143,
  287,
  431,
  719,
  1007,
  1061,
  1115,
  1169,
  1313,
  1601,
  1655,
  1919,
  2045,
  2057,
]

function p(t: any, e: any) {
  for (let i = 0; i < e.length; i++) {
    const first = e[i - 1] ? e[i - 1] : 0
    if (t > first && t <= e[i])
      return i + 1
  }
}
const sleep = (ms: any) => new Promise(r => setTimeout(r, ms))

export function findImage(input: string) {
  const nm = Number.parseInt(input, 10)
  const vol = Math.floor(nm / 1e5)
  const part = Math.floor(nm / 1e3)
  let host
  if (vol >= 0 && vol <= 143) {
    host = '//basket-01.wb.ru'
  }
  else if (vol >= 144 && vol <= 287) {
    host = '//basket-02.wb.ru'
  }
  else if (vol >= 288 && vol <= 431) {
    host = '//basket-03.wb.ru'
  }
  else if (vol >= 432 && vol <= 719) {
    host = '//basket-04.wb.ru'
  }
  else if (vol >= 720 && vol <= 1007) {
    host = '//basket-05.wb.ru'
  }
  else if (vol >= 1008 && vol <= 1061) {
    host = '//basket-06.wb.ru'
  }
  else if (vol >= 1062 && vol <= 1115) {
    host = '//basket-07.wb.ru'
  }
  else if (vol >= 1116 && vol <= 1169) {
    host = '//basket-08.wb.ru'
  }
  else if (vol >= 1170 && vol <= 1313) {
    host = '//basket-09.wb.ru'
  }
  else if (vol >= 1314 && vol <= 1601) {
    host = '//basket-10.wb.ru'
  }
  else if (vol >= 1602 && vol <= 1655) {
    host = '//basket-11.wb.ru'
  }
  else if (vol >= 1656 && vol <= 1919) {
    host = '//basket-12.wb.ru'
  }
  else if (vol >= 1920 && vol <= 2045) {
    host = '//basket-13.wb.ru'
  }
  else if (vol >= 2046 && vol <= 2191) {
    host = '//basket-14.wb.ru'
  }
  else if (vol >= 2192 && vol <= 2405) {
    host = '//basket-15.wbbasket.ru'
  } else if (vol >= 2406 && vol <= 2621) {
    host = '//basket-16.wbbasket.ru'
  } else if (vol >= 2622 && vol <= 2838) {
    host = '//basket-17.wbbasket.ru'
  } else if (vol >= 2839 && vol <= 3054) {
    host = '//basket-18.wbbasket.ru'
  }
  else if (vol >= 3055 && vol <= 3270) {
    host = '//basket-19.wbbasket.ru'
  } else if (vol >= 3271 && vol <= 3552) {
    host = '//basket-20.wbbasket.ru'
  } else if (vol >= 3553 && vol <= 3701) {
    host = '//basket-21.wbbasket.ru'
  } else if (vol >= 3702 && vol <= 3951) {
    host = '//basket-22.wbbasket.ru'
  } else if (vol >= 3952 && vol <= 4140) {
    host = '//basket-23.wbbasket.ru'
  } else if (vol >= 4141 && vol <= 4349) {
    host = '//basket-24.wbbasket.ru'
  } else if (vol >= 4350 && vol <= 4565) {
    host = '//basket-25.wbbasket.ru'
  } else if (vol >= 4565 && vol <= 4877) {
    host = '//basket-26.wbbasket.ru'
  } else if (vol >= 4877 && vol <= 5189) {
    host = '//basket-27.wbbasket.ru'
  } else if (vol >= 5190 && vol <= 5489) { 
    host = '//basket-28.wbbasket.ru'
  } else if (vol >= 5490 && vol <= 6126)  {
    host = '//basket-29.wbbasket.ru'
  } else if (vol >= 6127 && vol <= 6125) {
    host = '//basket-30.wbbasket.ru'
  } else if (vol >= 6126 && vol <= 6437) {
    host = '//basket-31.wbbasket.ru'
  } else if (vol >= 6438 && vol <= 6749) {
       host = '//basket-32.wbbasket.ru'
  } else if (vol >= 6750 && vol <= 7061)  {
     host = '//basket-33.wbbasket.ru'
  } else {
      host = '//basket-34.wbbasket.ru'
  }

  console.log(vol)
  console.log(host)
  return `https:${host}/vol${vol}/part${part}/${nm}/images/big/1.webp`
}

export function findProductCard(article: number) {
  const t = article

  const n = Math.floor(t / 1e5)
  const a = p(n, c)

  const result = `https://basket-${(a as number) < 10 ? `0${a}` : a
    }.wb.ru/vol${n}/part${Math.floor(article / 1e3)}/${article}/info/ru/card.json`

  return result
}

export async function findPositionByQuery(
  query: string,
  article: number,
  proxies: string[] = [],
  sort = 'popular',
  n: number = 0,
  cycleCount: number = 0,
) {
  const pages = 50
  try {
    const result = {
      found: false,
      page: -1,
      advert: false,
    }

    const randomNumber = Math.floor(Math.random() * 105)

    const advertData: any = await $fetch(
      `https://catalog-ads.wildberries.ru/api/v6/search?keyword=${query}`,
      {
        agent: new HttpsProxyAgent(`https://${proxies[randomNumber]}`),
        parseResponse: JSON.parse,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        },
      },
    )
    const advertPages = advertData.pages
    if (advertData.adverts) {
      const foundIndex = advertData.adverts.findIndex(
        (el: any) => el.id === article,
      )
      if (foundIndex !== -1) {
        const place = foundIndex + 1
        const page = Math.ceil(place / advertPages[0].count)
        result.found = true
        result.page = page
        result.advert = true
        return result
      }
    }

    async function findPositionCycle() {
      for (let i = n; i <= pages; i++) {
        n++

        const random = Math.floor(Math.random() * 105)

        const data: any = await $fetch(
          `https://search.wb.ru/exactmatch/ru/male/v4/search?TestGroup=test&TestID=188&appType=1&curr=rub&dest=-1257786&query=${query}&regions=80,38,4,64,83,33,68,70,69,30,86,75,40,1,66,110,22,31,48,71,114&resultset=catalog&sort=${sort}&spp=31&suppressSpellcheck=false&page=${i}`,
          {
            method: 'GET',
            agent: new HttpsProxyAgent(`https://${proxies[random]}`),
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
            },
          },
        )

        const parsed = JSON.parse(data)
        const products = parsed?.data?.products

        if (!products)
          return result

        products.forEach((el: any) => {
          // eslint-disable-next-line eqeqeq
          if (el.id == article) {
            result.found = true
            result.page = i
            return result
          }
        })
        if (result.found)
          return result
      }
      return result
    }

    if (n < pages) {
      const cycleResult = await findPositionCycle()
      return cycleResult
    }
    else {
      return result
    }
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (e) {
    cycleCount++

    if (n <= 1) {
      const newResult: any = await findPositionByQuery(
        query,
        article,
        proxies,
        sort,
        n,
      )
      return newResult
    }
    else if (n < pages && cycleCount < 10) {
      await sleep(2500)
      const newResult: any = await findPositionByQuery(
        query,
        article,
        proxies,
        sort,
        n,
        cycleCount,
      )
      return newResult
    }
    const result = {
      found: false,
      page: -1,
      advert: false,
    }

    return result
  }
}
