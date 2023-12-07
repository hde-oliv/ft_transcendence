import { DividerProps, createIcon } from "@chakra-ui/react"
import { ReactElement, createElement } from "react"

const PathElement = (props: { fill: string, d: string }) => {
  return createElement('path', { d: props.d, color: props.fill })
}

const DowngradeIcon = createIcon({
  displayName: "DowngradeIcon",
  viewBox: "0 0 128 128",
  path: [
    PathElement({ fill: 'currentColor', d: 'M76.6 5.6C64.5 10 56.8 21.1 56.8 34.1c0 17.1 13 30.1 30.3 30.1 16.4 0 28.8-12 29.7-28.9.4-6.1 0-8-2.2-13-3.5-7.6-7.7-11.9-15.1-15.4-6.9-3.3-16.1-3.8-22.9-1.3zM97.5 11c17.2 7.3 19.9 32.4 4.6 43.5-7.4 5.4-14.1 6.6-23 3.9C69.3 55.5 61 44.7 61 34.7 61 16 80.2 3.5 97.5 11z' }),
    PathElement({ fill: 'currentColor', d: 'M80.3 15.8c-.7.5-1.3 3.9-1.5 8.7l-.3 8-3.7.3c-5.7.5-4.9 2.8 4.2 12.3l8 8.4 7.9-8.5c9.3-9.8 10-12 4.1-12h-4v-8.4c0-6.7-.3-8.5-1.6-9-2.2-.9-11.7-.7-13.1.2zM90 26.9c0 8.2.6 10.1 3.1 10.1 2.8 0 2.4.9-2.3 5.7l-4.1 4.2-3.8-4.2C78.5 37.9 78.2 37 81 37c1.8 0 2-.7 2-8.5V20h7v6.9zM41.3 53.7C40.6 54 40 55 40 56c0 1.3 1 1.9 3.8 2.4 4.6.7 10.9 6 11.8 9.8.5 2.3.3 2.8-1.4 2.8-1 0-3.1-.9-4.5-2-3.1-2.5-3.2-2.5-9.2.5-2.9 1.4-6.8 2.5-9.4 2.5-4 0-4.3-.1-3.6-2.3 1.9-5.9 1.8-7.7-.3-7.7-3 0-4.7 5.8-4.7 16 0 6.4.5 9.3 1.9 12 1.4 2.6 1.6 3.5.6 3.8-3.2 1.1-9.2 8-12.1 13.7-2.4 4.9-3 7.2-2.7 11.1l.3 4.9 18.9.3c19.1.2 22.1-.2 20.9-3.4-.3-.8-1.8-1.4-3.4-1.4H44v-7.5c0-4.1.3-7.5.6-7.5s2.3 1.4 4.4 3.1c5.3 4.3 6.8 3.5 7.2-3.8l.3-5.8 4.7 4.7c2.7 2.9 5.2 6.7 6.2 9.5 2.2 6.5 2.1 7.3-1.3 7.3-1.7 0-3.3.5-3.6 1-1.2 1.9 1.7 4 5.4 4 5.7 0 6.5-1 5.7-7-1.1-8.4-6.6-17.4-13.5-22.3-2.5-1.6-2.5-1.7-.8-5.2C60.5 87 61 83.4 61 77.4c0-11.8-2.6-17.6-9.5-21.2-3.6-1.8-8.5-3-10.2-2.5zM55.4 76c1.7 0 1.8.5 1.2 5.2-.9 6.7-3 10.1-7.9 12.8C38.8 99.6 27 92.2 27 80.3v-3.8l5.3-.1c3.1 0 6.8-.9 9.1-2.1 3.9-2 4-2 8-.2 2.3 1 4.9 1.9 6 1.9zm-25.8 33.7c.8.3 2.5-.3 3.7-1.4 5.9-5.1 5.7-5.3 5.7 3.1v7.6H14.2l.7-3.3c1.3-5.3 4.7-11.2 8.8-14.7l3.8-3.4.3 5.8c.2 3.9.8 5.9 1.8 6.3zm5.2-9.5c-.6 1.8-2.8 2.1-2.8.4 0-.9.7-1.6 1.6-1.6.9 0 1.4.5 1.2 1.2zm16.2.3c0 .8-.4 1.5-.9 1.5-1.3 0-2.2-1.6-1.4-2.4 1.1-1.1 2.3-.6 2.3.9z' }),
    PathElement({ fill: 'currentColor', d: 'M34.3 81.6c-.8 2.1 1.3 4.2 2.8 2.7 1.3-1.3.5-4.3-1.1-4.3-.6 0-1.3.7-1.7 1.6zM46.1 81.4c-.8 1-.7 1.7.3 2.6 1.7 1.3 3.6.6 3.6-1.5 0-1.9-2.7-2.6-3.9-1.1zM30 59.1c0 1.4.5 1.9 1.7 1.7 2.6-.5 2.9-3.8.4-3.8-1.5 0-2.1.6-2.1 2.1zM55.7 120.4c-.8 1.9 1.5 3.7 3.2 2.6 1.7-1 .7-4-1.3-4-.7 0-1.6.6-1.9 1.4z' }),
  ]
});

export default DowngradeIcon;