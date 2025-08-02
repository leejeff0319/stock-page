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
  const supabase = createClient();
  
  try {
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
          postal_code: userData.postalCode,
          dob: userData.dob,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
      },
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Sign up error:', error);
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

  // Get additional user data from the users table if needed
  const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user data:', error);
    return { ...user, metadata: user.user_metadata };
  }

  return { ...user, ...userData };
}