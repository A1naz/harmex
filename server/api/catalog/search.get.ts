import { Service } from '~/server/lib/models/Service';

function searchOrb(search: any): any {
  let queryString = typeof search === 'string' ? search : JSON.stringify(search);

  const replacements: { [key: string]: string } = {
      'флау': 'flowwow',
      'флауау': 'flowwow',
      'озон': 'ozon',
      'валдбериз': 'wildberries',
      'валбериз': 'wildberries',
      'валдберис': 'wildberries',
      'валберис': 'wildberries',
      'вб': 'wildberries',
      'wb': 'wildberries'
  };

  for (const [key, value] of Object.entries(replacements)) {
      const regex = new RegExp(key, 'gi'); 
      queryString = queryString.replace(regex, value);
  }

  return typeof search === 'string' ? queryString : JSON.parse(queryString);
}

export default eventHandler(async (event) => {
  const { searchQuery: rawQuery } = getQuery(event);
  const searchQuery = rawQuery ? searchOrb(rawQuery) : rawQuery;

  const query = searchQuery
    ? {
        $or: [
          { items: { $elemMatch: { title: { $regex: searchQuery, $options: 'i' } } } },
          { name: { $regex: searchQuery, $options: 'i' } },
        ],
        disabled: { $ne: true },
      }
    : {};

  let services: any = await Service.find(query)
    .select('-_id name items.slug path items.title items.path path')
    .sort({ disabled: 1 });

  if (searchQuery) {
    services = services.map((service: any) => {
      const filteredItems = service.items.filter((item: any) =>
        item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      return {
        ...service.toObject(),
        items: filteredItems.length > 0 ? filteredItems : service.items,
      };
    });
  }

  if (!services || !services.length) {
    return {
      status: 'error',
      error: [],
    };
  }

  return {
    status: 'ok',
    services,
  };
});
