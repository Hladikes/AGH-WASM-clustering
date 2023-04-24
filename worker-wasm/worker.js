import loadWASM from './main.mjs'
import Constants from '../constants.js'

onmessage = async (msg) => {
  const buffer = msg.data
  await doCentroids(buffer)
  postMessage(buffer)
}

function wrapMemory(module) {
  return {
    /**
     * @param {Uint32Array} data 
     * @returns {number}
     */
    set(data) {
      const ptr = module._malloc(data.buffer.byteLength)
      module.HEAPU32.set(data, ptr >> 2)
      return ptr
    },
    /**
     * @param {number} address
     * @param {number} size
     * @returns {Uint32Array} 
     */
    get(address, size) {
      return module.HEAPU32.subarray(address >> 2, (address >> 2) + size)
    },
    free(address) {
      module._free(address)
    }
  }
}

/**
 * @param {Uint32Array} buffer 
 */
async function doCentroids(buffer) {
  const module = await loadWASM()
  const memory = wrapMemory(module)
  const ptr = memory.set(buffer)
  const newPtr = module._do_centroids(
    ptr,
    buffer.length,
    Constants.CLUSTERS_COUNT,
    Constants.SIZE
  )

  buffer.set(memory.get(newPtr, buffer.length))
  memory.free(newPtr)
}