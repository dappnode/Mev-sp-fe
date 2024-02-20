import { useTheme } from 'next-themes'

export function WalletIcon() {
  const { systemTheme, theme } = useTheme()
  const currentTheme = theme === 'system' ? systemTheme : theme
  const color = currentTheme === 'light' ? 'url(#a)' : 'url(#b)'
  return (
    <svg fill="none" height="18" width="22" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2.5 0A2.503 2.503 0 0 0 0 2.5v13C0 16.879 1.122 18 2.5 18h17c1.378 0 2.5-1.121 2.5-2.5v-9C22 5.122 20.878 4 19.5 4H19V2.5C19 1.122 17.878 0 16.5 0h-14Zm0 1h14c.827 0 1.5.673 1.5 1.5V4H2.5C1.673 4 1 3.327 1 2.5S1.673 1 2.5 1ZM1 4.486c.419.318.935.514 1.5.514h17c.827 0 1.5.673 1.5 1.5v.014A2.472 2.472 0 0 0 19.5 6h-17C1.673 6 1 5.327 1 4.5v-.014Zm0 2c.419.318.935.514 1.5.514h17c.827 0 1.5.673 1.5 1.5V9h-3.49a2.503 2.503 0 0 0-2.5 2.5c0 1.379 1.122 2.5 2.5 2.5h3.398c-.207.581-.757 1-1.408 1h-17c-.827 0-1.5-.673-1.5-1.5V6.486ZM17.51 10H21v3h-3.49c-.827 0-1.5-.673-1.5-1.5s.673-1.5 1.5-1.5Zm-.01 1a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1ZM1 15.486c.419.318.935.514 1.5.514h17c.565 0 1.081-.196 1.5-.514v.014c0 .827-.673 1.5-1.5 1.5h-17c-.827 0-1.5-.673-1.5-1.5v-.014Z"
        fill={color}
      />
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="a"
          x1="0"
          x2="28"
          y1="14.3"
          y2="14.3">
          <stop stopColor="#000092" />
          <stop offset="1" stopColor="#FF00F3" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="b"
          x1="0"
          x2="40"
          y1="14.3"
          y2="14.3">
          <stop stopColor="#fff" />
          <stop offset="1" stopColor="#FF00F3" />
        </linearGradient>
      </defs>
    </svg>
  )
}
