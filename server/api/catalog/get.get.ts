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
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { items: { $elemMatch: { title: { $regex: searchQuery, $options: 'i' } } } },
        ],
      }

      services = await Service.aggregate([
        { $match: query },
        {
          $project: {
            name: 1,
            disabled: 1,
            slug: 1,
            items: {
              $filter: {
                input: '$items',
                as: 'item',
                cond: { $regexMatch: { input: '$$item.title', regex: searchQuery, options: 'i' } },
              },
            },
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
