# Integrity Book

This project allows you to download a JSON file of your book of business from the Integrity platform CRM [Contacts List](https://clients.integrity.com/contacts/list).

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.36. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Features

- Fetches data from the Integrity CRM.
- Outputs the data in JSON format for further processing.

## Credentials

You will need the following credentials:

- HTTP Authorization Bearer token

The bearer token can be obtained from the browser developer tools. Open the network tab, locate a request to the Integrity API, and copy the `Authorization` header value.

### Environment

Save the `.env.sample` file as `.env` and enter your credentials.

## Usage

1. Ensure you have the required credentials to access the Integrity platform.
2. Run the script using the command:
  ```bash
  bun run index.ts
  ```
3. The JSON file will be saved in the current directory.

### CSV Output

To output the data in CSV format, run the `convert` script:

```bash
bun run convert.ts
```
