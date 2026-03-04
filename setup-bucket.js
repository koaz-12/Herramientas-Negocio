import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://efyvyjqrldvwvtnpnenz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmeXZ5anFybGR2d3Z0bnBuZW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NTQzOTQsImV4cCI6MjA4MTIzMDM5NH0.1t8sNSLCGOrla3l-EQY0zHBdqorCRebGVv-Ii1eDqw8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupBucket() {
    const bucketName = 'product-media';
    console.log(`Chequeando bucket '${bucketName}'...`);

    // 1. OBTENER LISTA DE BUCKETS
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error("❌ Error al listar buckets:", listError.message);
        return;
    }

    const exists = buckets.find(b => b.name === bucketName);

    if (exists) {
        console.log(`✅ El bucket '${bucketName}' ya existe!`);
        console.log("Asegúrate manualmente en Supabase Panel > Storage > Policies, de que permita INSERT/SELECT a todos o a los usuarios autenticados.");
    } else {
        console.log(`⚠️ El bucket '${bucketName}' NO existe. Intentando crearlo automáticamente...`);
        const { error } = await supabase.storage.createBucket(bucketName, {
            public: true,
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm'],
            fileSizeLimit: 52428800 // 50MB limits
        });

        if (error) {
            console.error("❌ Error grave al crear el bucket. Posiblemente no tienes permisos de administrador (service_role) en este token. Mensaje: ", error.message);
            console.log("\n-> 🛠️ INSTRUCCIÓN PARA EL USUARIO: Debes ir a tu panel de Supabase -> Storage -> New Bucket. Nómbralo 'product-media' y hazlo 'Public'.");
        } else {
            console.log(`✅ ¡Bucket '${bucketName}' creado exitosamente!`);
        }
    }
}

setupBucket();
