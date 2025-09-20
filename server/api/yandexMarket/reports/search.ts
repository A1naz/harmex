import { User } from '@/server/lib/models/User'
import { Report } from '~~/server/lib/models/yandexMarket/Report'
import { Buyout } from '~~/server/lib/models/yandexMarket/Buyout'
import type { Document } from 'mongoose'

interface BuyoutDocument extends Document {
  place: number;
  uuid: string;
  product: {
    image: string;
  };
  // Add other fields from BuyoutSchema if needed
}
interface buyoutInfo {
  place: number
  uuid: string
  image: string
  article: number
  name: string
}
interface historyItem {
  date: Date
  card: String
  screenshots: string[]
  buyout: buyoutInfo
  article: number
  name: string
}

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 32)

  const { string, type } = getQuery(event)
  
  let history
  const format: historyItem[] = []

  const searchString = string?.toString().replaceAll('#', '') || '';
  const isArticleSearch = !isNaN(Number(searchString)) && searchString.length > 0;

  let reportsQuery = Report.find({ user });

  if (isArticleSearch) {
    const buyouts = await Buyout.find({ user, article: Number(searchString) }).select('_id');
    const buyoutIds = buyouts.map(b => b._id);
    reportsQuery = reportsQuery.where('buyout').in(buyoutIds);
  } else {
    const buyout = await Buyout.findOne({ user, uuid: searchString }).select('_id');
    if (buyout) {
      reportsQuery = reportsQuery.where('buyout').equals(buyout._id);
    } else {
      // No buyout found with this UUID, so no reports will be found.
      return [];
    }
  }

  history = await reportsQuery.populate({ 
    path: 'buyout', 
    select: 'place uuid article product.name product.image' 
  });

  if (!history) 
    return []
  for await (const item of history) {
    // Type guard to ensure buyout is populated
    if (!item.buyout)
      continue
    
    const buyout = item.buyout as any;
  
    format.push({
      date: item.date,
      card: item.card,
      screenshots: item.screenshots,
      buyout: {
        article: buyout.article,
        name: buyout.product.name,
        place: buyout.place,
        uuid: buyout.uuid,
        image: buyout.product.image,
      },
    })
  }

  return format
})

