import { PointsManager } from '../points.js'
import Constants from '../constants.js'

onmessage = (msg) => {
  const buffer = msg.data
  doCentroids(buffer)
  postMessage(buffer)
}

function calculateDistance(x1, y1, x2, y2) {
  return ((x2 - x1) ** 2) + ((y2 - y1) ** 2)
}

function assignToCluster(points, clusterOwners) {
  for (const p of points) {
    let distance = Number.MAX_SAFE_INTEGER

    for (const c of clusterOwners) {
      const newDistance = calculateDistance(p[0], p[1], c[0], c[1])

      if (newDistance < distance) {
        distance = newDistance
        p[2] = c[2]
      }
    }
  }
}

/**
 * @param {Uint32Array} buffer 
 */
function doCentroids(buffer) {
  const points = new PointsManager(buffer)
  const centroids = new PointsManager(Constants.CLUSTERS_COUNT)

  for (let i = 0; i < centroids.count; i++) {
    const posX = Math.random() * Constants.SIZE | 0
    const posY = Math.random() * Constants.SIZE | 0
    centroids.set(i, posX, posY, i)
  }

  const sums = Array.from({ length: centroids.count }, () => ({
    total: 0,
    sumX: 0,
    sumY: 0,
  }))

  for (let i = 0; i < 20; i++) {
    assignToCluster(points, centroids)

    for (const sum of sums) {
      sum.total = 0
      sum.sumX = 0
      sum.sumY = 0
    }

    for (const p of points) {
      sums[p[2]].total++
      sums[p[2]].sumX += p[0]
      sums[p[2]].sumY += p[1]
    }

    for (const c of centroids) {
      c[0] = sums[c[2]].sumX / sums[c[2]].total
      c[1] = sums[c[2]].sumY / sums[c[2]].total
    }
  }
}