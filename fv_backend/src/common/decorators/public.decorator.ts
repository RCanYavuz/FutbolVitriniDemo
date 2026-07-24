import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Global JWT guard'i devre disi birakir - kimlik dogrulama gerektirmeyen endpoint'ler icin. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
