import { getFriendsAttendingCounts } from './share-link-service.js';
import { searchEvents } from './ticketmaster-service.js';

export async function respondToChat({ message, city }, countFriends = getFriendsAttendingCounts) {
  if (!city) {
    return { reply: 'Choose a city first and I can look for matching events.', events: [] };
  }

  const result = await searchEvents({ city, keyword: message, page: 0, size: 5 });
  const friends = await countFriends(result.events.map((event) => event.id));
  const events = result.events.map((event) => ({
    ...event,
    friendsAttending: friends[event.id] ?? 0,
  }));

  return {
    reply: events.length
      ? `I found ${events.length} event${events.length === 1 ? '' : 's'} matching that in ${city}.`
      : `I couldn’t find a match for that in ${city}. Try another search.`,
    events,
  };
}