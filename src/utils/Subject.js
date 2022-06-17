exports.generateMaiTemplate = (otp) => {
    return (`
    <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8>
                <meta http-equiv="X-UA-Compatible" content="IE-edge>
                
                <style>
                    @media only screen and (max-width:620px){
                        h1{
                            font-size: 20px;
                            padding: 5px;
                        }
                    }
                </style>
            </head>

            <body>
                <div style="max-width: 620px; margin: 5 auto; font-family: sans-serif; color: #272727;">
                    <h1 style="background: #f6f6f6; padding: 10px; text-align:center; color: #272727;">
                        Welcome to the Global Talk, Chat Platfrom!
                    </h1>
                    <p style="margin-left:20px;">Please Verify Your Email To Continue, Your Verification Code is:</p>
                    <p style="width: 80px; margin: 0 auto; font-weight: bold; text-align:center; background: #f6f6f6; border-radius: 5px; font-size: 25px;">
                        ${otp}
                    </p>
                </div>
            </body>

        </html>`
    )
}


exports.afterMailVerifiedTemplate = (message) => {
    return (`
    <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8>
            <meta http-equiv="X-UA-Compatible" content="IE-edge>
        </head>

        <body>
            <div style="max-width: 620px; margin: 0 auto; font-family: sans-serif; color: #272727;">
                <p style="color: #272727; text-align:center;">
                    ${message}
                </p>
            </div>
        </body>

    </html>`
    )
}