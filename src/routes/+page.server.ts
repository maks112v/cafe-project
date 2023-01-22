import { supabase } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load = (async () => {
	const { data: products, error } = await supabase.from('product').select('*');

	return {
		products
	};
}) satisfies PageServerLoad;
