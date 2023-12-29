import './style.css'
import { setupD3 } from './d3_test'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <div id="container"></div>
  </div>
`

setupD3(document.querySelector<HTMLElement>('#container')!)
