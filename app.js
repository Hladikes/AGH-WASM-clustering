import { createCanvas } from './canvas.js'
import { PointsManager, generatePoints } from './points.js'
import Constants from './constants.js'

/**
 * @param {Uint32Array} pointsBuffer 
 */
function drawPoints(pointsBuffer) {
  const points = new PointsManager(pointsBuffer)
  const { canvas, ctx } = createCanvas(Constants.SIZE, Constants.SIZE)

  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const point of points) {
    const posX = point[0]
    const posY = point[1]
    const cid = point[2]

    ctx.fillStyle = colors[cid]
    ctx.fillRect(posX, posY, 1, 1)
  }

  return canvas.toDataURL()
}


/**
 * @param {string} imageSrc 
 */
function showPopup(imageSrc) {
  const container = document.createElement('div')
  container.style.background = 'rgba(0, 0, 0, 0.7)'
  container.style.position = 'fixed'
  container.style.inset = '0'
  container.style.display = 'flex'
  container.style.alignItems = 'center'
  container.style.justifyContent = 'center'
  container.onclick = () => container.remove()

  const img = document.createElement('img')
  img.src = imageSrc
  img.style.maxWidth = '750px'
  img.style.width = '100%'
  img.style.border = '1px solid gray'

  container.appendChild(img)

  document.body.appendChild(container)
}

/**
 * @param {string} image 
 * @param {number} duration 
 * @returns {HTMLElement}
 */
function createCard(image, duration) {
  const container = document.createElement('div')
  container.style.borderRadius = '8px'
  container.style.backgroundColor = 'black'
  container.style.border = '1px solid #454545'
  container.style.padding = '10px'
  container.style.display = 'inline-block'
  container.style.margin = '8px'
  container.style.cursor = 'pointer'
  container.onclick = () => showPopup(image)

  const imageEl = document.createElement('img')
  imageEl.src = image
  imageEl.width = imageEl.height = 150

  const durationLabel = document.createElement('p')
  durationLabel.style.color = 'white'
  durationLabel.style.fontSize = '20px'
  durationLabel.style.margin = '0'
  durationLabel.style.paddingTop = '10px'

  const formattedDuration = new Intl.NumberFormat('fr-FR', { useGrouping: true }).format(duration | 0)
  durationLabel.innerHTML = formattedDuration + ' <span style="font-size: 15px">ms</span>'

  container.appendChild(imageEl)
  container.appendChild(durationLabel)

  return container
}


const pointsManager = generatePoints(
  Constants.POINTS_COUNT, 
  Constants.CLUSTERS_COUNT, 
  Constants.SIZE, 
  Constants.OFFSET
)

const colors = Array(Constants.CLUSTERS_COUNT)
  .fill('')
  .map((_, idx) => `hsl(${(360 / Constants.CLUSTERS_COUNT) * idx + 1}, 100%, 50%)`)

  
const wasmResultsContainer = document.createElement('div')
wasmResultsContainer.style.flex = '1'

const wasmTitle = document.createElement('h1')
wasmTitle.style.color = 'white'
wasmTitle.innerText = 'C++ & WASM'

wasmResultsContainer.appendChild(wasmTitle)
document.body.appendChild(wasmResultsContainer)

;(async () => {
  for (let i = 0; i < Constants.NUMBER_OF_ROUNDS; i++) {
    await new Promise((resolve) => {
      const workerWasm = new Worker('./worker-wasm/worker.js', { type: 'module' })
      const t1 = performance.now()
    
      workerWasm.onmessage = (msg) => {
        const duration = performance.now() - t1
        const buffer = msg.data
        const image = drawPoints(buffer)
        const card = createCard(image, duration)
        wasmResultsContainer.appendChild(card)
        workerWasm.terminate()
        resolve()
      }
    
      workerWasm.postMessage(pointsManager.buffer)
    })
  }  
})()

const jsResultsContainer = document.createElement('div')
jsResultsContainer.style.flex = '1'

const jsTitle = document.createElement('h1')
jsTitle.style.color = 'white'
jsTitle.innerText = 'JavaScript'

jsResultsContainer.appendChild(jsTitle)
document.body.appendChild(jsResultsContainer) 

;(async () => {
  for (let i = 0; i < Constants.NUMBER_OF_ROUNDS; i++) {
    await new Promise((resolve) => {
      const workerJs = new Worker('./worker-js/worker.js', { type: 'module' })
      const t1 = performance.now()
    
      workerJs.onmessage = (msg) => {
        const duration = performance.now() - t1
        const buffer = msg.data
        const image = drawPoints(buffer)
        const card = createCard(image, duration)
        jsResultsContainer.appendChild(card)
        workerJs.terminate()
        resolve()
      }
    
      workerJs.postMessage(pointsManager.buffer)
    })
  }
})()
