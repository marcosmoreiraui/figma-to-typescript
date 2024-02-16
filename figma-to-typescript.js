const axios = require('axios');
const fs = require('fs');
require('dotenv').config()

const BASE_API_URL = 'https://api.figma.com/v1/files/';
const COMPONENTS_ENDPOINT = '/component_sets?depth=1&organization_id=0&version=1&with_co';
const NODES_ENDPOINT = '/nodes?ids=';

const propTypesToTS = {
    'TEXT': 'string',
    'NUMBER': 'number',
    'BOOLEAN': 'boolean',
    // Change this if you are using a different library
    'INSTANCE_SWAP': 'React.ReactNode',
};

/**
 * Cleans up a given name by removing digits, special characters, and spaces.
 * @param {string} name - The input name to be cleaned.
 * @returns {string} - The cleaned name with digits, special characters, and spaces removed.
 */
const cleanName = (name) => {
    return name
        .replace(/\d/g, '') // Remove any digits
        .replace(/\W/g, ' ') // Remove special characters and convert to space
        .split(' ') // Split string by space
        .join('') // Join the words into one string
        .replace(/\s/g, ''); // Remove spaces if any left
}

/**
 * Converts component property definitions to TypeScript type definitions.
 *
 * @param {Object} componentPropertyDefinitions - The component property definitions in the form of an object.
 * @returns {string} - A string containing the TypeScript type definitions.
 */
function convertToType(componentPropertyDefinitions) {
    const result = [];
    Object.keys(componentPropertyDefinitions).forEach(key => {
        const props = componentPropertyDefinitions[key];
        const cleanKey = cleanName(key);

        if (props.type in propTypesToTS) {
            result.push(`${cleanKey}: ${propTypesToTS[props.type]}`);
        }

        if (props.type === 'VARIANT') {
            result.push(`${cleanKey}: ${props.variantOptions.map(option => `'${option}'`).join(' | ')}`);
        }
    });
    return result.join(', ');
}

/**
 * Asynchronously writes data to a ts file.
 *
 * @async
 * @param {string} filePath - The path to the file.
 * @param {string|Buffer} data - The data to write to the file.
 * @returns {Promise<void>} A Promise that resolves when the operation is complete or rejects with an error.
 * @throws {Error} If an error occurs while writing data to the file.
 */
const writeFile = async (filePath, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, data, 'utf8', (error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    });
}

const getTypes = async (fileKey, accessToken) => {

    if (!fs.existsSync('types')) {
        fs.mkdirSync('types');
    }


    const components = await axios.request({
        method: 'get',
        maxBodyLength: Infinity,
        url: `${BASE_API_URL}${fileKey}${COMPONENTS_ENDPOINT}`,
        headers: {
            'X-Figma-Token': accessToken
        }
    });

    console.log("-----------------------")
    console.log("Writing files...")
    console.log("-----------------------")

    for (const file of components.data.meta.component_sets) {
        const NODE_ID = file.node_id;
        const components = await axios.request(
            {
                method: 'get',
                maxBodyLength: Infinity,
                url: `${BASE_API_URL}${fileKey}${NODES_ENDPOINT}${NODE_ID}`,
                headers: {
                    'X-Figma-Token': accessToken
                }
            }
        );

        const component = components.data.nodes[NODE_ID];
        const type = component.document.type;
        const name = cleanName(component.document.name);

        if (type === 'COMPONENT_SET' && !component.document.name.startsWith(".") && !component.document.name.startsWith("_")) {

            console.log(`Writing ${name}.ts...`)

            const types = convertToType(component.document.componentPropertyDefinitions);
            await writeFile(`types/${name}.ts`, `export type ${name}Props = {${types}}`);
        }
    }

    return components.data;
}

getTypes(process.env.FIGMA_FILE_KEY, process.env.FIGMA_PERSONAL_ACCESS_TOKEN).then(r => {
    console.log("-----------------------")
    console.log("Done!")
    console.log("-----------------------")
});
