/**
 * Backend baglantisi olmadan anlam ifade etmeyen aksiyonlar icin ortak sunum.
 *
 * Bu butonlar tasarimda duruyor ama tiklandiginda yapacak bir isleri yok; bos bir
 * tiklama yerine devre disi birakilip nedeni ipucu olarak gosteriliyor. Ilgili
 * ozellik gelistirildiginde `disabled` ve `title` kaldirilip onClick baglanmali.
 */
export const PENDING_HINT = 'Bu islem backend baglantisindan sonra aktiflesecek';

/** Devre disi gorunumu icin ortak siniflar. */
export const PENDING_CLASS = 'disabled:opacity-40 disabled:cursor-not-allowed';
