'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// Type for sign-up data
export type SignUpData = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  dob?: string;
};

// Type for login data
export type LoginData = {
  email: string;
  password: string;
};

export async function signUp(userData: SignUpData) {
  console.log('Sign-up data received on server:', userData);
  const supabase = createClient();
  
  try {
    const formattedDob = userData.dob ? new Date(userData.dob).toISOString() : null;
    
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          address: userData.address,
          city: userData.city,
          state: userData.state,
          postal_code: userData.postalCode, // Note: using underscore
          dob: formattedDob,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
      },
    });

    console.log('SignUp response:', { data, error });
    
    if (error) {
      console.error('Sign up error details:', {
        message: error.message,
        status: error.status,
        cause: error.cause
      });
      throw error;
    }

    // Immediately check if public record was created
    if (data.user?.id) {
      const { data: publicUser, error: publicError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      console.log('Public user record check:', { publicUser, publicError });
    }

    return data;
  } catch (error) {
    console.error('Complete sign up error:', error);
    throw error;
  }
}

export async function signIn({ email, password }: LoginData) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Logout error:', error);
    throw error;
  }

  redirect('/log-in');
}

export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return { 
    ...user, 
    firstName: user.user_metadata.first_name, 
    lastName: user.user_metadata.last_name 
  };
}