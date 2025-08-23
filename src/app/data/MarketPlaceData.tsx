// marketplaceData.ts

export type Product = {
  id: string
  name: string
  category: string
  vendorBusiness: string
  vendorName: string
  vendorPhone: string
  images: string[]
  quantity: number
  price: number
  description: string
  createdAt: string // ISO date for sorting
}

export const products: Product[] = [
  {
    id: 'p1',
    name: 'Wireless Bluetooth Headphones',
    category: 'Electronics & Gadgets',
    vendorBusiness: 'TechWorld Store',
    vendorName: 'John Doe',
    vendorPhone: '1234567890',
    images: [
      '/images/profile2.jpg',
      '/images/abstract-geometric-shapes.png',
      '/images/abstract-geometric-shapes.png'
    ],
    quantity: 15,
    price: 59.99,
    description: 'High-quality wireless headphones with noise cancellation and 20 hours of battery life.',
    createdAt: '2025-08-10T10:30:00Z'
  },
  {
    id: 'p2',
    name: 'Men’s Casual Leather Shoes',
    category: 'Fashion & Apparel',
    vendorBusiness: 'UrbanStyle Wear',
    vendorName: 'Michael Smith',
    vendorPhone: '9876543210',
    images: [
      '/images/abstract-geometric-shapes.png',
      '/images/shoes2.jpg'
    ],
    quantity: 8,
    price: 89.99,
    description: 'Stylish and comfortable leather shoes suitable for both casual and semi-formal wear.',
    createdAt: '2025-08-11T08:15:00Z'
  },
  {
    id: 'p3',
    name: 'Non-stick Cookware Set',
    category: 'Home & Living',
    vendorBusiness: 'KitchenPro Supplies',
    vendorName: 'Sarah Johnson',
    vendorPhone: '1122334455',
    images: [
      '/images/abstract-geometric-shapes.png',
      '/images/cookware2.jpg'
    ],
    quantity: 12,
    price: 120.0,
    description: 'Premium non-stick cookware set with ergonomic handles and heat-resistant coating.',
    createdAt: '2025-08-12T07:00:00Z'
  },
  {
    id: 'p4',
    name: 'Organic Green Tea Pack',
    category: 'Food & Beverages',
    vendorBusiness: 'Nature’s Blend',
    vendorName: 'Emily Davis',
    vendorPhone: '2233445566',
    images: [
      '/images/abstract-geometric-shapes.png'
    ],
    quantity: 30,
    price: 14.99,
    description: 'Refreshing organic green tea sourced from the finest plantations.',
    createdAt: '2025-08-09T14:45:00Z'
  },
  {
    id: 'p5',
    name: 'Adjustable Dumbbell Set',
    category: 'Health & Wellness',
    vendorBusiness: 'FitZone Gear',
    vendorName: 'David Wilson',
    vendorPhone: '3344556677',
    images: [
      '/images/abstract-geometric-shapes.png',
      '/images/dumbbells2.jpg'
    ],
    quantity: 5,
    price: 249.99,
    description: 'Space-saving adjustable dumbbell set for versatile home workouts.',
    createdAt: '2025-08-08T12:00:00Z'
  },

  {
    id: 'p6',
    name: 'Digital Coffee Maker',
    category: 'Home & Living',
    vendorBusiness: 'BrewMasters',
    vendorName: 'Mark Lee',
    vendorPhone: '3344556677',
    images: [
      '/images/abstract-geometric-shapes.png',
      '/images/coffee-maker.jpg'
    ],
    quantity: 18,
    price: 65.0,
    description: 'Programmable coffee maker with a 12-cup capacity and automatic shut-off feature.',
    createdAt: '2025-08-13T14:45:00Z'
},
{
    id: 'p7',
    name: 'Wireless Ergonomic Mouse',
    category: 'Electronics & Gadgets',
    vendorBusiness: 'GadgetZone Inc.',
    vendorName: 'Chris Evans',
    vendorPhone: '4455667788',
    images: [
      '/images/abstract-geometric-shapes.png',
      '/images/mouse.jpg'
    ],
    quantity: 30,
    price: 29.99,
    description: 'Comfortable wireless mouse with an ergonomic design to reduce wrist strain.',
    createdAt: '2025-08-14T11:20:00Z'
},
{
    id: 'p8',
    name: 'Slim Fit Chinos',
    category: 'Fashion & Apparel',
    vendorBusiness: 'StyleCo Apparel',
    vendorName: 'Lisa Chen',
    vendorPhone: '5566778899',
    images: [
      '/images/abstract-geometric-shapes.png',
      '/images/chinos.jpg'
    ],
    quantity: 25,
    price: 55.0,
    description: 'Versatile slim-fit chinos made from breathable cotton blend fabric.',
    createdAt: '2025-08-14T16:00:00Z'
},
{
    id: 'p9',
    name: 'Robot Vacuum Cleaner',
    category: 'Home & Living',
    vendorBusiness: 'Smart Home Solutions',
    vendorName: 'Tom Harris',
    vendorPhone: '6677889900',
    images: [
      '/images/abstract-geometric-shapes.png',
      '/images/vacuum.jpg'
    ],
    quantity: 7,
    price: 250.0,
    description: 'Automated vacuum cleaner with smart mapping and app-controlled scheduling.',
    createdAt: '2025-08-15T08:45:00Z'
},
{
    id: 'p10',
    name: 'Portable Power Bank',
    category: 'Electronics & Gadgets',
    vendorBusiness: 'PowerUp Electronics',
    vendorName: 'Jessica Bell',
    vendorPhone: '7788990011',
    images: [
      '/images/abstract-geometric-shapes.png',
      '/images/power-bank.jpg'
    ],
    quantity: 40,
    price: 35.0,
    description: 'High-capacity power bank for charging smartphones and tablets on the go.',
    createdAt: '2025-08-15T13:00:00Z'
},
{
    id: 'p11',
    name: 'Unisex Hoodie',
    category: 'Fashion & Apparel',
    vendorBusiness: 'UrbanThreads',
    vendorName: 'David Kim',
    vendorPhone: '8899001122',
    images: [
      '/images/abstract-geometric-shapes.png',
      '/images/hoodie.jpg'
    ],
    quantity: 50,
    price: 40.0,
    description: 'Comfortable and stylish unisex hoodie made from soft cotton material.',
    createdAt: '2025-08-16T09:10:00Z'
},
{
    id: 'p12',
    name: 'Acoustic Guitar',
    category: 'Electronics & Gadgets',
    vendorBusiness: 'Music Makers',
    vendorName: 'Sophia Rodriguez',
    vendorPhone: '9900112233',
    images: [
      '/images/abstract-geometric-shapes.png',
      '/images/guitar.jpg'
    ],
    quantity: 5,
    price: 150.0,
    description: 'Full-size acoustic guitar, perfect for beginners and seasoned players alike.',
    createdAt: '2025-08-16T14:25:00Z'
},
{
    id: 'p13',
    name: 'Decorative Throw Pillow',
    category: 'Home & Living',
    vendorBusiness: 'Cozy Living Decor',
    vendorName: 'Ryan Cooper',
    vendorPhone: '0011223344',
    images: [
      '/images/abstract-geometric-shapes.png',
      '/images/pillow.jpg'
    ],
    quantity: 22,
    price: 25.0,
    description: 'Soft and stylish throw pillow to add a touch of comfort and color to your sofa.',
    createdAt: '2025-08-17T07:50:00Z'
}

]



// System-defined categories (master list)
export const MASTER_CATEGORIES = [
  'Electronics & Gadgets',
  'Phones & Accessories',
  'Computers & Tablets',
  'Audio & Headphones',
  'Smart Devices / Wearables',
  'Gaming & Consoles',
  'Fashion & Apparel',
  'Men’s Clothing',
  'Women’s Clothing',
  'Shoes',
  'Bags & Accessories',
  'Jewelry & Watches',
  'Home & Living',
  'Furniture',
  'Kitchenware & Dining',
  'Bedding & Decor',
  'Lighting & Fixtures',
  'Storage & Organization',
  'Beauty & Personal Care',
  'Skincare',
  'Makeup',
  'Hair Care & Styling',
  'Fragrances',
  'Personal Hygiene',
  'Food & Beverages',
  'Packaged Foods',
  'Fresh Produce',
  'Drinks & Alcohol',
  'Snacks & Confectionery',
  'Health & Wellness',
  'Supplements & Vitamins',
  'Medical Supplies',
  'Fitness Equipment',
  'Wellness Products',
  'Sports & Outdoors',
  'Activewear',
  'Outdoor Gear',
  'Exercise Equipment',
  'Camping & Hiking',
  'Baby, Kids & Toys',
  'Baby Care',
  'Kids Clothing',
  'Toys & Games',
  'Learning & Education',
  'Automotive & Tools',
  'Vehicle Parts & Accessories',
  'Car Care',
  'Power Tools',
  'Hand Tools',
  'Office & School Supplies',
  'Stationery',
  'Office Furniture',
  'Printers & Accessories',
]





// Vendor type definition and vendors data extracted from products
export type Vendor = {
  id: string
  businessName: string
  ownerName: string
  phone: string
  email: string
  address: string
  description: string
  categories: string[]
  totalProducts: number
  rating: number
  joinedDate: string
  isVerified: boolean
  logo: string
}

export const vendors: Vendor[] = [
  {
    id: "v1",
    businessName: "TechWorld Store",
    ownerName: "John Doe",
    phone: "1234567890",
    email: "john@techworld.com",
    address: "123 Tech Street, Silicon Valley, CA 94000",
    description: "Leading electronics retailer specializing in cutting-edge gadgets and accessories.",
    categories: ["Electronics & Gadgets"],
    totalProducts: 1,
    rating: 4.8,
    joinedDate: "2024-01-15T00:00:00Z",
    isVerified: true,
    logo: "/images/abstract-geometric-shapes.png",
  },
  {
    id: "v2",
    businessName: "UrbanStyle Wear",
    ownerName: "Michael Smith",
    phone: "9876543210",
    email: "michael@urbanstyle.com",
    address: "456 Fashion Ave, New York, NY 10001",
    description: "Contemporary fashion brand offering stylish apparel for modern urban lifestyle.",
    categories: ["Fashion & Apparel"],
    totalProducts: 1,
    rating: 4.6,
    joinedDate: "2024-02-20T00:00:00Z",
    isVerified: true,
    logo: "/images/vendors/urbanstyle-logo.png",
  },
  {
    id: "v3",
    businessName: "KitchenPro Supplies",
    ownerName: "Sarah Johnson",
    phone: "1122334455",
    email: "sarah@kitchenpro.com",
    address: "789 Culinary Blvd, Chicago, IL 60601",
    description: "Premium kitchen equipment and cookware for professional chefs and home cooks.",
    categories: ["Home & Living"],
    totalProducts: 1,
    rating: 4.9,
    joinedDate: "2024-01-10T00:00:00Z",
    isVerified: true,
    logo: "/images/vendors/kitchenpro-logo.png",
  },
  {
    id: "v4",
    businessName: "Nature's Blend",
    ownerName: "Emily Davis",
    phone: "2233445566",
    email: "emily@naturesblend.com",
    address: "321 Organic Way, Portland, OR 97201",
    description: "Organic food and beverage company committed to sustainable and healthy products.",
    categories: ["Food & Beverages"],
    totalProducts: 1,
    rating: 4.7,
    joinedDate: "2024-03-05T00:00:00Z",
    isVerified: true,
    logo: "/images/vendors/naturesblend-logo.png",
  },
  {
    id: "v5",
    businessName: "FitZone Gear",
    ownerName: "David Wilson",
    phone: "3344556677",
    email: "david@fitzone.com",
    address: "654 Fitness St, Miami, FL 33101",
    description: "High-quality fitness equipment and accessories for home and commercial gyms.",
    categories: ["Health & Wellness"],
    totalProducts: 1,
    rating: 4.5,
    joinedDate: "2024-02-28T00:00:00Z",
    isVerified: true,
    logo: "/images/vendors/fitzone-logo.png",
  },
  {
    id: "v6",
    businessName: "BrewMasters",
    ownerName: "Mark Lee",
    phone: "3344556677",
    email: "mark@brewmasters.com",
    address: "987 Coffee Lane, Seattle, WA 98101",
    description: "Coffee equipment specialists providing barista-quality machines for home use.",
    categories: ["Home & Living"],
    totalProducts: 1,
    rating: 4.8,
    joinedDate: "2024-01-25T00:00:00Z",
    isVerified: true,
    logo: "/images/vendors/brewmasters-logo.png",
  },
  {
    id: "v7",
    businessName: "GadgetZone Inc.",
    ownerName: "Chris Evans",
    phone: "4455667788",
    email: "chris@gadgetzone.com",
    address: "147 Innovation Dr, Austin, TX 73301",
    description: "Innovative tech accessories and peripherals for enhanced productivity.",
    categories: ["Electronics & Gadgets"],
    totalProducts: 1,
    rating: 4.6,
    joinedDate: "2024-03-12T00:00:00Z",
    isVerified: true,
    logo: "/images/vendors/gadgetzone-logo.png",
  },
  {
    id: "v8",
    businessName: "StyleCo Apparel",
    ownerName: "Lisa Chen",
    phone: "5566778899",
    email: "lisa@styleco.com",
    address: "258 Trendy Blvd, Los Angeles, CA 90210",
    description: "Contemporary clothing brand focusing on versatile and comfortable everyday wear.",
    categories: ["Fashion & Apparel"],
    totalProducts: 1,
    rating: 4.7,
    joinedDate: "2024-02-14T00:00:00Z",
    isVerified: true,
    logo: "/images/vendors/styleco-logo.png",
  },
  {
    id: "v9",
    businessName: "Smart Home Solutions",
    ownerName: "Tom Harris",
    phone: "6677889900",
    email: "tom@smarthome.com",
    address: "369 Future Ave, San Francisco, CA 94102",
    description: "Smart home automation devices and solutions for modern connected living.",
    categories: ["Home & Living"],
    totalProducts: 1,
    rating: 4.9,
    joinedDate: "2024-01-08T00:00:00Z",
    isVerified: true,
    logo: "/images/vendors/smarthome-logo.png",
  },
  {
    id: "v10",
    businessName: "PowerUp Electronics",
    ownerName: "Jessica Bell",
    phone: "7788990011",
    email: "jessica@powerup.com",
    address: "741 Energy St, Denver, CO 80201",
    description: "Portable power solutions and charging accessories for mobile devices.",
    categories: ["Electronics & Gadgets"],
    totalProducts: 1,
    rating: 4.5,
    joinedDate: "2024-03-01T00:00:00Z",
    isVerified: true,
    logo: "/images/vendors/powerup-logo.png",
  },
  {
    id: "v11",
    businessName: "UrbanThreads",
    ownerName: "David Kim",
    phone: "8899001122",
    email: "david@urbanthreads.com",
    address: "852 Street Style Ave, Brooklyn, NY 11201",
    description: "Urban streetwear brand creating comfortable and stylish casual clothing.",
    categories: ["Fashion & Apparel"],
    totalProducts: 1,
    rating: 4.4,
    joinedDate: "2024-02-18T00:00:00Z",
    isVerified: true,
    logo: "/images/vendors/urbanthreads-logo.png",
  },
  {
    id: "v12",
    businessName: "Music Makers",
    ownerName: "Sophia Rodriguez",
    phone: "9900112233",
    email: "sophia@musicmakers.com",
    address: "963 Melody Lane, Nashville, TN 37201",
    description: "Musical instruments and accessories for musicians of all skill levels.",
    categories: ["Electronics & Gadgets"],
    totalProducts: 1,
    rating: 4.8,
    joinedDate: "2024-01-30T00:00:00Z",
    isVerified: true,
    logo: "/images/vendors/musicmakers-logo.png",
  },
  {
    id: "v13",
    businessName: "Cozy Living Decor",
    ownerName: "Ryan Cooper",
    phone: "0011223344",
    email: "ryan@cozyliving.com",
    address: "159 Comfort Rd, Phoenix, AZ 85001",
    description: "Home decor and accessories to create warm and inviting living spaces.",
    categories: ["Home & Living"],
    totalProducts: 1,
    rating: 4.6,
    joinedDate: "2024-02-22T00:00:00Z",
    isVerified: true,
    logo: "/images/vendors/cozyliving-logo.png",
  },
]