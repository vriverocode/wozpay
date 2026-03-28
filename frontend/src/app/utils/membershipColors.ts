import { MembershipTier } from '../types/membership';

export interface MembershipColors {
  gradient: string;
  primary: string;
  light: string;
  badge: string;
  border: string;
  hover: string;
  shadow: string;
}

export const membershipColors: Record<MembershipTier, MembershipColors> = {
  gratuito: {
    gradient: 'from-blue-500 via-blue-600 to-blue-500',
    primary: 'bg-blue-600',
    light: 'from-blue-50',
    badge: 'text-blue-600',
    border: 'border-blue-400',
    hover: 'hover:border-blue-400',
    shadow: 'shadow-blue-200'
  },
  basico: {
    gradient: 'from-gray-400 via-gray-500 to-gray-400',
    primary: 'bg-gray-500',
    light: 'from-gray-50',
    badge: 'text-gray-600',
    border: 'border-gray-400',
    hover: 'hover:border-gray-400',
    shadow: 'shadow-gray-200'
  },
  regular: {
    gradient: 'from-green-500 via-green-600 to-green-500',
    primary: 'bg-green-600',
    light: 'from-green-50',
    badge: 'text-green-600',
    border: 'border-green-400',
    hover: 'hover:border-green-400',
    shadow: 'shadow-green-200'
  },
  'emprendedor-business': {
    gradient: 'from-yellow-500 via-amber-500 to-yellow-500',
    primary: 'bg-yellow-600',
    light: 'from-yellow-50',
    badge: 'text-yellow-700',
    border: 'border-yellow-500',
    hover: 'hover:border-yellow-500',
    shadow: 'shadow-yellow-200'
  }
};

export function getMembershipColors(tier: MembershipTier): MembershipColors {
  return membershipColors[tier];
}