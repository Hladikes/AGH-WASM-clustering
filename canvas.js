export function createCanvas(width = 750, height = 750) {
  const canvas = document.createElement('canvas')
  canvas.height = height
  canvas.width = width
  canvas.style.border = '1px solid gray'

  const ctx = canvas.getContext('2d')

  return {
    canvas,
    ctx,
  }
}