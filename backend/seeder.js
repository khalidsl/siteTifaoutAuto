/**
 * Seeder — Catalogue pièces TIFAOUT AUTO
 * Données issues du fichier catalogue_pieces.xlsx
 *
 * Usage: node backend/seeder.js
 */

const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const Product = require('./models/Product');

// ── Catalogue from catalogue_pieces.xlsx (Etage 1) ─────────────────────────
const cataloguePieces = [
  // ─── Régulateurs ────────────────────────────────────────────────────────
  {
    name: 'Durite carburant ROLLANT',
    reference: 'DURITE-ROLLANT-STAR',
    category: 'durite',
    brand: 'ROLLANT',
    description: 'Durite carburant (Star) ROLLANT pour circuits basse pression.',
    price: 150,
    stock: 1,
    isNewPart: true,
  },
  {
    name: 'Durite carburant 3.2x25MT ROLLANT',
    reference: '56265',
    category: 'durite',
    brand: 'ROLLANT',
    description: 'Durite carburant (Star) 3,2 x 25MT ROLLANT.',
    price: 180,
    stock: 1,
    isNewPart: true,
  },
  {
    name: 'Régulateur DCI',
    reference: '1111111129461',
    category: 'regulateur',
    brand: 'Multimarque',
    description: 'Régulateur DCI pour systèmes Common Rail.',
    price: 350,
    stock: 1,
    isNewPart: true,
  },
  {
    name: 'Régulateur Bosch',
    reference: '0928400825',
    category: 'regulateur',
    brand: 'Bosch',
    description: 'Régulateur de pression Bosch pour pompe haute pression.',
    price: 320,
    stock: 1,
    isNewPart: true,
  },
  {
    name: 'Régulateur DRV',
    reference: '03L 130 764A',
    category: 'regulateur',
    brand: 'VAG',
    description: 'Régulateur DRV (Druckregelventil) pour Volkswagen, Audi, Seat, Skoda.',
    compatibleVehicles: ['Volkswagen Golf', 'Volkswagen Passat', 'Audi A4 TDI', 'Seat Leon TDI'],
    price: 380,
    stock: 2,
    isNewPart: true,
  },
  {
    name: 'Régulateur ESS',
    reference: '9109-903ESS',
    category: 'regulateur',
    brand: 'Delphi',
    description: 'Régulateur pression ESS Delphi pour systèmes essence.',
    price: 290,
    stock: 1,
    isNewPart: true,
  },
  {
    name: 'Régulateur MG',
    reference: 'A2C59506225MG',
    category: 'regulateur',
    brand: 'Siemens/VDO',
    description: 'Régulateur Siemens MG pour pompes haute pression.',
    price: 340,
    stock: 1,
    isNewPart: true,
  },
  {
    name: 'Régulateur DENSO HE',
    reference: '1227602025HE',
    category: 'regulateur',
    brand: 'Denso',
    description: 'Régulateur haute énergie DENSO pour systèmes Common Rail.',
    price: 360,
    stock: 1,
    isNewPart: true,
  },
  {
    name: 'Régulateur Siemens IMV',
    reference: 'A2C8761150080IMV',
    category: 'regulateur',
    brand: 'Siemens',
    description: 'Régulateur IMV (Inlet Metering Valve) Siemens pour pompe haute pression.',
    price: 310,
    stock: 1,
    isNewPart: true,
  },
  {
    name: 'Régulateur Bosch',
    reference: '0928400826',
    category: 'regulateur',
    brand: 'Bosch',
    description: 'Régulateur de pression Bosch 0928400826 pour pompes CP1/CP3.',
    price: 330,
    stock: 1,
    isNewPart: true,
  },
  {
    name: 'Régulateur 300',
    reference: '291200-0300',
    category: 'regulateur',
    brand: 'Denso',
    description: 'Régulateur Denso 291200-0300 pour systèmes haute pression.',
    price: 370,
    stock: 1,
    isNewPart: true,
  },
  {
    name: 'Régulateur DENSO HE',
    reference: '1460A056',
    category: 'regulateur',
    brand: 'Denso',
    description: 'Régulateur haute énergie Denso 1460A056.',
    price: 355,
    stock: 1,
    isNewPart: true,
  },
  {
    name: 'Régulateur MG IMV',
    reference: '28233373IMV',
    category: 'regulateur',
    brand: 'Delphi',
    description: 'Régulateur IMV Delphi 28233373 pour pompes Delphi DFP.',
    price: 295,
    stock: 1,
    isNewPart: true,
  },
  {
    name: 'Régulateur Italy BM',
    reference: '0281002480',
    category: 'regulateur',
    brand: 'Bosch',
    description: 'Régulateur Bosch 0281002480 pour BMW et Mercedes.',
    compatibleVehicles: ['BMW 3 Series TDI', 'Mercedes-Benz C Class CDI'],
    price: 340,
    stock: 1,
    isNewPart: true,
  },
  // ─── Valves ─────────────────────────────────────────────────────────────
  {
    name: 'Boite de joints 28.58/38.1/6.35',
    reference: '28.58-38.1-6.35-4',
    category: 'joint',
    brand: 'Multimarque',
    description: 'Boîte de joints d\'étanchéité universelle dimensions 28.58 / 38.1 / 6.35 / 4. Lot de 10 pièces.',
    price: 280,
    stock: 10,
    isNewPart: true,
  },
  {
    name: 'Valve Piezo',
    reference: 'F00GX1700S',
    category: 'valve',
    brand: 'Bosch',
    description: 'Valve piezo-électrique Bosch F00GX1700S pour injecteurs piezo haute pression.',
    price: 890,
    stock: 0,
    isNewPart: true,
    remarque: 'Stock épuisé — réapprovisionnement en cours',
  },
  {
    name: 'Valve ESS',
    reference: '28653428-ESS',
    category: 'valve',
    brand: 'Delphi',
    description: 'Valve d\'injecteur ESS Delphi 28653428 pour systèmes essence.',
    price: 420,
    stock: 10,
    isNewPart: true,
  },
  {
    name: 'Valve DCI',
    reference: '389-1296011',
    category: 'valve',
    brand: 'Renault/Delphi',
    description: 'Valve d\'injecteur DCI pour moteurs Renault/Nissan.',
    compatibleVehicles: ['Renault Clio 1.5 dCi', 'Renault Megane 1.9 dCi', 'Nissan Qashqai 1.5 dCi'],
    price: 380,
    stock: 1,
    isNewPart: true,
  },
  {
    name: 'Valve T528A0IL',
    reference: 'T528A0IL',
    category: 'valve',
    brand: 'Multimarque',
    description: 'Valve T528A0IL pour injecteurs Common Rail multimanche.',
    price: 350,
    stock: 4,
    isNewPart: true,
  },
  {
    name: 'Valve T61S',
    reference: 'T61S',
    category: 'valve',
    brand: 'Multimarque',
    description: 'Valve T61S pour injecteurs Common Rail — grande compatibilité.',
    price: 340,
    stock: 12,
    isNewPart: true,
  },
  {
    name: 'Valve CAP Bosch',
    reference: 'F00VC01502',
    category: 'valve',
    brand: 'Bosch',
    description: 'Valve de commande d\'injecteur Bosch F00VC01502 — pièce d\'origine.',
    price: 480,
    stock: 2,
    isNewPart: true,
  },
  {
    name: 'Valve ESS (93082625)',
    reference: '93082625-C625',
    category: 'valve',
    brand: 'Siemens/Delphi',
    description: 'Valve ESS C625 / 93082625 pour injecteurs essence.',
    price: 310,
    stock: 8,
    isNewPart: true,
  },
  {
    name: 'Valve Delphi',
    reference: '28797897',
    category: 'valve',
    brand: 'Delphi',
    description: 'Valve d\'injecteur Delphi 28797897 pour systèmes Common Rail.',
    price: 395,
    stock: 6,
    isNewPart: true,
  },
  // ─── Pièces catalogue standard ──────────────────────────────────────────
  {
    name: 'Injecteur Common Rail Bosch',
    reference: '0 445 110 293',
    category: 'injecteur',
    brand: 'Bosch',
    description: "Injecteur diesel Common Rail reconditionné à neuf selon les normes Bosch. Chaque injecteur est entièrement démonté, nettoyé par ultrasons, équipé de pièces d'usure neuves, puis calibré et testé sur banc d'essai Bosch EPS 200.",
    compatibleVehicles: ['Peugeot 307 2.0 HDi 136ch', 'Citroën C4 2.0 HDi 138ch', 'Ford Focus 2.0 TDCi 136ch', 'Volvo S40 2.0 D 136ch'],
    price: 1850,
    oldPrice: 2200,
    stock: 3,
    isReconditioned: true,
  },
  {
    name: 'Injecteur Common Rail Delphi',
    reference: 'EJBR03001D',
    category: 'injecteur',
    brand: 'Delphi',
    description: "Injecteur Delphi EJBR reconditionné avec filtres neufs, aiguille et ressort de calibration remplacés. Débit et retour vérifiés sur 5 points de fonctionnement.",
    compatibleVehicles: ['Renault Megane II 1.9 dCi', 'Nissan Primera 1.9 dCi', 'Opel Vectra 1.9 CDTI'],
    price: 1650,
    oldPrice: 1950,
    stock: 2,
    isReconditioned: true,
  },
  {
    name: 'Injecteur Common Rail Denso',
    reference: '093400-8640',
    category: 'injecteur',
    brand: 'Denso',
    description: "Injecteur Denso reconditionné pour moteurs D-4D Toyota. Reconditionnement complet avec kit pièces d'usure Denso d'origine.",
    compatibleVehicles: ['Toyota HiLux 3.0 D-4D', 'Lexus IS 220d', 'Toyota Land Cruiser 3.0'],
    price: 1980,
    stock: 0,
    isReconditioned: true,
    remarque: 'Sur commande',
  },
  {
    name: 'Pompe Haute Pression CP3 Bosch',
    reference: '0 445 010 346',
    category: 'pompe',
    brand: 'Bosch',
    description: "Pompe haute pression Bosch CP3 reconditionnée. La pompe est entièrement démontée, pistons et cames contrôlés, joints haute pression remplacés, régulateur DRV reconditionné. Pression de refoulement testée de 250 à 1800 bar.",
    compatibleVehicles: ['BMW 3 Series 2.0d (E90)', 'BMW 5 Series 2.5d', 'Land Rover Freelander 2.2 TD4', 'Fiat Ducato 2.3 JTD'],
    price: 3200,
    oldPrice: 4100,
    stock: 2,
    isReconditioned: true,
  },
  {
    name: 'Pompe Haute Pression DFP Delphi',
    reference: '28389850',
    category: 'pompe',
    brand: 'Delphi',
    description: "Pompe Delphi DFP haute pression reconditionnée. Reconditionnement aux spécifications d'origine avec test complet sur banc Delphi.",
    compatibleVehicles: ['Ford Transit 2.2 TDCi', 'Ford Ranger 2.2 TDCi', 'Peugeot Boxer 2.2 HDi'],
    price: 2750,
    stock: 1,
    isReconditioned: true,
  },
  {
    name: 'Pochette Joints Pare-feu M22',
    reference: 'JF-UNI-M22',
    category: 'joint',
    brand: 'Multimarque',
    description: "Pochette de joints pare-feu haute température. Joints cuivre et acier inoxydable pour étanchéité parfaite entre injecteur et culasse. Résistance jusqu'à 850°C. Vendu par lot de 4.",
    compatibleVehicles: ['Universel — Injecteurs M22×1.5', 'Injecteurs M26×1.5'],
    price: 85,
    stock: 50,
    isNewPart: true,
  },
  {
    name: 'Capteur Pression Rail Bosch',
    reference: '0 281 006 122',
    category: 'capteur',
    brand: 'Bosch',
    description: "Capteur de pression de rail Bosch pour moteurs Common Rail. Mesure de pression de 0 à 1800 bar. Connecteur 3 broches standard.",
    compatibleVehicles: ['Volkswagen Golf V 1.9 TDI', 'Audi A4 1.9 TDI', 'Skoda Octavia 1.9 TDI', 'Seat Leon 1.9 TDI'],
    price: 420,
    oldPrice: 520,
    stock: 5,
    isNewPart: true,
  },
  {
    name: 'Régulateur Pression DRV Bosch',
    reference: '0 281 002 507',
    category: 'regulateur',
    brand: 'Bosch',
    description: "Régulateur de pression de rail (DRV) Bosch pour systèmes Common Rail. Contrôle la pression du rail de 300 à 1800 bar.",
    compatibleVehicles: ['Mercedes-Benz C 220 CDI', 'Mercedes-Benz E 220 CDI', 'Jeep Grand Cherokee 3.0 CRD'],
    price: 380,
    stock: 4,
    isNewPart: true,
  },
];

// ── Main seeder function ───────────────────────────────────────────────────
const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Remove duplicate references before inserting
    const existingRefs = await Product.distinct('reference');
    const toInsert = cataloguePieces.filter(p => !existingRefs.includes(p.reference));

    if (toInsert.length === 0) {
      console.log('ℹ️  All catalogue products already seeded. Nothing to add.');
    } else {
      const inserted = await Product.insertMany(toInsert);
      console.log(`✅ Seeded ${inserted.length} new products from catalogue_pieces.xlsx`);
      inserted.forEach(p => console.log(`   ➜ [${p.category}] ${p.name} (ref: ${p.reference})`));
    }

    const total = await Product.countDocuments();
    console.log(`\n📦 Total products in database: ${total}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeder error:', err.message);
    process.exit(1);
  }
};

seedProducts();
