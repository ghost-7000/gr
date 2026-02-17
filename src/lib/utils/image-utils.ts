/**
 * Resolves a product image path to a valid URL.
 * Handles:
 * 1. Full URLs (Supabase storage public URLs)
 * 2. Supabase storage paths (e.g., 'product_images/...')
 * 3. Local public asset paths (e.g., 'c1 (12).jpeg')
 */
export function getProductImageUrl(imagePath: string | null | undefined): string {
    if (!imagePath) return '/images/placeholder-product.png';

    // 1. If it's already a full URL (Supabase Public URL)
    if (imagePath.startsWith('http')) {
        return imagePath;
    }

    // 2. If it's a Supabase storage path (manually uploaded via our new logic)
    // We assume these reside in the 'products' bucket
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (imagePath.includes('/') && !imagePath.startsWith('/')) {
        return `${supabaseUrl}/storage/v1/object/public/products/${imagePath}`;
    }

    // 3. Fallback to local public/uploaded_img folder
    // Ensure we don't double slash
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;

    // Check if it's in public/products or public/uploaded_img based on some naming or legacy logic
    // But currently components use /uploaded_img/ prefix mostly
    return `/uploaded_img/${cleanPath}`;
}
