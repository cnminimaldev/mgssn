// server/middleware/cors.ts
import { defineEventHandler, setResponseHeaders } from 'h3'

export default defineEventHandler((event) => {
  // 1. Thiết lập các Header cho phép truy cập chéo domain (CORS)
  setResponseHeaders(event, {
    'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Expose-Headers': '*'
  })

  // 2. Xử lý nhanh request OPTIONS (Preflight)
  // [CẬP NHẬT] Sử dụng event.method thay vì getMethod(event)
  if (event.method === 'OPTIONS') {
    event.node.res.statusCode = 204
    event.node.res.statusMessage = 'No Content'
    return 'OK'
  }
})