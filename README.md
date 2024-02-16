# Figma to typescript

This project is a simple tool to extract the Typescript types from all components in a file.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
Add the following environment variables to a `.env` file in the root of the project:

```
FIGMA_FILE_KEY=your_file_key
FIGMA_PERSONAL_ACCESS_TOKEN=your_personal_access_token
```

Get your `FIGMA_FILE_KEY` from the URL of the file you want to extract the components from. It's the last part of the URL, after the `/file/` part.
Get your `FIGMA_PERSONAL_ACCESS_TOKEN` in settings > Personal access token.

### Installing

A step by step series of examples that tell you how to get a development environment running:

$ git clone [repository url]
$ cd [project directory]
$ npm install

### Build

After installing all the prerequisites and setting up, you can run the following command to build the .ts files:

$ npm run build

If everything goes well, you should see a new folder called `types` with all the files with the same name of your components.


## Built With

- [TypeScript](http://www.typescriptlang.org/) - The main programming language
- [dotenv](https://www.npmjs.com/package/dotenv) - Environment variable manager
- [axios](https://axios-http.com/) - Promise based HTTP client for the browser and node.js

