import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hpcakdgajjdebtyustix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwY2FrZGdhampkZWJ0eXVzdGl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk3NDQ3NjcsImV4cCI6MjAyNTMyMDc2N30.Hs_GxEzEZXxJXtO9qAKxGvGsJ_LX_R_xUvwvlnGDGtY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);