import { createClient } from "@hey-api/openapi-ts";

async function generateApi() {
    try {
        await createClient({
            client: "@hey-api/client-fetch",
            input: "./docs/openapi.json",
            output: "./src/api"
        });
    } catch (error) {
        console.error(error);
    }
}

generateApi();