import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Oftisoft Backend</title>
          <style>
              body {
                  margin: 0;
                  padding: 0;
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                  color: #fff;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  text-align: center;
              }
              .container {
                  background: rgba(255, 255, 255, 0.05);
                  padding: 2rem 4rem;
                  border-radius: 20px;
                  backdrop-filter: blur(10px);
                  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                  border: 1px solid rgba(255, 255, 255, 0.1);
              }
              h1 {
                  font-size: 3.5rem;
                  margin-bottom: 1rem;
                  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
              }
              p {
                  font-size: 1.2rem;
                  color: #e0e0e0;
                  margin-bottom: 2rem;
              }
              .status {
                  display: inline-block;
                  padding: 0.5rem 1rem;
                  background: rgba(46, 204, 113, 0.2);
                  color: #2ecc71;
                  border-radius: 50px;
                  font-weight: 600;
                  border: 1px solid rgba(46, 204, 113, 0.3);
              }
              .logo {
                  font-size: 4rem;
                  margin-bottom: 1rem;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="logo">🚀</div>
              <h1>Oftisoft Backend</h1>
              <p>API Server is running successfully.</p>
              <div class="status">● System Operational</div>
              <p style="margin-top: 20px; font-size: 0.9rem; opacity: 0.7;">Ready to accept connections</p>
          </div>
      </body>
      </html>
    `;
  }
}
