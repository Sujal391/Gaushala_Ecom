// "use client";

// import { useState, useEffect } from 'react';
// import { useRouter, useParams } from 'next/navigation';
// import { ShoppingCart, ArrowLeft, Plus, Minus } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import UserLayout from '../../components/layout/UserLayout';

// export default function ProductDetailPage() {
//   const router = useRouter();
//   const params = useParams();
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [quantity, setQuantity] = useState(1);
//   const [cart, setCart] = useState([]);

//   useEffect(() => {
//     loadProduct();
//     loadCart();
//     const interval = setInterval(loadProduct, 1000);
//     return () => clearInterval(interval);
//   }, [params.id]);

//   const loadProduct = () => {
//     const stored = localStorage.getItem('products');
//     if (stored) {
//       const products = JSON.parse(stored);
//       const foundProduct = products.find((p) => p.id === params.id);
//       if (foundProduct) {
//         setProduct(foundProduct);
//       } else {
//         router.push('/shop');
//       }
//     }
//     setLoading(false);
//   };

//   const loadCart = () => {
//     const stored = localStorage.getItem('cart');
//     if (stored) {
//       setCart(JSON.parse(stored));
//     }
//   };

//   const addToCart = () => {
//     const existingItem = cart.find(item => item.id === product.id);
//     let updatedCart;
    
//     if (existingItem) {
//       updatedCart = cart.map(item =>
//         item.id === product.id
//           ? { ...item, quantity: item.quantity + quantity }
//           : item
//       );
//     } else {
//       updatedCart = [...cart, { ...product, quantity }];
//     }
    
//     setCart(updatedCart);
//     localStorage.setItem('cart', JSON.stringify(updatedCart));
//     alert('Product added to cart!');
//   };

//   if (loading) {
//     return (
//       <UserLayout>
//         <div className="min-h-[60vh] flex items-center justify-center">
//           <div className="text-center">
//             <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
//             <p className="text-muted-foreground">Loading product...</p>
//           </div>
//         </div>
//       </UserLayout>
//     );
//   }

//   if (!product) {
//     return null;
//   }

//   return (
//     <UserLayout>
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <Button
//           variant="ghost"
//           onClick={() => router.push('/shop')}
//           className="mb-6 gap-2"
//         >
//           <ArrowLeft className="h-4 w-4" />
//           Back to Shop
//         </Button>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
//           {/* Product Image */}
//           <div className="aspect-square overflow-hidden rounded-lg bg-muted">
//             <img
//               src={product.image}
//               alt={product.name}
//               className="w-full h-full object-cover"
//             />
//           </div>

//           {/* Product Info */}
//           <div className="flex flex-col">
//             <div className="mb-4">
//               <span className="text-sm text-muted-foreground">{product.category}</span>
//               <h1 className="text-3xl sm:text-4xl font-bold mt-2 mb-4">{product.name}</h1>
//               <p className="text-3xl sm:text-4xl font-bold text-primary mb-4">
//                 ${product.price}
//               </p>
              
//               {product.stock > 0 ? (
//                 <div className="flex items-center gap-2 mb-6">
//                   <span className="h-2 w-2 rounded-full bg-green-500"></span>
//                   <span className="text-sm text-muted-foreground">
//                     {product.stock < 10 ? `Only ${product.stock} left in stock` : 'In Stock'}
//                   </span>
//                 </div>
//               ) : (
//                 <div className="flex items-center gap-2 mb-6">
//                   <span className="h-2 w-2 rounded-full bg-red-500"></span>
//                   <span className="text-sm text-red-500">Out of Stock</span>
//                 </div>
//               )}
//             </div>

//             {product.description && (
//               <div className="mb-6">
//                 <h3 className="font-semibold mb-2">Description</h3>
//                 <p className="text-muted-foreground">{product.description}</p>
//               </div>
//             )}

//             {/* Quantity Selector */}
//             {product.stock > 0 && (
//               <div className="mb-6">
//                 <label className="block text-sm font-medium mb-2">Quantity</label>
//                 <div className="flex items-center gap-3">
//                   <Button
//                     variant="outline"
//                     size="icon"
//                     onClick={() => setQuantity(Math.max(1, quantity - 1))}
//                     disabled={quantity <= 1}
//                   >
//                     <Minus className="h-4 w-4" />
//                   </Button>
//                   <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
//                   <Button
//                     variant="outline"
//                     size="icon"
//                     onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
//                     disabled={quantity >= product.stock}
//                   >
//                     <Plus className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             )}

//             {/* Add to Cart Button */}
//             <div className="flex flex-col sm:flex-row gap-3">
//               <Button
//                 size="lg"
//                 className="flex-1"
//                 disabled={product.stock === 0}
//                 onClick={addToCart}
//               >
//                 <ShoppingCart className="mr-2 h-5 w-5" />
//                 {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
//               </Button>
//               <Button
//                 size="lg"
//                 variant="outline"
//                 className="flex-1"
//                 onClick={() => router.push('/cart')}
//               >
//                 View Cart
//               </Button>
//             </div>

//             {/* Product Details */}
//             <Card className="mt-8">
//               <CardContent className="p-6">
//                 <h3 className="font-semibold mb-4">Product Details</h3>
//                 <div className="space-y-3 text-sm">
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Category:</span>
//                     <span className="font-medium">{product.category}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Availability:</span>
//                     <span className="font-medium">
//                       {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">SKU:</span>
//                     <span className="font-medium">#{product.id}</span>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </UserLayout>
//   );
// }