// Replicate Stable Diffusion Service - Cost-effective AI image generation
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export const generateImageWithStableDiffusion = async (name: string, topic: string): Promise<string> => {
  try {
    // Optimized prompt for small images and object recognition
    const prompt = `professional product photo of ${name}, clean white background, centered, high contrast, sharp focus, commercial photography style, ${topic} context, realistic, detailed`;
    
    const negative_prompt = "blurry, low quality, distorted, watermark, text, logo, signature, abstract, artistic, painting, sketch";

    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: prompt,
          negative_prompt: negative_prompt,
          width: 768,
          height: 1024, // 3:4 aspect ratio
          num_outputs: 1,
          scheduler: "K_EULER",
          num_inference_steps: 25, // Good balance of quality/speed
          guidance_scale: 7.5,
          seed: Math.floor(Math.random() * 1000000), // Random seed for variety
        }
      }
    );

    // Return the first generated image URL
    if (Array.isArray(output) && output.length > 0) {
      return output[0] as string;
    }
    
    throw new Error('No image generated');
  } catch (error) {
    console.error(`Stable Diffusion generation failed for "${name}":`, error);
    // Fallback to Picsum
    return `https://picsum.photos/seed/${name.replace(/\s+/g, '-')}/600/800`;
  }
};

// Alternative: Faster model for even cheaper generation
export const generateImageWithStableDiffusionTurbo = async (name: string, topic: string): Promise<string> => {
  try {
    const prompt = `${name}, product photo, clean background, ${topic}, realistic, high quality`;

    const output = await replicate.run(
      "stability-ai/sdxl-turbo:da77bc59ee60423279fd632efb4795ab731d9e3ca9705ef3341091fb989b7eaf",
      {
        input: {
          prompt: prompt,
          width: 768,
          height: 1024,
          num_outputs: 1,
          num_inference_steps: 4, // Much faster, very cheap
          guidance_scale: 1.0,
        }
      }
    );

    if (Array.isArray(output) && output.length > 0) {
      return output[0] as string;
    }
    
    throw new Error('No image generated');
  } catch (error) {
    console.error(`Stable Diffusion Turbo generation failed for "${name}":`, error);
    return `https://picsum.photos/seed/${name.replace(/\s+/g, '-')}/600/800`;
  }
};

// Cost comparison:
// SDXL: ~$0.0023 per image (25 steps)
// SDXL Turbo: ~$0.0004 per image (4 steps) - 85% cheaper!
// DALL-E 3: ~$0.040 per image - 17x more expensive than SDXL
