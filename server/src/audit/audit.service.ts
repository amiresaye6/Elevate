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

      // Try multiple Gemini models in case the default one is overloaded / experiencing 503
      const models = [
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-flash-latest',
        'gemini-pro-latest',
      ];
      let lastError: any = null;
      let parsedResponse: any = null;

      for (const model of models) {
        let retries = 2; // Try twice per model
        while (retries > 0) {
          try {
            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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
              const errBody = await response.json().catch(() => ({}));
              throw new Error(
                `Gemini model ${model} returned status ${response.status}: ${JSON.stringify(errBody)}`,
              );
            }

            const result = await response.json();
            const text =
              result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const jsonText = text.replace(/```json|```/g, '').trim();
            parsedResponse = JSON.parse(jsonText);
            break; // Success! Break out of retry loop
          } catch (e) {
            lastError = e;
            retries--;
            if (retries > 0) {
              await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms before retrying
            }
          }
        }
        if (parsedResponse) {
          break; // Success! Break out of model loop
        }
      }

      if (!parsedResponse) {
        throw lastError || new Error('All Gemini models failed to respond.');
      }

      return {
        predictedTag: parsedResponse.predictedTag || mentorStack,
        confidenceScore:
          typeof parsedResponse.confidenceScore === 'number'
            ? parsedResponse.confidenceScore
            : 0.85,
        status: parsedResponse.status || 'SUCCESS',
      };
    } catch (error) {
      console.error('Error in Gemini classification:', error);
      throw new InternalServerErrorException(
        `AI Classification service failed: ${error.message || error}`,
      );
    }
  }
}
