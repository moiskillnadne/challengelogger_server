interface Props {
  h2: string;
  p: string;

  passwordExpiresIn: string;
}

export const getEmailLoginTemplate = ({ h2, p, passwordExpiresIn }: Props) =>
  `
  <html>
    <head>
      <style>
        #root {
          width: 100%;
          height: 100%;
        }

        #root > h2 {
          text-align: center;
          margin-top: 24px;
          margin-bottom: 12px;
        }

        #root > p {
          font-size: 16px;
          font-family: san-serif;
        }

        .secondary {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.6)
        }
      </style>
    </head>
    <body>
      <div id="root">
        <h2>${h2}</h2>

        <p>${p}</p>

        <p class="secondary">${passwordExpiresIn}</p>
      </div>
    </body
  </html>
  `;
