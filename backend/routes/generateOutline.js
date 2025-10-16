const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require('openai');

// Load environment variables or configure your OpenAI API key
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Load and validate schema
const storyOutlineSchema = require('../schemas/StoryOutline.json');
const Ajv = require('ajv');
const ajv = new Ajv();
const validate = ajv.compile(storyOutlineSchema);

function buildFanficPrompt({ fandom, characters, genre, tone }) {
  return `You are an expert fanfiction story architect. Generate a detailed outline for a story in the ${fandom} universe featuring characters: ${characters.join(", ")}.\nTone: ${tone}\nGenre: ${genre}\nReturn your response as a JSON object matching this schema: ${JSON.stringify(storyOutlineSchema)}.\nMake sure the JSON is valid.`;
}

router.post('/generate-outline', async (req, res) => {
  try {
    const { fandom, characters, genre, tone } = req.body;
    if (!fandom || !characters || !genre || !tone) {
      return res.status(400).json({ error: 'Missing required fields: fandom, characters, genre, tone' });
    }

    const prompt = buildFanficPrompt({ fandom, characters, genre, tone });

    const completion = await openai.createChatCompletion({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = completion.data.choices[0].message.content;

    // Parse and validate the response JSON
    let storyOutline;
    try {
      storyOutline = JSON.parse(responseText);
    } catch (e) {
      return res.status(422).json({ error: 'Invalid JSON format from AI response' });
    }

    const valid = validate(storyOutline);
    if (!valid) {
      return res.status(422).json({ error: 'Response does not conform to StoryOutline schema', details: validate.errors });
    }

    res.json(storyOutline);
  } catch (error) {
    console.error('Error generating outline:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
