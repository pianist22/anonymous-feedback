'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const specialChar = '||';

const initialString =
  "What's your favorite movie?||Do you have pets?||What's your dream job?";

const messageSchema = z.object({
  content: z.string().min(1, 'Please enter a message'),
});

export default function SendMessage() {
  const params = useParams<{ username: string }>();
  const username = params?.username ?? 'unknown';

  const [suggestions, setSuggestions] = useState<string[]>(
    initialString.split(specialChar).map((s) => s.trim())
  );
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: '',
    },
  });

  const content = form.watch('content');

  async function fetchSuggestions() {
    setLoadingSuggestions(true);
    try {
      const response = await axios.post('/api/suggest-messages');
      const data = response.data;
      console.log(data);

      // If returned as a plain string with delimiter
      const suggestions = typeof data === 'string'
        ? data.split(specialChar).map((s: string) => s.trim())
        : Array.isArray(data)
        ? data
        : [];

      setSuggestions(suggestions);
      toast.success('Suggestions updated!');
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message || 'Failed to fetch suggestions');
    } finally {
      setLoadingSuggestions(false);
    }
  }

   const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    try {
      await axios.post('/api/send-message', {
        username,
        content: data.content,
      });
      toast.success('Message Sent Successfully');
      form.reset({ content: '' });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message || 'Failed to send message');
    }
  };

  function onSuggestionClick(suggestion: string) {
    form.setValue('content', suggestion, { shouldValidate: true });
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 flex flex-col min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-6">Public Profile Link</h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full max-w-2xl mx-auto space-y-6"
        >
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {`Send an anonymous message to @${username}`}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Write your message here..."
                    className="resize-none w-full min-h-[100px]"
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center">
            <Button type="submit" disabled={!content?.trim()}>
              Send Message
            </Button>
          </div>
        </form>
      </Form>

      <section className="mt-10 w-full max-w-2xl mx-auto">
        <Button
          onClick={fetchSuggestions}
          disabled={loadingSuggestions}
          className="mb-2 "
        >
          {loadingSuggestions ? 'Fetching Suggestions...' : 'Suggest Messages'}
        </Button>
        <Card className="shadow rounded border border-gray-200 max-h-80 overflow-y-auto">
          <CardHeader>
            <CardTitle>Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {suggestions.length === 0 && !loadingSuggestions && (
              <p className="text-center text-gray-500">No suggestions available.</p>
            )}
            <div className="space-y-3">
              {suggestions.map((msg, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  onClick={() => onSuggestionClick(msg)}
                  className="w-full break-words text-left whitespace-pre-wrap p-3 h-fit"
                >
                  {msg}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
