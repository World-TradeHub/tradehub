import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Star, Shield } from 'lucide-react';
import { Product } from '@/types/Product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToggleFavorite } from '@/hooks/useToggleFavorite';

interface ProductCardProps {
  product: Product;
  className?: string;
  onFavoriteChange?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className, onFavoriteChange }) => {
  const toggleFavorite = useToggleFavorite();
  const [isFavorited, setIsFavorited] = React.useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onFavoriteChange) {
      onFavoriteChange();
    } else {
      setIsFavorited(!isFavorited);
    }
    // toggleFavorite.mutate({ productId: product.id!, isFavorited });
  };

  return (
    <Link 
      to={`/product/${product.id}`}
      className={cn("block group", className)}
    >
      <div className="bg-card rounded-xl shadow-card hover:shadow-elevated transition-all duration-300 overflow-hidden">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          {/* <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isFeatured && (
              <Badge variant="default" className="bg-gradient-primary text-xs text-white border-0 py-1">
                Featured
              </Badge>
            )}
            {product.condition === 'new' && (
              <Badge variant="secondary" className="bg-success text-success-foreground">
                New
              </Badge>
            )}
          </div> */}

          {/* Favorite Button */}
          {/* <Button
            size="sm"
            variant="ghost"
            className={cn(
              "absolute top-3 right-3 h-8 w-8 rounded-full bg-card/80 backdrop-blur-sm border-0 hover:bg-card",
              isFavorited && "text-destructive hover:text-destructive"
            )}
            onClick={handleFavoriteClick}
          >
            <Heart 
              size={16} 
              className={cn(isFavorited && "fill-current")} 
            />
          </Button> */}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-2">
            <h4 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors text-sm">
              {product.title}
            </h4>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-bold text-primary">
              {product.price} {product.currency}
            </span>
          </div>

          {/* Seller Info */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-300">
                {product.seller.username}
              </span>
              {product.seller.isVerified && (
                <Shield size={14} className="text-primary" />
              )}
            </div>
            {/* <div className="flex items-center gap-1">
              <Star size={12} className="text-warning fill-current" />
              <span className="text-sm text-muted-foreground">
                {product.seller.rating}
              </span>
            </div> */}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-black-300">
            <MapPin size={12} />
            <span className="text-xs text-300">{product.location}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};