import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://efyvyjqrldvwvtnpnenz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmeXZ5anFybGR2d3Z0bnBuZW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NTQzOTQsImV4cCI6MjA4MTIzMDM5NH0.1t8sNSLCGOrla3l-EQY0zHBdqorCRebGVv-Ii1eDqw8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testKeys() {
    console.log("Testeando marketplace_products...");
    const { data, error } = await supabase.from('marketplace_products').select('id, name').limit(15);
    if (error) {
        console.error("Error:", error.message);
    } else {
        console.log("Muestras de IDs grabados:", data);
    }
}
testKeys();
