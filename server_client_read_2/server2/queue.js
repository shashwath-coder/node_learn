const { Queue, Worker } = require('bullmq')

const connection = { host: '127.0.0.1', port: 6379 }

const ordersQueue = new Queue('overflow-orders', { connection })

function createWorker(onJob) {
  const worker = new Worker(
    'overflow-orders',
    async (job) => {
      await onJob(job.data)
    },
    { connection, autorun: false }
  )
  return worker
}

module.exports = { ordersQueue, createWorker }