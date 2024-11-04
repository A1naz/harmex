import { disables } from '@antfu/eslint-config'
import { Service } from '~/server/lib/models/Service'

export default eventHandler(async (event) => {
  const { type, searchQuery } = getQuery(event)

  if (type === 'Отели') {
    return {
      status: 'ok',
      services: [],
    }
  }
  else if (type === 'Маркетплейсы') {
    let services

    if (searchQuery) {
      const query = {
        items: { $elemMatch: { title: { $regex: searchQuery, $options: 'i' } } },
        disabled: { $ne: true },
      }

      services = await Service.aggregate([
        { $match: query },
        {
          $addFields: {
            items: {
              $filter: {
                input: '$items',
                as: 'item',
                cond: { $regexMatch: { input: '$$item.title', regex: searchQuery, options: 'i' } },
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            __v: 0,
          },
        },
        { $sort: { disabled: 1 } },
      ])
    }
    else {
      services = await Service.find({})
        .select('-_id -__v')
        .sort({ disabled: 1 })
    }

    if (!services || !services.length) {
      return {
        status: 'error',
        error: [],
      }
    }

    return {
      status: 'ok',
      services,
    }
  }
})
