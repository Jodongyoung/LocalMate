import { Link as RouterLink, useLocation } from 'react-router-dom'
import type { ComponentProps } from 'react'

type Props = Omit<ComponentProps<typeof RouterLink>, 'to'> & { href: string }

export default function Link({ href, ...rest }: Props) {
  return <RouterLink to={href} {...rest} />
}

export function usePathname() {
  return useLocation().pathname
}