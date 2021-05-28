import ipc from './ipc.js'

let counter = 0

console.log('started')

setTimeout(() => {
  process.stdout.write('window;open')
}, 1024)

ipc.receive(async data => {
  return {
    received: data,
    counter: counter++
  }
})

setInterval(() => {
  counter++
 
  // send an odd sized message
  const size = Math.floor(Math.random() * 1e3)
  const data = new Array(size).fill(0)

  ipc.send({ sending: data.join(''), counter })
}, 5090) // send at some interval

process.on('beforeExit', () => {
  console.log('exiting')
})
