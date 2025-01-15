import type { ResourceEventManager, IResourceEventHandler } from '../core/ResourceEvents';
import type { ISubscription } from './subscription.types';

export function setupSubscriptionEvents(eventManager: ResourceEventManager): void {
  // Log all subscription status changes
  const statusChangeHandler: IResourceEventHandler<ISubscription> = async (event) => {
    if (event.type === 'afterUpdate' && event.data) {
      console.log(
        `Subscription ${event.data.id} status changed to ${
          event.data.status
        } at ${new Date().toISOString()}`,
      );
    }
  };

  eventManager.on('afterUpdate', statusChangeHandler);
}
