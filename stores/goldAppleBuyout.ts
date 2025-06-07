import { rules } from '@/data/buyout/rules'
const { notify } = useNotification();
import { defineStore } from 'pinia'

interface ISearchQueryChange {
  value: string
  queryIndex: number
  productIndex: number
}

export const useGoldAppleBuyoutStore = defineStore('goldAppleBuyout', {
  state: () => ({
    createProducts: [] as any,
    selectedItem: null as number | null,
    defaultRules: rules,
  }),
  persist: {
    storage: persistedState.localStorage,
  },
  actions: {
    async createTemplate(title: string, products: Array<any>) {
      return { status: 'ok' }
    },

    async cloneBuyout(uuid: string) {
      const { data, error } = await useFetch('/api/goldApple/buyout/clone', {
        query: {
          uuid,
        },
        method: 'GET',
      })
      if (error.value) {
        notify({
          title: 'Что-то пошло не так',
          text: error.value?.data.message,
          type: 'error',
          duration: 3000,
        })
        return
      }
      if (data.value) {
        const productData = data.value as unknown as any
        const startDate = new Date()
        const endDate = new Date()
        startDate.setHours(9, 0)
        endDate.setHours(20, 0)
        const product = {
          ...productData,
          searchQuery: productData.searchQuery.map(item => ({
            value: item,
            error: false,
            loading: false,
          })),
          rules: [],
          dateRange: [startDate, endDate],
        }
        this.createProducts.push(product as any)
      }
    },

    clearProducts() {
      this.createProducts = []
    },
    async addProduct(article: string) {
      if (this.createProducts.length >= 10) {
        notify({
          title: 'За раз можно создать максимум 10 выкупов',
          type: 'error',
        })
        return
      }

      const { data, error } = await useFetch(`/api/goldApple/product/get`, {
        method: 'GET',
        params: {
          article,
        },
      })
      if (error.value) {
        notify({
          title: 'Ошибка',
          text: error.value?.data?.message,
          type: 'error',
        })
      }

      const product = (data.value as any).product as unknown as any

      const curDate = new Date()
      const startDate = new Date()
      const endDate = new Date()

      const userOffsetMinutes = new Date().getTimezoneOffset()
      const userTimezoneOffsetHours = -userOffsetMinutes / 60

      startDate.setHours(curDate.getHours() - userTimezoneOffsetHours + 4)
      endDate.setHours(curDate.getHours() - userTimezoneOffsetHours + 10)
      startDate.setMinutes(0)
      endDate.setMinutes(0)

      this.createProducts.push(
        reactive({
          image: product.image,
          name: product.name,
          article: product.article,
          url: product.url,
          price: product.price,
          prices: product.prices,
          quantity: 1,
          sex: 'Нет',
          sizes: product?.sizes,
          dateRange: [startDate, endDate],
          nameOrganization: product.nameOrganization,
          parameters: product?.parameters,
          selectedParameter: product?.parameters[0],
          adress: '',
          searchQuery: [{ value: '', loading: false, error: false }],
          priceText: product.priceText,
          rules: [],
          colors: product?.colors,
          pointCoordinates: { lat: 0, lon: 0 },
          deliveryType: 'courier',
          phoneNumber: '',
          FIO: '',
          appartmentNumber: '',
        }),
      )
      // this.changeRule(true, this.createProducts.length - 1, 5)
    },
    removeSearchQuery(index: number, place: number) {
      this.createProducts[index].searchQuery.splice(place, 1)
    },
    addSearchQuery(index: number) {
      this.createProducts[index].searchQuery.push({
        value: '',
        loading: false,
        error: false,
      })
    },
    changeDateRange(value: unknown[], index: number) {
      this.createProducts[index].dateRange = value as [Date | null, Date | null]
    },
    changeSearchQueryStatus(
      index: number,
      productIndex: number,
      error = false,
      loading = false,
      message?: string,
    ) {
      const query = this.createProducts[productIndex].searchQuery[index]
      query.error = error
      query.loading = loading
      query.message = message
    },
    changeSearchQuery(
      options: ISearchQueryChange,
      error = false,
      loading = false,
    ) {
      const query
        = this.createProducts[options.productIndex].searchQuery[
          options.queryIndex
        ]
      query.value = options.value
      query.error = error
      query.loading = loading
    },
    changeQuantity(value: number, index: number) {
      this.createProducts[index].quantity = value
    },
    changeSize(value: string | number, index: number) {
      this.createProducts[index].selectedSize = value
    },
    changeSex(value: string, index: number) {
      this.createProducts[index].sex = value
    },
    changeRule(value: boolean, index: number, rule: number) {
      const rules = this.createProducts[index].rules
      const finded = this.defaultRules.find(item => item.id === rule)
      if (!finded)
        return
      if (value) {
        if (finded.id === 8) {
          rules.forEach((rule, index) => {
            if (rule.id >= 10)
              rules.splice(index, 1)
          })
        }
        this.createProducts[index].rules.push(finded)
      }
      else {
        rules.splice(rules.indexOf(finded), 1)
      }
    },
    removeProduct(index: number) {
      this.createProducts.splice(index, 1)
    },
    handleAddress(address: string, lt: number, lg: number) {
      const index = this.selectedItem!
      this.createProducts[index].adress = address
      this.createProducts[index].pointCoordinates = {
        lat: lt,
        lon: lg,
      }
    },
  },
})
