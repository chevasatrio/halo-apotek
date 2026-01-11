<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        // 1. KATEGORI: DEMAM & NYERI
        // Keyword Frontend: paracetamol, ibuprofen, asam mefenamat, diclofenac, dll.
        $demamNyeri = [
            ['name' => 'Paracetamol 500mg Strip', 'price' => 3500],
            ['name' => 'Panadol Extra (Paracetamol)', 'price' => 13500],
            ['name' => 'Sanmol Sirup Paracetamol', 'price' => 21000],
            ['name' => 'Ibuprofen 400mg Tablet', 'price' => 6000],
            ['name' => 'Proris Ibuprofen Suspensi', 'price' => 32000],
            ['name' => 'Asam Mefenamat 500mg', 'price' => 5500],
            ['name' => 'Ponstan Asam Mefenamat', 'price' => 35000],
            ['name' => 'Bodrex Sakit Kepala (Paracetamol)', 'price' => 3000],
            ['name' => 'Sumagesic Paracetamol 600mg', 'price' => 4000],
            ['name' => 'Tempra Drops Paracetamol Anak', 'price' => 55000],
            ['name' => 'Cataflam Diclofenac 50mg', 'price' => 45000],
            ['name' => 'Voltaren Gel Diclofenac', 'price' => 65000],
        ];

        // 2. KATEGORI: VITAMIN & SUPLEMEN
        // Keyword Frontend: vitamin, suplemen, zinc, c, d, multivit
        $vitamin = [
            ['name' => 'Vitamin C IPI 50 Tablet', 'price' => 8000],
            ['name' => 'Enervon-C Multivitamin', 'price' => 7000],
            ['name' => 'Blackmores Vitamin C 500mg', 'price' => 135000],
            ['name' => 'CDR Vitamin C & Calcium', 'price' => 52000],
            ['name' => 'Holisticare Ester C (Vitamin)', 'price' => 60000],
            ['name' => 'Imboost Force Suplemen', 'price' => 85000],
            ['name' => 'Stimuno Forte Suplemen', 'price' => 35000],
            ['name' => 'Renovit Multivitamin', 'price' => 17000],
            ['name' => 'Vitamin D3 1000IU', 'price' => 90000],
            ['name' => 'Zinc Tablet 20mg', 'price' => 5000],
            ['name' => 'Fatigon Spirit Multivitamin', 'price' => 6500],
            ['name' => 'Sangobion Multivitamin & Iron', 'price' => 22000],
        ];

        // 3. KATEGORI: BATUK & FLU
        // Keyword Frontend: batuk, flu, pilek, obh, sirup
        $batukFlu = [
            ['name' => 'OBH Combi Batuk Berdahak', 'price' => 18000],
            ['name' => 'Siladex Batuk & Pilek', 'price' => 16000],
            ['name' => 'Komix Herbal Jahe (Sirup)', 'price' => 2500],
            ['name' => 'Vicks Formula 44 Sirup', 'price' => 24000],
            ['name' => 'Woods Peppermint Expectorant', 'price' => 26000],
            ['name' => 'Actifed Sirup Pilek & Batuk', 'price' => 70000],
            ['name' => 'Triaminic Batuk & Pilek Anak', 'price' => 75000],
            ['name' => 'Procold Flu & Batuk', 'price' => 4000],
            ['name' => 'Mixagrip Flu Tablet', 'price' => 3500],
            ['name' => 'Sanaflu Kaplet', 'price' => 3000],
            ['name' => 'Decolgen Flu & Batuk', 'price' => 3500],
            ['name' => 'Bisolvon Sirup Batuk', 'price' => 42000],
        ];

        // 4. KATEGORI: ANTIBIOTIK* (Butuh Resep)
        // Keyword Frontend: cillin, mycin, floxacin, cef, amoxic, cipro
        $antibiotik = [
            ['name' => 'Amoxicillin 500mg Generik', 'price' => 6000],
            ['name' => 'Amoxsan Amoxicillin 500mg', 'price' => 35000],
            ['name' => 'Cefadroxil 500mg Kapsul', 'price' => 13000],
            ['name' => 'Ciprofloxacin 500mg', 'price' => 9000],
            ['name' => 'Azithromycin 500mg Tablet', 'price' => 28000],
            ['name' => 'Cefixime 100mg Kapsul', 'price' => 32000],
            ['name' => 'Clindamycin 300mg', 'price' => 24000],
            ['name' => 'Levofloxacin 500mg', 'price' => 20000],
            ['name' => 'Erythromycin 500mg', 'price' => 16000],
            ['name' => 'Baquinor Ciprofloxacin', 'price' => 125000],
            ['name' => 'Zithromax (Azithromycin)', 'price' => 150000],
            ['name' => 'Cefspan (Cefixime) 100mg', 'price' => 180000],
        ];

        // 5. KATEGORI: LAINNYA
        // Nama tanpa keyword kategori di atas
        $lainnya = [
            ['name' => 'Insto Tetes Mata Regular', 'price' => 16000],
            ['name' => 'Betadine Antiseptik 30ml', 'price' => 27000],
            ['name' => 'Hansaplast Plester Luka', 'price' => 1500],
            ['name' => 'Minyak Kayu Putih Cap Lang 60ml', 'price' => 24000],
            ['name' => 'Tolak Angin Cair Sido Muncul', 'price' => 5000],
            ['name' => 'Salonpas Koyo Pereda Nyeri', 'price' => 8000],
            ['name' => 'Antimo Mabuk Perjalanan', 'price' => 6000],
            ['name' => 'Promag Obat Maag', 'price' => 9000],
            ['name' => 'Mylanta Cair Maag', 'price' => 48000],
            ['name' => 'Kalpanax Salep Gatal', 'price' => 14000],
            ['name' => 'Diapet Kapsul Diare', 'price' => 4000],
            ['name' => 'Oralit Bubuk', 'price' => 1000],
        ];

        // Gabungkan semua data
        $allProducts = array_merge($demamNyeri, $vitamin, $batukFlu, $antibiotik, $lainnya);

        $dataToInsert = [];
        foreach ($allProducts as $product) {
            $dataToInsert[] = [
                'name'        => $product['name'],
                'price'       => $product['price'],
                'stock'       => rand(10, 100), // Stok acak
                'image'       => null,          // Gambar kosong dulu
                'created_at'  => $now,
                'updated_at'  => $now,
                // description dihapus karena tidak ada di tabel
            ];
        }

        // Reset tabel (opsional, agar bersih) & Insert data
        // DB::table('products')->truncate(); // Uncomment jika ingin menghapus data lama
        DB::table('products')->insert($dataToInsert);
    }
}