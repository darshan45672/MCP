import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
    name: "weather mcp server",
    version: "1.0.0",
    description: "A server that provides weather data",
});

server.tool(
    'get-weather',
    'Get the current weather for a given location',
    {
        city: z.string().describe("The city to get the weather for"),
    },
    async ({ city} ) => {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=en&format=json`);
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `No results found for city: ${city}. Please check the city name and try again.`,
                    }
                ]
            };
        }

        const { latitude, longitude } = data.results[0];

        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,rain,showers,apparent_temperature,weather_code`);
        const weatherData = await weatherResponse.json();


        return {
            content : [
                {
                    type: "text",
                    text: JSON.stringify(weatherData, null, 2),
                }
            ]
        }
    }
);

const transport = new StdioServerTransport();

server.connect(transport);

