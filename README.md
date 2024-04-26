# WhatsApp number checker

This project uses [2Chat's](https://2chat.co?ref=gh) public API to verify if a given phone number has a WhatsApp account.

It takes as input a CSV file containing the numbers to check, and it outputs another CSV file with the results returned by the API.

For more information about the API in use here, please check [2Chat's developer portal](https://developers.2chat.co/docs/API/WhatsApp/check-number/?ref=gh).

> [!NOTE]
> This is the programmatic and fastest way of checking WhatsApp numbers. For a non-programmatic option, please check out our [bulk verifier app](https://help.2chat.io/en/articles/8073336-how-to-bulk-verify-if-numbers-have-a-whatsapp-account).

> [!TIP]
> The script defaults to waiting 5 seconds between each check to prevent being throttled by the API. If you have a paid subscription with 2Chat, you can lower value time to 1 second.

## Requisites

* A 2Chat account. You can create one [here](https://app.2chat.io/signup).

* A WhatsApp number connected to your account. You can learn how to connect one [here](https://help.2chat.io/en/articles/7243195-how-to-create-a-whatsapp-channel?ref=gh).

* Your 2Chat API key. Learn where to obtain it [here](https://help.2chat.io/en/articles/7830948-where-you-can-find-the-api-code-in-2chat?ref=gh).

## How to use the script

This is a Node script written in Javascript.

To run it, clone this repository and:

* Create a file named `.env` with your API key in it:
```
API_KEY=<your API key here>
```

* Install the dependencies:
```
$ npm install
```

* Create a file with the numbers you want to check. For example, `my-numbers-to-check.csv` and use the following format:

```
+17137157533
+525511223344
+31206490787
```

* Call the script with the configured parameters:

```
Options:
  --help                     Show help                                 [boolean]
  --version                  Show version number                       [boolean]
  --input-file, --in         Input file containing the list of numbers you want
                             to verify                       [string] [required]
  --output-file, --out       Output file where the script will append the result
                             of each number verification     [string] [required]
  --source-number, --number  The number connected to 2Chat you want to use to
                             run this script and perform the number
                             verifications                   [string] [required]
```

`--number` must be the number you connected to your 2Chat account. For example, `+17137157533`.

```
$ node check-number.js --in=my-numbers-to-check.csv --out=verification-results.csv --number=+17137157533
```

* Check the output file for the results:

```
$ cat verification-results.csv
```

## API limits and running this script in parallel

We recommend you run a single instance of this script for every connected number on your 2Chat account to achieve faster speeds.

Your account may be rate-limited during the trial period.

## Support

If you encounter issues or have any problems, please reach out to our support channels at [2Chat.co](https://2chat.co?ref=gh).
