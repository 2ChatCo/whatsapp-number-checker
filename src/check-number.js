#!/usr/bin/env node

//
// WhatsApp number verification script using 2Chat's public API
// 
// Author: 2Chat Team <support@2chat.co>
// More information at:
//     - https://github.com/2ChatCo/whatsapp-number-checker
//     - https://developers.2chat.co/docs/API/WhatsApp/check-number
//  
//

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const fs = require('fs');
const csv = require('csv-parser');
const axios = require('axios');
const path = require('path');
const csvWriter = require('csv-write-stream');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const args = yargs(hideBin(process.argv))
    .option('input-file',
        {
            alias: 'in',
            type: 'string',
            description: 'Input file containing the list of numbers you want to verify'
        }
    )
    .option('output-file',
        {
            alias: 'out',
            type: 'string',
            description: 'Output file where the script will append the result of each number verification'
        }
    )
    .option('source-number',
        {
            alias: 'number',
            type: 'string',
            description: 'The number connected to 2Chat you want to use to run this script and perform the number verifications'
        }
    )
    .demandOption('input-file')
    .demandOption('output-file')
    .demandOption('source-number')
    .argv;

function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time));
} 

async function main() {
    if (!fs.existsSync(args.in)) {
        throw new Error(`Input file [${args.in}] couldn't be found`);
    }

    if (!fs.existsSync(".env")) {
        throw new Error(`Environment file [.env] couldn't be found`);
    }

    if (!process.env.API_KEY) {
        throw new Error(`API_KEY entry is missing in .env file`);
    }

    const numbersToCheck    = [];
    let outputWriter        = null;

    if (!fs.existsSync(args.out)) {
        outputWriter = csvWriter({ headers: ["phone_number", "on_whatsapp", "json_number_information", "json_whatsapp_information"]});
    }
    else {
        outputWriter = csvWriter({sendHeaders: false});
    }

    fs.createReadStream(args.in)
        .pipe(csv({headers: false, skipLines: 1}))
        .on('data', async (row) => {

            //
            // column 0 must always be the phone number
            //
            const phoneNumber = row[0];
            
            if (!phoneNumber)
                return;

            numbersToCheck.push(phoneNumber);
        })
        .on('end', async () => {
            try {
                console.log('CSV file successfully processed. Will check numbers now');
                
                outputWriter.pipe(fs.createWriteStream(args.out, { flags: 'a' }));

                for (const index in numbersToCheck) {
                    verifyNumberAndSave(numbersToCheck[index], outputWriter);

                    //
                    // we wait 5 seconds to respect the API limits or the request will fail
                    //
                    await sleep(5000);
                }
            }
            catch (e) {
                console.error(e);
            }
            finally {
                outputWriter.end();
            }

        }); 
}

function verifyNumberAndSave(numberToVerify, csvWriter) {
    console.log(`Trying to verify number=[${numberToVerify}] using source=[${args.number}]`);

    var config = {
        method: 'GET',
        url:    `https://api.p.2chat.io/open/whatsapp/check-number/${args.number}/${numberToVerify}`,
        headers: { 
            'X-User-API-Key': process.env.API_KEY
        }
    };

    axios(config)
        .then(function (response) {
            try {
                const result = response.data;

                console.log(`${numberToVerify}:`, result);
                
                csvWriter.write({
                    phone_number: numberToVerify,
                    on_whatsapp: result?.on_whatsapp,
                    json_number_information: JSON.stringify(result?.number),
                    json_whatsapp_information: JSON.stringify(result?.whatsapp_info),
                });
            }
            catch (e) {
                console.log(e);
            }
        })
        .catch(function (error) {
            try {
                if (!error?.response) {
                    console.error(e);    
                }
                else {
                    console.error(`API error: status=[${error.response?.status}] reason=[${error.response?.statusText}]:`, error.response?.data);
                    
                    //
                    // Fatal errors
                    //
                    if (error.response.status === 401 || error.response.status === 402 || error.response.status === 404) {
                        process.exit(-1);
                    }

                    console.log(`Checking number=${numberToVerify} failed. Please retry later.`)
                }
            }
            catch (e) {
                console.error(e);
            }
            
        });
}

main();
