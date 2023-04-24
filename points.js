export class PointsManager {
  /**
   * @param {Uint32Array | number} count 
   */
  constructor(param) {
    if (param instanceof Uint32Array) {
      this.count = param.length / 3
      this.buffer = param
    } else {
      this.count = param
      this.buffer = new Uint32Array(param * 3)
    }
  }

  set(idx, posX, posY, clusterId = 0) {
    const pos = idx * 3

    if (pos >= this.count * 3) {
      throw 'Out of range'
    }

    this.buffer[pos] = posX
    this.buffer[pos + 1] = posY
    this.buffer[pos + 2] = clusterId
  }

  get(idx) {
    if (idx * 3 >= this.count * 3) {
      throw 'Out of range'
    }

    return this.buffer.subarray(idx * 3, idx * 3 + 3)
  }

  *[Symbol.iterator]() {
    for (let i = 0; i < this.count; i++) {
      yield this.get(i)
    }
  }
}

export function generatePoints(count = 30_000, initCount = 5, range = 750, offset = 50) {
  const pointsManager = new PointsManager(count)

  for (let i = 0; i < initCount; i++) {
    const posX = Math.random() * range | 0
    const posY = Math.random() * range | 0
    pointsManager.set(i, posX, posY)
  }

  for (let i = initCount; i < count; i++) {
    const randomIdx = Math.random() * i | 0
    const randomPoint = pointsManager.get(randomIdx)
    const posX = randomPoint[0] + Math.random() * offset * 2 - offset
    const posY = randomPoint[1] + Math.random() * offset * 2 - offset
    const clusterId = randomPoint[2]
    pointsManager.set(i, posX, posY, clusterId)
  }

  return pointsManager
}