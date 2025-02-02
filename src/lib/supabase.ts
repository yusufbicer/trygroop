import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hpcakdgajjdebtyustix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwY2FrZGdhampiZGVidHl1c3RpeCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzA5NzQ0NzY3LCJleHAiOjIwMjUzMjA3Njd9.Hs_GxEzEZXxJXtO9qAKxGvGsJ_LX_R_xUvwvlnGDGtY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);