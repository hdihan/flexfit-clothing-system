import { Link } from 'react-router-dom';

/**
 * Colorful avatar showing the user's initials and name.
 * Intended for placement in the header next to the cart icon.
 */
export default function UserAvatar({ user }) {
  if (!user) return null;

  const name = user.name || '';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <Link
      to="/profile"
      className="flex items-center gap-2 group hover:opacity-90 transition-opacity"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
        {initials || '?'}
      </div>
      <span className="text-sm font-medium text-gray-900 group-hover:text-brand-600 hidden sm:inline">
        {name}
      </span>
    </Link>
  );
}
