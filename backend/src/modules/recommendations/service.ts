import { getEstimatedDeliveryDate } from '../../lib/delivery.js';
import { BookDto, toBookDto } from '../catalogue/service.js';
import * as recRepo from './repository.js';

export async function getRecommendations(userId?: number): Promise<{ items: BookDto[] }> {
  let rows = userId ? await recRepo.findRecommendationsForUser(userId) : [];

  if (rows.length === 0) {
    rows = await recRepo.findFallbackRecommendations();
  }

  const deliveryDate = getEstimatedDeliveryDate();
  return {
    items: rows.map((r) => toBookDto(r, deliveryDate)),
  };
}
