
// import { NextResponse } from 'next/server';

// export const runtime = 'edge';

// export async function POST(req: Request) {
//   try {
//     // Extract prompt from body
//     const prompt =
//       "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

//     // Read API key from environment
//     const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
//     if (!deepseekApiKey) {
//       return NextResponse.json(
//         { error: 'DeepSeek API key not configured.' },
//         { status: 500 }
//       );
//     }

//     // Make the non-streaming request to DeepSeek via OpenRouter
//     const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${deepseekApiKey}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: "deepseek/deepseek-r1:free",
//         messages: [
//           {
//             role: "user",
//             content: prompt,
//           },
//         ],
//       }),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       return NextResponse.json({ error: data }, { status: response.status });
//     }

//     // Return the response content from the first choice
//     const content = data?.choices?.[0]?.message?.content;

//     return NextResponse.json({ content });
//   } catch (error) {
//     console.error("DeepSeek error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from 'next/server';


export const runtime = 'edge';


export async function POST() {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";


    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekApiKey) {
      return NextResponse.json(
        { error: 'DeepSeek API key not configured.' },
        { status: 500 }
      );
    }


    // Send request with streaming enabled
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1:free',
        stream: true, // Enable streaming here
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });


    if (!response.ok || !response.body) {
      const errorText = await response.text();
      return NextResponse.json({ error: errorText }, { status: response.status });
    }


    // Stream response from API to client
    const stream = new ReadableStream({
      async start(controller) {
        const decoder = new TextDecoder();
        const reader = response.body!.getReader();


        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;


            const chunk = decoder.decode(value, { stream: true });


            // Split on event chunks and only pass delta content
            for (const line of chunk.split('\n')) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data:')) continue;
              const json = trimmed.replace(/^data:\s*/, '');
              if (json === '[DONE]') {
                controller.close();
                return;
              }


              const parsed = JSON.parse(json);
              const text = parsed?.choices?.[0]?.delta?.content;
              if (text) {
                controller.enqueue(new TextEncoder().encode(text));
              }
            }
          }
        } catch (err) {
          console.error('Streaming error:', err);
          controller.error(err);
        }
      },
    });


    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });


  } catch (error) {
    console.error('DeepSeek streaming error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
