# puppeteer-tester

A tester for puppeteer behaviour.
Currently tested version: puppteer v9.

## How to use?

First of all, you need to get your regular Chrome headers by navigating to <https://headers.cf/headers/?format=raw>. Then put them into `expected-headers.txt`.

Then, you need to set your Chrome `executablePath` in `main.spec.ts`. Get it from `chrome://version`.

Then, you can run all the tests.

```bash
yarn install
yarn test
```

## Tests list

- check that the headers are the same wih and without request interception enabled (HTTPBin, headers.cf)
- check that the headers are the same than when using regular chrome (headers.cf)

## Test output

![tests pass!](https://i.ibb.co/qj07cbG/image.png)

All good for `puppeteer@^9.0.0` :tada:

## License

MIT
