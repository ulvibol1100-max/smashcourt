import { Link } from 'react-router-dom';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images?.[0]?.url || '/placeholder-racket.jpg';

  return (
    <Link to={`/products/${product.id}`} className="product-card group block">
      <div className="aspect-[3/4] bg-neutral-100 overflow-hidden mb-4">
        <img
          src={imageUrl.startsWith('http') ? imageUrl : `${import.meta.env.VITE_API_URL || ''}${imageUrl}`}
          alt={product.name}
          className="product-image w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x800/f5f5f5/0a0a0a?text=Racket'; }}
        />
      </div>
      <p className="font-mono-label text-neutral-500 mb-1">{product.brand}</p>
      <h3 className="font-heading text-lg mb-2 group-hover:text-accent transition-colors">{product.name}</h3>
      <p className="font-mono text-sm">${product.price.toFixed(2)}</p>
    </Link>
  );
}
