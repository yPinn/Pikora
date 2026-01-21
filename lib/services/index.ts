/**
 * Meta API 服務統一匯出
 *
 * 使用方式:
 * ```typescript
 * import { createMetaServices } from '@/lib/services';
 *
 * const services = createMetaServices({
 *   appId: process.env.META_APP_ID!,
 *   appSecret: process.env.META_APP_SECRET!,
 * });
 *
 * // 使用 Facebook 服務
 * const pages = await services.facebook.getPages(userToken);
 *
 * // 使用 Instagram 服務
 * const media = await services.instagram.getMedia(igUserId, token);
 *
 * // 使用 Threads 服務
 * const posts = await services.threads.getPosts(threadsUserId, token);
 * ```
 */

// 類型匯出
export * from './types';

// 基礎服務匯出
export { MetaApiBase, MetaApiException } from './base';

// Facebook 服務匯出
export {
  FacebookService,
  createFacebookService,
  type FacebookPage,
  type FacebookPost,
  type FacebookComment,
  type FacebookAttachment,
  type FacebookInsight,
  type CreatePostParams,
  type CreateMediaPostParams,
} from './facebook';

// Instagram 服務匯出
export {
  InstagramService,
  createInstagramService,
  type InstagramAccount,
  type InstagramAccountType,
  type InstagramMedia,
  type InstagramComment,
  type InstagramInsight,
  type MediaContainerStatus,
  type ContentPublishingLimit,
  type CreateImageParams,
  type CreateReelsParams,
  type CreateStoriesParams,
  type CreateCarouselParams,
} from './instagram';

// Threads 服務匯出
export {
  ThreadsService,
  createThreadsService,
  type ThreadsProfile,
  type ThreadsPost,
  type ThreadsReply,
  type ThreadsMediaType,
  type ThreadsPublishStatus,
  type ThreadsContainerStatus,
  type ThreadsInsight,
  type ThreadsPublishingLimit,
  type CreateTextPostParams,
  type CreateImagePostParams as ThreadsCreateImagePostParams,
  type CreateVideoPostParams as ThreadsCreateVideoPostParams,
  type CreateCarouselPostParams as ThreadsCreateCarouselPostParams,
} from './threads';

import { FacebookService } from './facebook';
import { InstagramService } from './instagram';
import { ThreadsService } from './threads';
import { type MetaServiceConfig } from './types';

/**
 * Meta 服務集合介面
 */
export interface MetaServices {
  facebook: FacebookService;
  instagram: InstagramService;
  threads: ThreadsService;
}

/**
 * 建立所有 Meta API 服務實例
 */
export function createMetaServices(config: MetaServiceConfig): MetaServices {
  return {
    facebook: new FacebookService(config),
    instagram: new InstagramService(config),
    threads: new ThreadsService(config),
  };
}

/**
 * 從環境變數建立 Meta 服務
 */
export function createMetaServicesFromEnv(): MetaServices {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error('缺少必要的環境變數: META_APP_ID 和 META_APP_SECRET');
  }

  return createMetaServices({ appId, appSecret });
}

/**
 * 單例模式的服務實例（用於伺服器端）
 */
let servicesInstance: MetaServices | null = null;

export function getMetaServices(): MetaServices {
  if (!servicesInstance) {
    servicesInstance = createMetaServicesFromEnv();
  }
  return servicesInstance;
}
