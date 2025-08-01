'use client'
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { verifySchema } from '@/schemas/verifySchema';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

// how to extract the username from params
const VerifyPage = () => {
    const router = useRouter();
    const [isVerifying,setIsVerifying] = useState(false);
    const params = useParams<{username:string}>();
    const form = useForm<z.infer<typeof verifySchema>>({
        resolver: zodResolver(verifySchema),
    });

    const onSubmit = async(data:z.infer<typeof verifySchema>)=>{
        setIsVerifying(true);
        try{
            const response = await axios.post('/api/verify-code',{
                username: params.username,
                verifyCode: data.verifyCode,
            });

            toast.success(response.data.message);
            router.replace('/sign-in');
        }
        catch(error){
            console.error("Error in sign up",error);
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message || 'Error in verifying the user');
        }
        finally{
            setIsVerifying(false);
        }
    }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
            <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                Verify Your Account
            </h1>
            <p className="mb-4">Enter the verification code sent to your email</p>
            </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="verifyCode"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">
                {
                    isVerifying ? (
                        <>
                            <Loader2 className="animate-spin mr-2" />
                            Verifying...
                        </>
                    ): "Verify"
                }
            </Button>
          </form>
        </Form>
        </div>
    </div>
  )
}

export default VerifyPage