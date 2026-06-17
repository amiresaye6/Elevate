import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class AuditService {
  async classifySession(
    description: string,
    mentorStack: string,
  ): Promise<{
    predictedTag: string;
    confidenceScore: number;
    status: string;
  }> {
    // 1. Simulating classification failure for rollback testing
    if (description && description.toLowerCase().includes('fail-audit')) {
      throw new InternalServerErrorException(
        'Simulated AI Classification service failure (rollback test).',
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_AI_API;

    if (!apiKey) {
      throw new InternalServerErrorException(
        'AI Classification failed: Gemini API key is not configured in the server environment.',
      );
    }

    try {
      const prompt = `
You are a technical classifier. Classify the following mentorship session description into one of these technical stacks:
React, Node.js, NestJS, Angular, Python, Django, FastAPI, System Design, DevOps, Database Design.

Output EXACTLY a JSON block with these keys:
- predictedTag: string (one of the 10 stacks listed above)
- confidenceScore: number (a float between 0.0 and 1.0)
- status: string ("SUCCESS" or "FAILED")

If you cannot classify it, use "${mentorStack}" as the predictedTag and status "FAILED".

Session Description: "${description}"
      `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}`);
      }

      const result = await response.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Clean markdown code blocks from output if Gemini included them
      const jsonText = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(jsonText);

      return {
        predictedTag: parsed.predictedTag || mentorStack,
        confidenceScore:
          typeof parsed.confidenceScore === 'number'
            ? parsed.confidenceScore
            : 0.85,
        status: parsed.status || 'SUCCESS',
      };
    } catch (error) {
      console.error('Error in Gemini classification:', error);
      throw new InternalServerErrorException(
        `AI Classification service failed: ${error.message || error}`,
      );
    }
  }
}
