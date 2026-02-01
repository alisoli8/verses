// OpenAI DALL-E 3 Service for high-quality AI image generation
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for client-side usage
});

export const generateImageWithDALLE = async (name: string, topic: string): Promise<string> => {
  try {
    const prompt = `Create a high-quality, iconic image representing "${name}" in the context of "${topic}". The image should be:
    - Directly related to "${name}" (brand logo, product, person, etc.)
    - Professional and recognizable
    - Clean background or relevant context
    - Suitable for a voting comparison
    - Vertical orientation (3:4 aspect ratio)
    
    For brands: show the actual logo or product
    For people: show their recognizable likeness
    For concepts: show clear visual representation
    
    Style: Clean, modern, high-contrast for mobile viewing`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1792", // 3:4 aspect ratio
      quality: "standard", // Use "hd" for higher quality but 2x cost
      response_format: "url"
    });

    return response.data[0].url || `https://picsum.photos/seed/${name.replace(/\s+/g, '-')}/600/800`;
  } catch (error) {
    console.error(`DALL-E image generation failed for "${name}":`, error);
    // Fallback to Picsum
    return `https://picsum.photos/seed/${name.replace(/\s+/g, '-')}/600/800`;
  }
};

// Alternative: Replicate Stable Diffusion (much cheaper)
export const generateImageWithStableDiffusion = async (name: string, topic: string): Promise<string> => {
  try {
    const prompt = `professional photo of ${name}, ${topic} context, high quality, clean background, iconic representation, vertical 3:4 aspect ratio`;

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b", // SDXL
        input: {
          prompt: prompt,
          width: 768,
          height: 1024,
          num_outputs: 1,
          scheduler: "K_EULER",
          num_inference_steps: 20,
          guidance_scale: 7.5
        }
      })
    });

    const prediction = await response.json();
    
    // Poll for completion (simplified - in production use webhooks)
    let result = prediction;
    while (result.status === 'starting' || result.status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      });
      result = await statusResponse.json();
    }

    return result.output?.[0] || `https://picsum.photos/seed/${name.replace(/\s+/g, '-')}/600/800`;
  } catch (error) {
    console.error(`Stable Diffusion generation failed for "${name}":`, error);
    return `https://picsum.photos/seed/${name.replace(/\s+/g, '-')}/600/800`;
  }
};
