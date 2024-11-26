import { ApifyClient } from 'apify-client';
import { error } from 'console';
import dotenv from 'dotenv'

dotenv.config()

// Initialize the ApifyClient with API token
const client = new ApifyClient({
    token: process.env.API_TOKEN,
});

export default async function handler(req, res) {
    try {
        const { username } = req.query;
        if (!username) res.status(404).json({ error: 'Missing the username parameter'});
    
        const input = { username: [username], };

        const run = await client.actor("dSCLg0C3YEZ83HzYX").call(input);

        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        const latestReels = items.slice(0, 3).map(item => ({
            type: item.type,
            media_url: item.videoUrl || item.imageUrl, // URL del video o imagen
            post_url: item.url,
        }))

        return res.status(200).json(latestReels)
    } catch (error) {
        console.error('Error processing query', error);
        return res.status(500).json({ error: error.message})
    }
}


// Prepare Actor input
const input = {
    "usernames": [
        "hotelzamora"
    ]
};

(async () => {
    // Run the Actor and wait for it to finish
    const run = await client.actor("dSCLg0C3YEZ83HzYX").call(input);

    // Fetch and print Actor results from the run's dataset (if any)
    console.log('Results from dataset');
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    items.forEach((item) => {
        console.dir(item);
    });
})();