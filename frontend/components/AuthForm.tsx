'use client';

import React, { useState } from 'react';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { authformSchema } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import { signIn, signUp } from '@/lib/actions/user.actions';
import { User, Session } from '@supabase/supabase-js';

type AuthUser = {
  user: User | null;
  session: Session | null;
} | null;

const AuthForm = ({ type }: { type: string }) => {
    const [user, setUser] = useState<AuthUser>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const formSchema = authformSchema(type);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            firstName: "",
            lastName: "",
            address: "",
            city: "",
            state: "",
            postalCode: "",
            dob: "",
        }
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        try {
            if (type === 'sign-up') {
                const { user: newUser, session } = await signUp(data);
                setUser({ user: newUser, session });
                router.push('/dashboard');
            }

            if (type === 'log-in') {
                const { user: loggedInUser, session } = await signIn({
                    email: data.email,
                    password: data.password,
                });
                if (session) {
                    setUser({ user: loggedInUser, session });
                    router.push('/dashboard');
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="auth-form">
            <header className="flex flex-col gap-5 md:gap-8">
                <div className="flex flex-col gap-1 md:gap-3">
                    <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
                        {user
                            ? 'Link Account'
                            : type === 'log-in'
                                ? 'Log In'
                                : 'Sign Up'
                        }
                    </h1>
                    <p className="text-16 font-normal text-gray-600">
                        {user
                            ? 'Link your account to get started'
                            : 'Please enter your details'
                        }
                    </p>
                </div>
            </header>
            {user ? (
                <div className='flex flex-col gap-4'>
                    {/* Link components would go here */}
                </div>
            ) : (
                <>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                            {type === 'sign-up' && (
                                <>
                                    <div className='flex gap-4'>
                                        <FormField
                                            control={form.control}
                                            name="firstName"
                                            render={({ field }) => (
                                                <div className="form-item">
                                                    <FormLabel className="form-label">
                                                        First Name
                                                    </FormLabel>
                                                    <div className="flex w-full flex-col">
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Enter your first name"
                                                                className="input-class"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="form-message mt-2" />
                                                    </div>
                                                </div>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="lastName"
                                            render={({ field }) => (
                                                <div className="form-item">
                                                    <FormLabel className="form-label">
                                                        Last Name
                                                    </FormLabel>
                                                    <div className="flex w-full flex-col">
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Enter your last name"
                                                                className="input-class"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="form-message mt-2" />
                                                    </div>
                                                </div>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <div className="form-item">
                                                <FormLabel className="form-label">
                                                    Address
                                                </FormLabel>
                                                <div className="flex w-full flex-col">
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter your Address"
                                                            className="input-class"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="form-message mt-2" />
                                                </div>
                                            </div>
                                        )}
                                    />
                                    <div className='flex gap-4'>
                                        <FormField
                                            control={form.control}
                                            name="city"
                                            render={({ field }) => (
                                                <div className="form-item">
                                                    <FormLabel className="form-label">
                                                        City
                                                    </FormLabel>
                                                    <div className="flex w-full flex-col">
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Example: Los Angeles"
                                                                className="input-class"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="form-message mt-2" />
                                                    </div>
                                                </div>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="state"
                                            render={({ field }) => (
                                                <div className="form-item">
                                                    <FormLabel className="form-label">
                                                        State
                                                    </FormLabel>
                                                    <div className="flex w-full flex-col">
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Example: CA"
                                                                className="input-class"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="form-message mt-2" />
                                                    </div>
                                                </div>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="postalCode"
                                            render={({ field }) => (
                                                <div className="form-item">
                                                    <FormLabel className="form-label">
                                                        Postal Code
                                                    </FormLabel>
                                                    <div className="flex w-full flex-col">
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Example: 90000"
                                                                className="input-class"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="form-message mt-2" />
                                                    </div>
                                                </div>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="dob"
                                        render={({ field }) => (
                                            <div className="form-item">
                                                <FormLabel className="form-label">
                                                    Date of Birth
                                                </FormLabel>
                                                <div className="flex w-full flex-col">
                                                    <FormControl>
                                                        <Input
                                                            placeholder="MM/DD/YYYY"
                                                            className="input-class"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="form-message mt-2" />
                                                </div>
                                            </div>
                                        )}
                                    />
                                </>
                            )}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <div className="form-item">
                                        <FormLabel className="form-label">
                                            Email
                                        </FormLabel>
                                        <div className="flex w-full flex-col">
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter your email"
                                                    className="input-class"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="form-message mt-2" />
                                        </div>
                                    </div>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <div className="form-item">
                                        <FormLabel className="form-label">
                                            Password
                                        </FormLabel>
                                        <div className="flex w-full flex-col">
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter your password"
                                                    className="input-class"
                                                    type="password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="form-message mt-2" />
                                        </div>
                                    </div>
                                )}
                            />
                            <div className='flex flex-col gap-4'>
                                <Button type="submit" disabled={isLoading} className='form-btn'>
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" /> &nbsp;
                                            Loading...
                                        </>
                                    ) : type === 'log-in'
                                        ? 'Log In' : 'Sign Up'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                    <footer className='flex justify-center gap-1'>
                        <p className='text-14 font-normal text-gray-600'>
                            {type === 'log-in'
                                ? "Don't have an account?"
                                : "Already have an account?"}
                        </p>
                        <Link href={type === 'log-in' ? '/sign-up' : '/log-in'} className='form-link'>
                            {type === 'log-in' ? 'Sign up' : 'Log In'}
                        </Link>
                    </footer>
                </>
            )}
        </section>
    );
};

export default AuthForm;