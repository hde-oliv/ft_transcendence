import { createElement } from "react"


const PathElement = (props: { fill?: string, d: string } = { fill: 'currentColor', d: '' }) => {
  return createElement('path', { d: props.d, color: props.fill })
}

export default PathElement;
