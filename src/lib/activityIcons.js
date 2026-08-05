import {
  Mail,
  Phone,
  Users,
  StickyNote,
  Calendar,
  ShoppingCart,
  UserPlus,
  Clock,
  Circle,
} from 'lucide-react';

// Icon + accent color per activity type. Used by the timeline and feed.
export const ACTIVITY_ICON = {
  email: Mail,
  call: Phone,
  meeting: Users,
  note: StickyNote,
  event: Calendar,
  purchase: ShoppingCart,
  app_signup: UserPlus,
  follow_up: Clock,
  other: Circle,
};

export const ACTIVITY_ICON_COLOR = {
  email: 'text-blue-600 bg-blue-50',
  call: 'text-green-600 bg-green-50',
  meeting: 'text-violet-600 bg-violet-50',
  note: 'text-gray-600 bg-gray-100',
  event: 'text-pink-600 bg-pink-50',
  purchase: 'text-teal-600 bg-teal-50',
  app_signup: 'text-sky-600 bg-sky-50',
  follow_up: 'text-amber-600 bg-amber-50',
  other: 'text-gray-500 bg-gray-100',
};
